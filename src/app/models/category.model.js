import {connectTodb} from "../lib/connectDb";
import { BOOLEAN, DataTypes, JSONB, STRING } from 'sequelize';

export const categoryModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const categorymodel = connection.define('Category',
        {

            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name:{
                type: DataTypes.STRING,
                allowNull:false,
            },
            description:{
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

    return categorymodel;
}