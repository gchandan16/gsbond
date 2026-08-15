import { connectTodb } from "../lib/connectDb";
import { DataTypes } from 'sequelize';

export const quoteAssignModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const quoteassignmodel = connection.define('QuoteAssign',
        {

            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            quote_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            otherDetails: {
                type: DataTypes.STRING,
            },
            time: {
                type: DataTypes.STRING,
                defaultValue: new Date().toLocaleDateString(),
            },
            acceptStatus: {
                type: DataTypes.STRING,
                defaultValue: 'Pending', // pending, reject, accept
            },
            jobStatus: {
                type: DataTypes.STRING,
                defaultValue: 'Fresh', // fresh , ReClean
            },
            note: {
                type: DataTypes.STRING,
            },
            isCompleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            startTime: {
                type: DataTypes.STRING,
            },
            endTime: {
                type: DataTypes.STRING,
            },
            totalTimeTaken: {
                type: DataTypes.STRING,
            },
            specialRemark: {
                type: DataTypes.STRING,
            },
            specialImages: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            operatorAmount:{
                type:DataTypes.STRING,
            }
        },
    );


    await connection.sync({alter:true});

    return quoteassignmodel;
}