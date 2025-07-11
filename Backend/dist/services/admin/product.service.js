"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const db_1 = require("../../config/db");
const apiError_1 = require("../../utils/apiError");
const decimal_js_1 = require("decimal.js");
const date_fns_1 = require("date-fns");
const s3BucketService_1 = require("../common/s3BucketService");
class ProductService {
    buildProductData(data, code) {
        return {
            name: data.name,
            sku: data.sku,
            code,
            pct_or_hs_code: data.pct_or_hs_code,
            description: data.description,
            purchase_rate: data.purchase_rate,
            sales_rate_exc_dis_and_tax: data.sales_rate_exc_dis_and_tax,
            sales_rate_inc_dis_and_tax: data.sales_rate_inc_dis_and_tax,
            discount_amount: data.discount_amount ?? 0,
            min_qty: Number(data.min_qty) ?? 0,
            max_qty: Number(data.max_qty) ?? 0,
            is_active: data.is_active ?? true,
            display_on_pos: data.display_on_pos ?? true,
            is_batch: data.is_batch ?? false,
            auto_fill_on_demand_sheet: data.auto_fill_on_demand_sheet ?? false,
            non_inventory_item: data.non_inventory_item ?? false,
            is_deal: data.is_deal ?? false,
            is_featured: data.is_featured ?? false,
        };
    }
    buildRelationData(data) {
        const relations = {};
        const relationFields = [
            'unit_id', 'tax_id', 'category_id', 'subcategory_id',
            'supplier_id', 'brand_id', 'color_id', 'size_id'
        ];
        relationFields.forEach(field => {
            const value = data[field];
            if (value) {
                const relationName = field.split('_')[0];
                relations[relationName] = { connect: { id: value } };
            }
        });
        return relations;
    }
    buildRelationIncludes(data) {
        const includes = {};
        const relationFields = [
            'unit_id', 'tax_id', 'category_id', 'subcategory_id',
            'supplier_id', 'brand_id', 'color_id', 'size_id'
        ];
        relationFields.forEach(field => {
            if (data[field]) {
                const relationName = field.split('_')[0];
                includes[relationName] = true;
            }
        });
        return includes;
    }
    async createProduct(data) {
        // Validate SKU uniqueness and get last product code in parallel
        const [existingSku, lastProduct] = await Promise.all([
            db_1.prisma.product.findUnique({
                where: { sku: data.sku },
                select: { id: true }
            }),
            db_1.prisma.product.findFirst({
                orderBy: { created_at: 'desc' },
                select: { code: true }
            })
        ]);
        if (existingSku) {
            throw new apiError_1.AppError(400, 'Product with this SKU already exists');
        }
        const newCode = lastProduct ? (parseInt(lastProduct.code) + 1).toString() : '1000';
        // Start transaction for atomic operations
        return await db_1.prisma.$transaction(async (tx) => {
            // Create the product
            const product = await tx.product.create({
                data: {
                    ...this.buildProductData(data, newCode),
                    ...this.buildRelationData(data)
                },
                include: this.buildRelationIncludes(data)
            });
            return product;
        }, {
            maxWait: 20000, // 20 seconds
            timeout: 15000 // 15 seconds,
        });
    }
    async processProductImages(productId, files) {
        try {
            // 1. Upload images
            const imageUrls = await s3BucketService_1.s3Service.uploadMultipleImages(files);
            // 2. Create image records
            await db_1.prisma.productImage.createMany({
                data: imageUrls.map(url => ({
                    product_id: productId,
                    image: url,
                    status: 'COMPLETE'
                }))
            });
            // 3. Optional: Update product to indicate images are ready
            await db_1.prisma.product.update({
                where: { id: productId },
                data: { has_images: true }
            });
            console.log('Images processed successfully:', imageUrls);
        }
        catch (error) {
            const err = error;
            // Mark failed attempts
            await db_1.prisma.productImage.createMany({
                data: files.map(file => ({
                    product_id: productId,
                    image: `failed-${file.originalname}`, // Required field
                    status: 'FAILED',
                    error: err.message.substring(0, 255) // Truncate if needed
                }))
            });
            throw error;
        }
    }
    async getProductById(id) {
        const product = await db_1.prisma.product.findUnique({
            where: { id },
            include: {
                unit: true,
                category: true,
                subcategory: true,
                tax: true,
                supplier: true,
                brand: true,
                color: true,
                size: true,
                order_items: true,
            },
        });
        if (!product) {
            throw new apiError_1.AppError(404, 'Product not found');
        }
        return product;
    }
    async updateProduct(id, data) {
        const product = await this.getProductById(id);
        // Check if new SKU conflicts with existing
        if (data.sku && data.sku !== product.sku) {
            const existingSku = await db_1.prisma.product.findUnique({
                where: { sku: data.sku },
            });
            if (existingSku) {
                throw new apiError_1.AppError(400, 'Product with this SKU already exists');
            }
        }
        return db_1.prisma.product.update({
            where: { id },
            data: {
                // Scalar fields
                name: data.name,
                sku: data.sku,
                is_active: data.is_active,
                is_deal: data.is_deal,
                non_inventory_item: data.non_inventory_item,
                auto_fill_on_demand_sheet: data.auto_fill_on_demand_sheet,
                is_batch: data.is_batch,
                display_on_pos: data.display_on_pos,
                is_featured: data.is_featured,
                purchase_rate: data.purchase_rate !== undefined ? new decimal_js_1.Decimal(data.purchase_rate).toNumber() : undefined,
                sales_rate_exc_dis_and_tax: data.sales_rate_exc_dis_and_tax !== undefined ? new decimal_js_1.Decimal(data.sales_rate_exc_dis_and_tax).toNumber() : undefined,
                sales_rate_inc_dis_and_tax: data.sales_rate_inc_dis_and_tax !== undefined ? new decimal_js_1.Decimal(data.sales_rate_inc_dis_and_tax).toNumber() : undefined,
                discount_amount: data.discount_amount !== undefined ? new decimal_js_1.Decimal(data.discount_amount).toNumber() : undefined,
                // Relation fields using `connect`
                tax: data.tax_id ? { connect: { id: data.tax_id } } : undefined,
                size: data.size_id ? { connect: { id: data.size_id } } : undefined,
                color: data.color_id ? { connect: { id: data.color_id } } : undefined,
                supplier: data.supplier_id ? { connect: { id: data.supplier_id } } : undefined,
                unit: data.unit_id ? { connect: { id: data.unit_id } } : undefined,
                brand: data.brand_id ? { connect: { id: data.brand_id } } : undefined,
                subcategory: data.subcategory_id ? { connect: { id: data.subcategory_id } } : undefined,
                category: data.category_id ? { connect: { id: data.category_id } } : undefined,
            },
            include: {
                unit: true,
                category: true,
                subcategory: true,
                tax: true,
                supplier: true,
                brand: true,
                color: true,
                size: true,
            },
        });
    }
    async toggleProductStatus(id) {
        const product = await this.getProductById(id);
        return db_1.prisma.product.update({
            where: { id },
            data: { is_active: !product.is_active },
        });
    }
    async listProducts({ page = 1, limit = 10, search, category_id, subcategory_id, is_active = true, display_on_pos = true, }) {
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category_id) {
            where.category_id = category_id;
        }
        if (subcategory_id) {
            where.subcategory_id = subcategory_id;
        }
        if (is_active !== undefined) {
            where.is_active = is_active;
        }
        if (display_on_pos !== undefined) {
            where.display_on_pos = display_on_pos;
        }
        const [products, total] = await Promise.all([
            db_1.prisma.product.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    unit: true,
                    category: true,
                    subcategory: true,
                    size: true,
                    supplier: true,
                    brand: true,
                    color: true,
                    tax: true,
                    _count: {
                        select: { order_items: true },
                    },
                },
            }),
            db_1.prisma.product.count({ where }),
        ]);
        return {
            data: products.map(p => ({
                ...p,
                order_count: p._count.order_items,
                _count: undefined,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getFeaturedProducts() {
        // Fetch featured products from the database
        return await db_1.prisma.product.findMany({
            where: {
                is_featured: true,
                is_active: true,
            },
            orderBy: {
                created_at: "desc",
            },
            take: 10,
            include: {
                ProductImage: {
                    select: {
                        image: true,
                    },
                },
            },
        });
    }
    async getBestSellingProducts(limit = 10) {
        const startDate = (0, date_fns_1.startOfMonth)(new Date());
        const endDate = new Date();
        const bestSellingActiveProductsThisMonth = await db_1.prisma.product.findMany({
            where: {
                is_active: true,
                order_items: {
                    some: {
                        created_at: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                },
            },
            include: {
                _count: {
                    select: {
                        order_items: {
                            where: {
                                created_at: {
                                    gte: startDate,
                                    lte: endDate,
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                order_items: {
                    _count: 'desc',
                },
            },
            take: limit,
        });
        return bestSellingActiveProductsThisMonth;
    }
    async getProductByNameSearch(name) {
        const products = await db_1.prisma.product.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
                is_active: true,
            },
            include: {
                category: true,
            },
            orderBy: {
                created_at: "desc",
            },
            take: 10,
        });
        return products;
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map