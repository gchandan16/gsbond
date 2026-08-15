
import { connectTodb } from "../lib/connectDb.js";
import { DataTypes } from 'sequelize';

export const userModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const usermodel = connection.define('User',
        {

            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.STRING,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            phone: {
                type: DataTypes.STRING,
            },
            password: {
                type: DataTypes.STRING,
            },
            role: {
                type: DataTypes.ENUM,
                values: ['admin', 'operator'],
                default: 'operator'
            },
            isVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            token: {
                type: DataTypes.STRING,
            },
            otp: {
                type: DataTypes.STRING,
            },
            time: {
                type: DataTypes.STRING,
                defaultValue: new Date().toLocaleDateString(),
            },
            userDocument: {
                type: DataTypes.STRING,
                defaultValue: '',
            },
            documents: { type: DataTypes.JSON, defaultValue: [], },
            dateOfJoining: {
                type: DataTypes.DATE,
            },
            dateOfBirth: {
                type: DataTypes.DATE,
            },
            fcmToken: {
                type: DataTypes.STRING,
            },
            os: {
                type:DataTypes.STRING,
            },
            browser: {
                type:DataTypes.STRING,
            },
            device: {
                type:DataTypes.STRING,
            },
            ipAddress: {
                type:DataTypes.STRING,
            },
            operatorPercentage:{
                type:DataTypes.STRING,
            }
        }, {
        // indexes: [
        //     {
        //         unique: true,
        //         fields: ['email'],
        //     },
        // ]
    })


    await connection.sync({alter:true});

    return usermodel;
}