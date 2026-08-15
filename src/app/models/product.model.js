import {connectTodb} from "../lib/connectDb";
import { BOOLEAN, DataTypes, INTEGER, JSONB, STRING } from 'sequelize';

export const productModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const productmodel = connection.define('Product',
        {

            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            categoryId:{
                type: DataTypes.INTEGER,
                allowNull:false,
            },
            name:{
                type: DataTypes.STRING,
                allowNull:false,
            },
            description:{
                type: DataTypes.STRING,
            },
            base:{
                type: DataTypes.FLOAT,
            },
            price:{
                type: DataTypes.FLOAT,
            },
            gst:{
                type: DataTypes.STRING,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            time: {
                type: DataTypes.STRING,
                defaultValue: new Date().toLocaleDateString(),
            }
        })


    await connection.sync();

    return productmodel;
}