import { Request, Response } from 'express';
import { CategoryService } from '../../services/admin/category.service';
import { ApiResponse } from '../../utils/apiResponse';
import asyncHandler from '../../middleware/asyncHandler';

const categoryService = new CategoryService();

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  new ApiResponse(category, 'Category created successfully', 201).send(res);
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(req.params.id);
  new ApiResponse(category, 'Category retrieved successfully').send(res);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  new ApiResponse(category, 'Category updated successfully').send(res);
});

export const toggleCategoryStatus = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.toggleCategoryStatus(req.params.id);
  new ApiResponse(null, 'Category status changed successfully').send(res);
});

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, is_active, branch_id } = req.query;

  const result = await categoryService.listCategories({
    page: Number(page),
    limit: Number(limit),
    search: search as string | undefined,
    is_active: is_active ? is_active === 'true' : undefined,
    branch_id: branch_id as string | undefined,
  });

  new ApiResponse(result.data, 'Categories retrieved successfully', 200).send(res);
});