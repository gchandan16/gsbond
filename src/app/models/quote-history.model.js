import { connectTodb } from "../lib/connectDb";
import { BOOLEAN, DataTypes, STRING } from 'sequelize';

export const quoteHistoryModel = async () => {
    const connection = await connectTodb();
    if (!connection) {
        return null;
    }

    const quotehistorymodel = connection.define('QuoteHistory',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            quote_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.INTEGER,
            },
            action_type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            remark: {
                type: DataTypes.STRING,
            },
            ip_address: {
                type: DataTypes.STRING,
            }
        }, {
        timestamps: true
    });


    await connection.sync({alter:true});

    return quotehistorymodel;
} 