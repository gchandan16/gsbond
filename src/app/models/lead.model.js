import { connectTodb } from "../lib/connectDb";
import { DataTypes } from "sequelize";

export const leadModel = async () => {

    const connection = await connectTodb();

    if (!connection) {
        return null;
    }

    const leadmodel = connection.define(
        "leads",
        {
            id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },

            externalData: {
                type: DataTypes.JSONB,
                allowNull: true,
            },

            status: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },

            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            movedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            quoteId: {
                type: DataTypes.BIGINT,
                allowNull: true,
            },
        },
        {
            tableName: "Leads",
            schema: "public",
            timestamps: false,
        }
    );

    await connection.sync();

    return leadmodel;
};