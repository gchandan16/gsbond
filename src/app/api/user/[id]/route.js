import { asyncHandler } from "../../../utils/asyncHandler";
import { AppError } from "../../../utils/errorHandler";
import { validateRequest } from "../../../utils";
import { successResponse } from "../../../utils/response";
import { getModels } from "../../../models";
import { logModel } from "../../../models/log.model"
import path from "path";
import fs from "fs";

export const PUT = asyncHandler(async (req, { params }) => {
    // validate request
    const user2 = validateRequest(req, "user", "edit");

    const { usermodel } = await getModels();
    if (!usermodel) throw new AppError("User model not initialised", 500);

    const { id } = await params;
    if (!id) throw new AppError("User ID is required", 400);

    // ── 1. Parse multipart FormData ──────────────────────────────────────────
    const formData = await req.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const role = formData.get("role");
    const dateOfJoining = formData.get("dateOfJoining") || null;
    const dateOfBirth = formData.get("dateOfBirth") || null;
    const operatorPercentage = formData.get("operatorPercentage") || null;

    // ── 2. Check user exists ─────────────────────────────────────────────────
    const user = await usermodel.findByPk(id);
    if (!user) throw new AppError("User not found", 404);

    // ── 3. Parse documents array from FormData ───────────────────────────────
    // Frontend sends: documents[0][name], documents[0][file], documents[1][name], ...
    const documentsMap = {};

    for (const [key, value] of formData.entries()) {
        // Match keys like: documents[0][name] or documents[0][file]
        const match = key.match(/^documents\[(\d+)\]\[(\w+)\]$/);
        if (!match) continue;

        const index = match[1];
        const field = match[2]; // "name" or "file"

        if (!documentsMap[index]) documentsMap[index] = {};
        documentsMap[index][field] = value;
    }

    // ── 4. Save uploaded files to /public/uploads/documents ─────────────────
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const savedDocuments = [];

    for (const doc of Object.values(documentsMap)) {
        const docName = doc.name || "untitled";
        const file = doc.file; // File object from FormData

        let filePath = null;

        if (file && typeof file === "object" && file.size > 0) {
            const ext = path.extname(file.name) || ".bin";
            const fileName = `${id}_${docName.replace(/\s+/g, "_")}_${Date.now()}${ext}`;
            const fullPath = path.join(uploadDir, fileName);

            // Write file to disk
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(fullPath, buffer);

            filePath = `/uploads/documents/${fileName}`; // public URL path
        }

        savedDocuments.push({ name: docName, file: filePath });
    }

    // console.log("savedDocuments",typeof(savedDocuments), savedDocuments);

    // ── 5. Update user in DB ─────────────────────────────────────────────────
    await user.update({
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(dateOfJoining && { dateOfJoining }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(operatorPercentage && { operatorPercentage }),
        // Only update documents if any were sent
        ...(savedDocuments.length > 0 && { documents: savedDocuments }),
    });





    const logmodel = await logModel();
    await logmodel.create({
        userId: user2.id,
        role: user2.role,
        name: user2.name,
        email: user2.email,
        activity: "Update User",
    })




    return successResponse(
        user.get({ plain: true }),
        "User updated successfully",
        200
    );
});


export const DELETE = asyncHandler(async (req, { params }) => {
    // validate request
    const user2 = validateRequest(req, "user", "delete");

    const { usermodel } = await getModels();
    if (!usermodel) throw new AppError("User model not initialised", 500);

    const { id } = await params;
    if (!id) throw new AppError("User ID is required", 400);

    const user = await usermodel.findByPk(id);
    if (!user) throw new AppError("User not found", 404);


    // ── 5. Update user in DB ─────────────────────────────────────────────────
    await user.destroy({ where: { id: id } })


    const logmodel = await logModel();

    await logmodel.create({
        userId: user2.id,
        role: user2.role,
        name: user2.name,
        email: user2.email,
        activity: "delete User",
    })

    return successResponse(
        user.get({ plain: true }),
        "User Deleted successfully",
        200
    );
});