import { DataTypes } from "sequelize";
import { connectTodb } from "../lib/connectDb";


export const notificationModel = async()=>{
    const connection = await connectTodb();

    if(!connection) return null;

    const notificationmodel = connection.define('notification',
        {
            id:{
                type:DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id:{
                type:DataTypes.INTEGER,
            },
            read:{
                type:DataTypes.BOOLEAN,
                defaultValue:false,
            },
            title:{
                type:DataTypes.STRING,
            },
            description:{
                type:DataTypes.STRING,
            },
        },{timestamps:true}
    )

    await connection.sync({alter:true});

    return notificationmodel;
}