import {connectTodb} from "../lib/connectDb";
import { BOOLEAN, DataTypes, STRING } from 'sequelize';

export const logModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const logmodel = connection.define('Log',
        {

            id: {

                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: DataTypes.STRING,
            },
            role: {
                type: DataTypes.STRING
            },
            name: {
                type: DataTypes.STRING
            },
            email: {
                type: DataTypes.STRING
            },
            activity: {
                type: DataTypes.STRING,
                allowNull: false
            },
            time: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue:Date.now().toLocaleString()
            }
        })


    await connection.sync({});

    return logmodel;
}