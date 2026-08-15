import {connectTodb} from "../lib/connectDb";
import { BOOLEAN, DataTypes, STRING } from 'sequelize';

export const invoiceModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const invoicemodel = connection.define('Invoice',
        {

            id: {

                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            QuoteId: {
                type: DataTypes.INTEGER,
            },
            createdBy: {
                type: DataTypes.STRING // email
            },
            QuoteData: {
                type: DataTypes.TEXT
            },
            time: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue:Date.now().toLocaleString()
            }
        })


    await connection.sync({});

    return invoicemodel;
}