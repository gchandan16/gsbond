import { asyncHandler } from "../../../utils/asyncHandler";
import { AppError } from "../../../utils/errorHandler";
import { successResponse } from "../../../utils/response";
import { validateRequest } from "../../../utils";
import { getModels } from "../../../models";

// Update product controller
export const PUT = asyncHandler(async (req, { params }) => {
  const user = validateRequest(req, "products", "edit");

  const { categorymodel } = await getModels();
  const { productmodel ,logmodel} = await getModels();

  if (!categorymodel || !productmodel) {
    throw new AppError("Category and Product Model Not Initialised", 400);
  }

  const { id } = await params;
  if (!id) throw new AppError("Product ID is required", 400);

  const { name, description, status, price, categoryId,gst,base } = await req.json();

  const existingProduct = await productmodel.findByPk(id);
  if (!existingProduct) throw new AppError("Product not found", 404);

  const updatedProduct = await existingProduct.update({
    name: name ?? existingProduct.name,
    price: price ?? existingProduct.price,
    gst: gst ?? existingProduct.gst,
    base: base ?? existingProduct.base,
    description: description ?? existingProduct.description,
    status: status !== undefined ? status : existingProduct.status,
    categoryId: categoryId ?? existingProduct.categoryId,
  });



      await logmodel.create({
          userId: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
          activity: "Update Product",
      })

  return successResponse(updatedProduct, "Product updated successfully", 200);
});


//Get product by ID
export const GET = asyncHandler(async (req, { params }) => {
  validateRequest(req, "products", "view");

  const { categorymodel } = await getModels();
  const { productmodel } = await getModels();

  if (!categorymodel || !productmodel) {
    throw new AppError("Category and Product Model Not Initialised", 400);
  }

  const { id } = await params;
  if (!id) throw new AppError("Product ID is required", 400);

  const product = await productmodel.findByPk(id, {
    attributes: ["id", "name", "description", "status", "price", "categoryId", "createdAt", "updatedAt"],
    include: [
      {
        model: categorymodel,
        as: "category",
        attributes: ["id", "name", "description"],
      },
    ],
  });

  if (!product) throw new AppError("Product not found", 404);

  return successResponse(product, "Product fetched successfully", 200);
});



// Delete the Product
export const DELETE = asyncHandler(async (req, { params }) => {

  const user =  validateRequest(req, "products", "delete");

  const { categorymodel } = await getModels();
  const { productmodel,logmodel } = await getModels();

  if (!categorymodel || !productmodel) {
    throw new AppError("Category and Product Model Not Initialised", 400);
  }

  const { id } =await params;
  if (!id) throw new AppError("Product ID is required", 400);

  const product = await productmodel.findByPk(id);
  if (!product) throw new AppError("Product not found", 404);

  await product.destroy();


      await logmodel.create({
          userId: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
          activity: "Delete Product",
      })

  return successResponse(null, "Product deleted successfully", 200);
});



