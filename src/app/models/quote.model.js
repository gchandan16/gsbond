
import { connectTodb } from "../lib/connectDb";
import { BOOLEAN, DataTypes, STRING } from 'sequelize';

export const quoteModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const quotemodel = connection.define('Quote',
        {

            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            quoteID: {
                type: DataTypes.STRING,
                defaultValue: Date.now(),
            },
            name: {
                type: DataTypes.STRING,
            },
            email: {
                type: DataTypes.STRING,
                required: true,
            },
            phone: {
                type: DataTypes.STRING,
            },
            address: {
                type: DataTypes.STRING,
            },
            zip: {
                type: DataTypes.STRING,
            },
            status: {
                type: DataTypes.ENUM,
                values: ['Pending', 'Approved', 'Cancelled', "Hot-lead", "Cold-lead", "Initiated", "Assigned"],
                defaultValue: 'Cold-lead',
            },
            approvedDate: {
                type: DataTypes.STRING,
            },
            otherDetails: {
                type: DataTypes.STRING,
            },
            services: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            advanceAmount: {
                type: DataTypes.STRING,
            },
            dueAmount: {
                type: DataTypes.STRING,
            },
            calculatedAmount: {
                type: DataTypes.STRING
            },
            quotatedAmount: {
                type: DataTypes.STRING
            },
            beforeImages: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            afterImages: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: [],
            },
            time: {
                type: DataTypes.STRING,
                defaultValue: new Date().toLocaleDateString(),
            },
            scheduledDate: {
                type: DataTypes.STRING,
            },
            jobStatus: {
                type: DataTypes.STRING,
                defaultValue: "Pending"
            },
            isDeleted: {
                type: BOOLEAN,
                defaultValue: false,
            },
            remark: {
                type: DataTypes.TEXT,
                defaultValue: '',
            },
            paymentStatus: {
                type: STRING,
                defaultValue: 'Pending' // 'Pending' ,'paid'
            },
            shareToken: {
                type: DataTypes.STRING
            },
            sessionId: {
                type:DataTypes.STRING,
            },
            deviceInfo: {
                type:DataTypes.STRING,
            },
            ipAddress: {
                type:DataTypes.STRING,
            },
            suburbs: {
                type:DataTypes.STRING,
            },
        })


    await connection.sync();

    return quotemodel;
}