import { asyncHandler } from "../../../utils/asyncHandler";
import { handleError, AppError } from "../../../utils/errorHandler";
import { successResponse, errorResponse } from "../../../utils/response";

import { validateRequest } from "../../../utils"
import { models } from "../../../models/index.js";
import { ApiError } from "next/dist/server/api-utils";
import { Op } from "sequelize";

//update category controller
export const PUT = asyncHandler(async (req, { params }) => {

    // validate request
    const user = validateRequest(req, "category", "edit");

    const categorymodel = await models.categoryModel();
    if (!categorymodel) {
        throw new ApiError("Category Model No Initialised", 400);
    }

    const { id } = await params;
    console.log("id",id);
    if (!id) throw new AppError("Category ID is required", 400);

    const { name, description, status } = await req.json();


    const existingCategory = await categorymodel.findByPk(id);
    if (!existingCategory) throw new AppError("Category not found", 404);
    
    const updatedCategory = await existingCategory.update({
        name: name ?? existingCategory.name,
        description: description ?? existingCategory.description,
        status: status !== undefined ? status : existingCategory.status,
    });


    const logmodel = await models.logModel();
    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: "Update Category",
    })
    return successResponse(updatedCategory, "Category updated successfully", 200);
})



//delete category
export const DELETE = asyncHandler(async (req, { params }) => {
 
  const user = validateRequest(req, "category", "delete");

  const categorymodel = await models.categoryModel();
  if (!categorymodel) throw new AppError("Category Model Not Initialized", 400);

  const { id } =await params;
  if (!id) throw new AppError("Category ID is required", 400);

  const category = await categorymodel.findByPk(id);
  if (!category) throw new AppError("Category not found", 404);

  await category.destroy();


   const logmodel = await models.logModel();
    await logmodel.create({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        activity: "Delete Category",
    })

  return successResponse(null, "Category deleted successfully", 200);
});



//get category

export const GET = asyncHandler(async (req, { params }) => {
  validateRequest(req, "category", "view");

  const categorymodel = await models.categoryModel();
  if (!categorymodel) throw new AppError("Category Model Not Initialized", 400);

  const { id } =await params;
  if (!id) throw new AppError("Category ID is required", 400);

  const category = await categorymodel.findByPk(id, {
    attributes: ["id", "name", "description", "status", "createdAt", "updatedAt"],
  });

  if (!category) throw new AppError("Category not found", 404);

  return successResponse(category, "Category fetched successfully", 200);
});
