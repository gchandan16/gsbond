import { asyncHandler } from "../../utils/asyncHandler"
import { AppError } from "../../utils/errorHandler"

import { errorResponse, successResponse } from "../../utils/response";
import { validateRequest } from "../../utils";

import { getModels } from "../../models";
import { invoiceModel } from "../../models/invoice.model"




export const POST = asyncHandler(async (req, res) => {

    const user = validateRequest(req,"quote","view");

    const invoicemodel = await invoiceModel();
    const { quotehistorymodel } = await getModels();

    const form = await req.json();

    // console.log(form);

    const saveInvoice = await invoicemodel.create({
        QuoteId: form.data.id,
        QuoteData: JSON.stringify(form.data),
    })

    if (!saveInvoice) {
        errorResponse("Quote invoice save failed");
    }

    await quotehistorymodel.create({
        quote_id: form.data.id,
        user_id: user.id,
        action_type: "INVOICE_ADDED",
        remark: "Quote invoice Generated",
    })


    return successResponse("Quote Invoice Generated successfully", 200);

})


export const GET = asyncHandler(async (req, res) => {

    // const user = validateRequest(req, "invoice", "download");

    const invoicemodel = await invoiceModel();

    const data = await invoicemodel.findAll();

    if (!data || data.length == 0) {
        errorResponse("Invoice Data Not Found !!!", 400);
    }

    const parsedData = data.map(item => ({
        ...item.dataValues, // if using Sequelize
        QuoteData: JSON.parse(item.QuoteData)
    }));


    return successResponse(parsedData,"Invoice Data fetched successfully");
})