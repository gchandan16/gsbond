import {connectTodb} from "../lib/connectDb.js";
import { BOOLEAN, DataTypes, JSONB, STRING } from 'sequelize';

export const permissionModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const permissionmodel = connection.define('Permission',
        {

            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            role: {
                type: DataTypes.STRING,
            },
            permissions: {
                type: JSONB,
                allowNull: false,
                defaultValue: {},
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

    return permissionmodel;
}