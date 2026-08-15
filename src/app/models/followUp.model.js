import {connectTodb} from "../lib/connectDb";
import { BOOLEAN, DataTypes, JSONB, STRING } from 'sequelize';

export const followUpModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const followupmodel = connection.define('FollowUp',
        {

            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            quote_id:{
                type: DataTypes.INTEGER,
            },
            reminderDate:{
                type: DataTypes.DATE,
            },
            reminderTime:{
                type: DataTypes.TIME,
            },
            priority:{
                type: DataTypes.STRING,
            },
            note:{
                type: DataTypes.TEXT,
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


    await connection.sync({});

    return followupmodel;
}