import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';
import prisma from '../../prisma/client';
import { AppError } from '../../utils/apiError';

class OrderService {
  async createOrder(
    data: {
      items: Array<{ productId: string; quantity: number }>;
      paymentMethod?: PaymentMethod;
      customerId: string; // required for customer order
    },
  ) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const productIds = data.items.map(item => item.productId);

      // Fetch active products
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          is_active: true,
        },
      });

      if (products.length !== data.items.length) {
        throw new AppError(400, 'One or more products not found or inactive');
      }

      // Fetch stock from any branch
      const stockRecords = await tx.stock.findMany({
        where: {
          product_id: { in: productIds },
          current_quantity: { gte: 1 },
        },
      });

      // Ensure all products are available in the same branch
      const branchFrequency: Record<string, number> = {};
      for (const stock of stockRecords) {
        branchFrequency[stock.branch_id] = (branchFrequency[stock.branch_id] || 0) + 1;
      }

      const selectedBranchId = Object.entries(branchFrequency).find(
        ([_, count]) => count === data.items.length
      )?.[0];

      if (!selectedBranchId) {
        throw new AppError(400, 'All items must be available in a single branch');
      }

      let totalAmount = new Prisma.Decimal(0);
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
      const stockUpdates = [];
      const stockMovements = [];

      for (const item of data.items) {
        const product = products.find(p => p.id === item.productId);
        const stock = stockRecords.find(s => s.product_id === item.productId && s.branch_id === selectedBranchId);

        if (!product || !stock) {
          throw new AppError(400, `Stock not found for product ${item.productId}`);
        }

        if (stock.current_quantity < item.quantity) {
          throw new AppError(400, `Insufficient stock for product ${product.name}`);
        }

        const itemTotal = new Prisma.Decimal(product.sales_rate_inc_dis_and_tax).times(item.quantity);
        totalAmount = totalAmount.plus(itemTotal);

        orderItems.push({
          product: { connect: { id: product.id } },
          quantity: item.quantity,
          price: product.sales_rate_inc_dis_and_tax,
          total_price: itemTotal,
        });

        stockUpdates.push(tx.stock.update({
          where: {
            product_id_branch_id: {
              product_id: product.id,
              branch_id: selectedBranchId,
            },
          },
          data: {
            current_quantity: { decrement: item.quantity },
          },
        }));

        stockMovements.push(tx.stockMovement.create({
          data: {
            product: { connect: { id: product.id } },
            branch: { connect: { id: selectedBranchId } },
            movement_type: 'SALE',
            quantity_change: -item.quantity,
            previous_qty: stock.current_quantity,
            new_qty: stock.current_quantity - item.quantity,
          },
        }));
      }

      // Execute stock updates and movements before creating order and sale
      await Promise.all([...stockUpdates, ...stockMovements]);

      const order = await tx.order.create({
        data: {
          order_number: `ORD-${Date.now()}`,
          branch: { connect: { id: selectedBranchId } },
          customer: { connect: { id: data.customerId } },
          total_amount: totalAmount,
          status: 'PENDING',
          payment_method: data.paymentMethod || 'CASH',
          items: { create: orderItems },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      const sale = await tx.sale.create({
        data: {
          sale_number: `SALE-${Date.now()}`,
          branch: { connect: { id: selectedBranchId } },
          customer: { connect: { id: data.customerId } },
          subtotal: totalAmount,
          total_amount: totalAmount,
          payment_method: data.paymentMethod || 'CASH',
          payment_status: 'PAID',
          status: 'COMPLETED',
          sale_items: {
            create: orderItems.map(item => ({
              product: item.product,
              quantity: item.quantity,
              unit_price: item.price,
              line_total: item.total_price,
            })),
          },
        },
      });

      return { order, sale };
    }, {
      maxWait: 10000,
      timeout: 15000
    });
  }

  async getUserOrders(customerId: string, status?: string) {
    return prisma.order.findMany({
      where: {
        customer_id: customerId,
        status: status ? (status as OrderStatus) : undefined,
      },
      orderBy: { created_at: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getUserOrder(customerId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    if (order.customer_id !== customerId) {
      throw new AppError(403, 'Unauthorized to access this order');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    if (order.status === 'CANCELLED') {
      throw new AppError(400, 'Cannot update a cancelled order');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  async cancelOrder(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!order) throw new AppError(404, 'Order not found');
      if (order.status === 'CANCELLED') throw new AppError(400, 'Already cancelled');
      if (order.status === 'COMPLETED') throw new AppError(400, 'Cannot cancel completed');

      for (const item of order.items) {
        await tx.stock.update({
          where: {
            product_id_branch_id: {
              product_id: item.product_id,
              branch_id: order.branch_id!,
            },
          },
          data: {
            current_quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });
    });
  }

}

export { OrderService };
