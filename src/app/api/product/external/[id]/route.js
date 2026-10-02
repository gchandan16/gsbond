import { asyncHandler } from "../../../../utils/asyncHandler";
import { AppError } from "../../../../utils/errorHandler";
import { successResponse } from "../../../../utils/response";
import { createOrGetExternalProducts } from "../../../../utils/externalProduct";
import { getModels } from "../../../../models";
import { Op } from "sequelize";
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

  // 3. Fetch Products by IDs &Get External category

const externalCategory = await categorymodel.findOne({
    where: {
        name: "External"
    },
    attributes: ["id"]
});


// 4. Fetch current lead products + all non-External products
const products = await productmodel.findAll({

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
        status: true,

        [Op.or]: [
            // Current lead products
            {
                id: {
                    [Op.in]: productIds
                }
            },

            // All products whose category is NOT External
            {
                categoryId: {
                    [Op.ne]: externalCategory.id
                }
            }
        ]
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