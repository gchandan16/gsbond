export async function createOrGetExternalProducts(
    lead,
    categorymodel,
    productmodel
) {
    console.log("===== createOrGetExternalProducts START =====");

    // ==========================================
    // 1. Get External Category
    // ==========================================

    const externalCategory =
        await categorymodel.findOne({
            where: {
                name: "External"
            },
            attributes: [
                "id",
                "name",
                "description"
            ]
        });

    if (!externalCategory) {
        console.log( "ERROR: External category not found");

        throw new AppError("External category not found",404);
    }


    // ==========================================
    // 2. Get Lead JSON
    // ==========================================

    const leadData =lead.toJSON();

    const bondCleaningDetails = leadData.externalData  ?.bondCleaningDetails || {};


    const {
        suburb,
        bedroom,
        bathRoom,
        postcode,
        furnished,
        houseType,
        livingArea,
        stateRegion,

        gardeningService,
        removalistService,

        extras
    } = bondCleaningDetails;


    console.log("Bond Cleaning Details:", bondCleaningDetails);


    // ==========================================
    // 3. Build Product Names
    // ==========================================

    const productNames = [];


    // ------------------------------------------
    // PRODUCT 1: PEST
    // ------------------------------------------

    if (extras?.pest === true) {

        productNames.push("Pest");

    }


    // ------------------------------------------
    // PRODUCT 2: CARPET
    // ------------------------------------------

    if (extras?.carpet === true) {

        productNames.push("Carpet");

    }


    // ------------------------------------------
    // PRODUCT 3: PROPERTY
    // ------------------------------------------

    const propertyParts = [];

    if (bedroom) {
    propertyParts.push(`bedroom-${bedroom}`);
}

if (bathRoom) {
    propertyParts.push(`bathRoom-${bathRoom}`);
}

if (furnished) {
    propertyParts.push(`furnished-${furnished}`);
}

if (houseType) {
    propertyParts.push(`houseType-${houseType}`);
}

if (livingArea) {
    propertyParts.push(`livingArea-${livingArea}`);
}


    if (propertyParts.length > 0) {

        productNames.push(
            propertyParts.join(" - ")
        );

    }


    // ------------------------------------------
    // PRODUCT 4: GARDENING
    // ------------------------------------------

    if (gardeningService === true) {

        productNames.push("Gardening");

    }


    // ------------------------------------------
    // PRODUCT 5: REMOVALIST
    // ------------------------------------------

    if (removalistService === true) {

        productNames.push("Removalist");

    }


    console.log(
        "PRODUCT NAMES:",
        productNames
    );


    // ==========================================
    // 4. Find/Create Products
    // ==========================================

    const productIds = [];


    for (const productName of productNames) {

        console.log(
            "Checking Product:",
            productName
        );


        // --------------------------------------
        // Search existing product
        // --------------------------------------

        let product =
            await productmodel.findOne({
                where: {
                    name: productName,

                    categoryId:
                        externalCategory.id
                }
            });


        // --------------------------------------
        // Product exists
        // --------------------------------------

        if (product) {

            console.log(
                "PRODUCT EXISTS:",
                product.id,
                product.name
            );

        }


        // --------------------------------------
        // Product doesn't exist
        // --------------------------------------

        else {

            console.log(
                "PRODUCT NOT FOUND:",
                productName
            );


            product =
                await productmodel.create({
                    name: productName,
                    categoryId: externalCategory.id,
                    status: true,
                    price: 600,
                    gst: 0,
                    description: productName,
                    base: 0
                });


            console.log(
                "NEW PRODUCT CREATED:",product.id
            );

        }


        productIds.push(
            product.id
        );

    }


    // ==========================================
    // 5. Remove duplicate IDs
    // ==========================================

    const uniqueProductIds =
        [...new Set(productIds)];


    console.log("FINAL PRODUCT IDS:",uniqueProductIds);


    // ==========================================
    // 6. Return
    // ==========================================

    return {
        category:
            externalCategory,

        productIds:
            uniqueProductIds
    };
}