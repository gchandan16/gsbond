import { asyncHandler } from "../../../../utils/asyncHandler";
import { AppError } from "../../../../utils/errorHandler";
import { successResponse } from "../../../../utils/response";
import { createOrGetExternalProducts } from "../../../../utils/externalProduct";
import { getModels } from "../../../../models";

export const GET = asyncHandler(async (req, { params }) => {

    console.log("===== EXTERNAL API START =====");

    const { id } = await params;

    console.log("ExternalData ID:", id);

    if (!id) {
        throw new AppError("External Data ID is required", 400);
    }

    const { leadmodel ,categorymodel,productmodel} = await getModels();

    if (!leadmodel) {
        throw new AppError(
            "ExternalQuote Model Not Initialised",
            400
        );
    }

    console.log("===== LEAD DEBUG =====");



    // Fetch ExternalData by ID
    const externalData = await leadmodel.findByPk(id);
    

    console.log("ExternalData:", externalData ? externalData.toJSON() : null);

    if (!externalData) {
        throw new AppError(
            "External Quote not found",
            404
        );
    }


 // 2. Create/Get External Products
    const {category,productIds} =  await createOrGetExternalProducts(
                                        externalData,
                                        categorymodel,
                                        productmodel
                                    );

  // 3. Fetch Products by IDs
     const products =
        await productmodel.findAll({

            attributes: [
                "id",
                "name",
                "createdAt",
                "price",
                "categoryId",
                "status",
                "gst",
                "description",
                "base"
            ],

            where: {
                id: productIds,
                status: true
            },

            order: [
                ["id", "DESC"]
            ],

            include: [
                {
                    model: categorymodel,

                    as: "category",

                    attributes: [
                        "id",
                        "name",
                        "description"
                    ]
                }
            ]

        });


    console.log(
        "FINAL PRODUCTS:",
        products.map(
            product => product.toJSON()
        )
    );                                  



   return successResponse({
        lead: externalData,
        products: products
    }, "External Quote Found Successfully", 200);



});