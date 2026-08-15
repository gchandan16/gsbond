import {asyncHandler} from "../../utils/asyncHandler";

import {successResponse,errorResponse} from "../../utils/response";



import { validateRequest } from "../../utils"

import {clientModel} from "../../models/client.mdel"



export const GET = asyncHandler(async(req)=>{
    // validate request
    // const user = validateRequest(req,"client","view");

    const clientmodel = await clientModel();

    if(!clientmodel) return errorResponse("Client model not initialised !!!",400);

    
    const { searchParams } = new URL(req.url);
    
    const id = searchParams.get("id");
    const limit = searchParams.get("limit");
    
    let where = {}

    if(limit){
        where.limit = limit;
    }

    if(id){
        where.id = id;
    }

    const data = await clientmodel.findAll({
        where,
        limit: limit ? Number(limit) : undefined,
        attributes: ["id", "name", "email", "phone", "address", "status", "createdAt"],
    });

    return successResponse(data,"Data fetched successfully",200);
})