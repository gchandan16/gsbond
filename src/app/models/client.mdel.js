import {connectTodb} from "../lib/connectDb";
import { BOOLEAN, DataTypes, JSONB, STRING } from 'sequelize';

export const clientModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const clientmodel = connection.define('Client',
        {

            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            clientId:{
                type:DataTypes.STRING,
            },
            name:{
                type: DataTypes.STRING,
                allowNull:false,
            },
            email:{
                type: DataTypes.STRING,
                allowNull:false,
                unique:true
            },
            phone:{
                type: DataTypes.STRING,
            },
            address:{
                type: DataTypes.STRING,
            },
            zip:{
                type: DataTypes.STRING,
            },
            role:{
                type: DataTypes.STRING,
            },
            suburbs:{
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


    await connection.sync({alter:true});

    return clientmodel;
}