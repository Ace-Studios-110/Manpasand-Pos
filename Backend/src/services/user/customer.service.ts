import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { AppError } from '../../utils/apiError';
import jwt from 'jsonwebtoken';
import { convertToSeconds } from '../../utils/convertToSeconds';
import { config } from '../../config/app';

class CustomerService {
    private generateToken(cusId: Prisma.CustomerCreateInput['id'], email: Prisma.CustomerCreateInput['email']): string {
        const token = jwt.sign(
            {
                email: email,
                id: cusId
            },
            config.jwtSecret,
            {
                expiresIn:
                    typeof config.jwtExpiresIn === 'string'
                        ? convertToSeconds(config.jwtExpiresIn)
                        : config.jwtExpiresIn,
            },
        );

        return token;
    }

    private async verifyCustomerExistance(email: string): Promise<boolean> {
        const customer = await prisma.customer.findFirst({
            where: {
                email: email,
            },
        });
        if (customer) return true;
        return false;
    }

    public async createCustomer(data: Prisma.CustomerCreateInput) {
        const customerExists = await this.verifyCustomerExistance(data.email);
        if (customerExists) {
            throw new AppError(400, 'Customer already exists');
        }

        const customer = await prisma.customer.create({
            data: data,
        });

        const token = this.generateToken(customer.id, customer.email!);

        return {
            email: customer.email,
            token,
        };
    }

    public async getCustomerById(customerId: string) {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) {
            throw new AppError(404, 'Customer not found');
        }

        return customer;
    }

    public async getCustomers(search?: string) {
        return prisma.customer.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { phone_number: { contains: search } },
                    ],
                }
                : undefined,
            orderBy: { created_at: 'desc' },
        });
    }
}

export default CustomerService;