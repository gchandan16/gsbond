import { asyncHandler } from "../../../utils/asyncHandler";
import { AppError } from "../../../utils/errorHandler";
import { successResponse } from "../../../utils/response";
import { validateRequest } from "../../../utils";
import { getModels } from "../../../models";



import fs from "fs";
import path from "path";




// UPDATE quote controller
export const PUT = asyncHandler(async (req, { params }) => {

  const user = validateRequest(req, "quote", "edit");

  const { quotemodel, quotehistorymodel, logmodel } = await getModels();

  if (!quotemodel) throw new AppError("Quote model not initialized", 400);
  if (!quotehistorymodel) throw new AppError("Quote history model not initialized", 400);

  const { id } = await params;
  if (!id) throw new AppError("Quote ID is required", 400);

  const { name, email, phone, address, zip, services, status, scheduledDate, jobStatus, quotatedAmount, calculatedAmount, advanceAmount,suburbs } = await req.json();

  const existingQuote = await quotemodel.findByPk(id);
  if (!existingQuote) throw new AppError("Quote not found", 404);

  let amount = existingQuote.calculatedAmount;

  if (services && Array.isArray(services)) {
    amount = services.reduce((sum, item) => sum + (Number(item.quotedPrice) || 0), 0);
  }
  const approvedDate = status === 'Approved' && !existingQuote.approvedDate
    ? new Date().toISOString()
    : existingQuote.approvedDate ?? '';

  const updatedQuote = await existingQuote.update({
    name: name ?? existingQuote.name,
    email: email ?? existingQuote.email,
    phone: phone ?? existingQuote.phone,
    address: address ?? existingQuote.address,
    zip: zip ?? existingQuote.zip,
    services: services ?? existingQuote.services,
    calculatedAmount: calculatedAmount,
    quotatedAmount: quotatedAmount,
    advanceAmount: advanceAmount,
    dueAmount: quotatedAmount - advanceAmount,
    approvedDate: approvedDate,
    status: status ?? existingQuote.status,
    jobStatus: jobStatus ?? existingQuote.jobStatus,
    scheduledDate: scheduledDate,
    suburbs: suburbs ?? existingQuote.suburbs,
  });


  const oldStatus = existingQuote.status;
  const oldJobStatus = existingQuote.jobStatus;
  const oldAmount = existingQuote.quotatedAmount;
  let remarks = [];

  if (status && status !== oldStatus) {
    remarks.push(`Status updated from ${oldStatus} to ${status}`);
  }

  if (jobStatus && jobStatus !== oldJobStatus) {
    remarks.push(`Job status updated from ${oldJobStatus} to ${jobStatus}`);
  }

  if (
    quotatedAmount !== undefined &&
    quotatedAmount !== oldAmount
  ) {
    remarks.push(
      `Quote amount updated from ${oldAmount} to ${quotatedAmount}`
    );
  }

  const finalRemark =
    remarks.length > 0 ? remarks.join(", ") : "Quote updated";

  await quotehistorymodel.create({
    quote_id: updatedQuote.id,
    user_id: user.id,
    action_type: "QUOTE_UPDATED",
    remark: finalRemark
  });




  await logmodel.create({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    activity: "Update Quote",
  })

  return successResponse(updatedQuote, "Quote updated successfully", 200);
});


// get one

export const GET = asyncHandler(async (req, { params }) => {

  const user = validateRequest(req, "quote", "view");

  const { quotemodel, quotehistorymodel, usermodel } = await getModels();

  if (!quotemodel) throw new AppError("Quote model not initialized", 400);
  // if (!quotehistorymodel) throw new AppError("Quote history model not initialized", 400);
  if (!usermodel) throw new AppError("User model not initialized", 400);

  const { id } = await params;
  if (!id) throw new AppError("Quote ID is required", 400);

  const quote = await quotemodel.findByPk(id, {
    attributes: [
      "id",
      "name",
      "email",
      "phone",
      "address",
      "zip",
      "services",
      "calculatedAmount",
      "quotatedAmount",
      "dueAmount",
      "advanceAmount",
      "status",
      "createdAt",
      "updatedAt",
      "suburbs",
      "quotationType",
      "cleaningType",
      "source",
    ],
    // include: [
    //   {
    //     model: quotehistorymodel,
    //     as: "quoteHistory", // must match your association
    //     attributes: ["id", "status", "remark", "createdAt"],
    //     include: [
    //       {
    //         model: usermodel,
    //         as: "user",
    //         attributes: ["id", "name", "email"],
    //       },
    //     ],
    //   },
    // ],
  });

  if (!quote) throw new AppError("Quote not found", 404);

  return successResponse(quote, "Quote fetched successfully", 200);
});


//delete

export const DELETE = asyncHandler(async (req, { params }) => {

  const user = validateRequest(req, "quote", "delete");

  const { quotemodel, quotehistorymodel, logmodel } = await getModels();

  if (!quotemodel) throw new AppError("Quote model not initialized", 400);
  if (!quotehistorymodel) throw new AppError("Quote history model not initialized", 400);

  const { id } = await params;
  if (!id) throw new AppError("Quote ID is required", 400);

  const quote = await quotemodel.findByPk(id);
  if (!quote) throw new AppError("Quote not found", 404);

  quote.isDeleted = true;
  await quote.save();

  await quotehistorymodel.create({
    quote_id: quote.id,
    user_id: user.id,
    action_type: "QUOTE_DELETED",
    remark: "Quote Deleted"
  });


  await logmodel.create({
    userId: user.id,
    role: user.role,
    email: user.email,
    activity: "Delete Quote",
  })

  return successResponse(null, "Quote deleted successfully", 200);
});


// add images
// before And after both
export const POST = asyncHandler(async (req, { params }) => {
  // ✅ get user from token
  const user = validateRequest(req, "assignedQuote", "edit");

  const { id } = await params;
  const formData = await req.formData();

  const files = formData.getAll("files");
  const name = formData.get("name");   // "before" or "after"

  if (!files || files.length === 0) {
    throw new AppError("No files uploaded", 400);
  }

  // ✅ correct destructure — capital names from getModels()
  const { quotemodel, quotehistorymodel, logmodel } = await getModels();

  const quote = await quotemodel.findByPk(id);
  if (!quote) throw new AppError("Quote not found", 404);

  // Save files to disk
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uploadedFiles = [];
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    uploadedFiles.push(`/uploads/${fileName}`);
  }

  // ✅ update — where in second argument, not inside data
  if (name === "before") {
    const updatedImages = [...(quote.beforeImages || []), ...uploadedFiles];
    await quotemodel.update(
      { beforeImages: updatedImages, status: "Approved" },    // ✅ data
      { where: { id } }                  // ✅ options
    );
  } else if (name === "after") {
    const updatedImages = [...(quote.afterImages || []), ...uploadedFiles];
    await quotemodel.update(
      { afterImages: updatedImages, status: "Approved" },     // ✅ data
      { where: { id } }                  // ✅ options
    );
  } else {
    throw new AppError("name must be 'before' or 'after'", 400);
  }

  // ✅ user is now defined from validateRequest
  // await quotehistorymodel.create({
  //   quote_id: id,
  //   user_id: user.id,
  //   action_type: "IMAGES_ADDED",
  //   remark: `${name == "after" ? "After" : "Before"} Jobs Images Added`,
  // });


  return successResponse(uploadedFiles, "Files uploaded successfully", 200);
});