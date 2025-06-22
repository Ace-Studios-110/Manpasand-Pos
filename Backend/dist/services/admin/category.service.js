"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const db_1 = require("../../config/db");
const apiError_1 = require("../../utils/apiError");
class CategoryService {
    async createCategory(data) {
        const [existingSlug, lastCategory] = await Promise.all([
            db_1.prisma.category.findUnique({
                where: { slug: data.slug },
            }),
            db_1.prisma.category.findFirst({
                orderBy: { created_at: 'desc' },
                select: { code: true },
            }),
        ]);
        if (existingSlug) {
            throw new apiError_1.AppError(400, 'Category with this slug already exists');
        }
        // Generate new code
        const newCode = lastCategory
            ? (parseInt(lastCategory.code) + 1).toString()
            : '1000';
        // First create without code
        const category = await db_1.prisma.category.create({
            data: {
                ...data,
                code: newCode, // Temporary empty value
                display_on_branches: data.display_on_branches || [],
            },
        });
        return category;
    }
    async getCategoryById(id) {
        const category = await db_1.prisma.category.findUnique({
            where: { id },
            include: {
                branch: true,
                products: {
                    where: { is_active: true },
                    select: { id: true, name: true },
                },
            },
        });
        if (!category) {
            throw new apiError_1.AppError(404, 'Category not found');
        }
        return category;
    }
    async updateCategory(id, data) {
        const category = await this.getCategoryById(id);
        // Check if new slug conflicts with existing
        if (data.slug && data.slug !== category.slug) {
            const existingSlug = await db_1.prisma.category.findUnique({
                where: { slug: data.slug },
            });
            if (existingSlug) {
                throw new apiError_1.AppError(400, 'Category with this slug already exists');
            }
        }
        return db_1.prisma.category.update({
            where: { id },
            data: {
                ...data,
                display_on_branches: data.display_on_branches || category.display_on_branches,
            },
        });
    }
    async toggleCategoryStatus(id) {
        const category = await this.getCategoryById(id);
        return db_1.prisma.category.update({
            where: { id },
            data: { is_active: !category.is_active },
        });
    }
    async listCategories({ page = 1, limit = 10, search, is_active, branch_id, }) {
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (is_active !== undefined) {
            where.is_active = is_active;
        }
        if (branch_id) {
            where.branch_id = branch_id;
        }
        const [categories, total] = await Promise.all([
            db_1.prisma.category.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    branch: {
                        select: { id: true, name: true, code: true },
                    },
                    _count: {
                        select: { products: true },
                    },
                },
            }),
            db_1.prisma.category.count({ where }),
        ]);
        return {
            data: categories.map(c => ({
                ...c,
                product_count: c._count.products,
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
    async getCategories() {
        // Fetch categories from the database
        return await db_1.prisma.category.findMany({
            where: {
                is_active: true,
            },
            orderBy: {
                created_at: "desc",
            },
            take: 10,
        });
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=category.service.js.map