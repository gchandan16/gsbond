// src/app/models/index.js
import { userModel } from "./user.model";
import { permissionModel } from "./permission.model";
import { quoteModel } from "./quote.model";
import { quoteHistoryModel } from "./quote-history.model";
import { quoteAssignModel } from "./quote-assign.model";
import { logModel } from "./log.model";
import { categoryModel } from "./category.model";
import { productModel } from "./product.model";
import { followUpModel } from "./followUp.model"
import {notificationModel} from "./notification.model.js"

// ✅ Cache initialized models so associations are only defined once
let initializedModels = null;

export const getModels = async () => {
  if (initializedModels) return initializedModels; // return cached

  // Initialize all models
  const usermodel = await userModel();
  const permissionmodel = await permissionModel();
  const quotemodel = await quoteModel();
  const quotehistorymodel = await quoteHistoryModel();
  const quoteassignmodel = await quoteAssignModel();
  const logmodel = await logModel();
  const categorymodel = await categoryModel();
  const productmodel = await productModel();
  const followupmodel = await followUpModel();

  // ✅ Category <-> Product
  productmodel.belongsTo(categorymodel, { foreignKey: "categoryId", as: "category" });
  categorymodel.hasMany(productmodel, { foreignKey: "categoryId", as: "products" });

  // ✅ User <-> QuoteHistory
  usermodel.hasMany(quotehistorymodel, { foreignKey: "user_id", as: "quoteHistory" });
  quotehistorymodel.belongsTo(usermodel, { foreignKey: "user_id", as: "user" });

  // ✅ Quote <-> QuoteHistory
  quotemodel.hasMany(quotehistorymodel, { foreignKey: "quote_id", as: "quoteHistory" });
  quotehistorymodel.belongsTo(quotemodel, { foreignKey: "quote_id", as: "quote" });

  // ✅ User <-> QuoteAssign  (fixed foreignKey — was "quotations")
  usermodel.hasMany(quoteassignmodel, { foreignKey: "user_id", as: "quoteAssign" });
  quoteassignmodel.belongsTo(usermodel, { foreignKey: "user_id", as: "user" });

  // ✅ Quote <-> QuoteAssign (fixed foreignKey — was "quotations")
  quotemodel.hasMany(quoteassignmodel, { foreignKey: "quote_id", as: "quoteAssign" });
  quoteassignmodel.belongsTo(quotemodel, { foreignKey: "quote_id", as: "quote" });


  //quote model and followUpmodel
  quotemodel.hasMany(followupmodel, { foreignKey: "quote_id", as: "followups" });
  followupmodel.belongsTo(quotemodel, { foreignKey: "quote_id", as: "quote" });


  initializedModels = {
    usermodel,
    permissionmodel,
    quotemodel,
    quotehistorymodel,
    quoteassignmodel,
    logmodel,
    categorymodel,
    productmodel,
    followupmodel
  };

  return initializedModels;
};

// ✅ Keep models export for backward compat — but point to raw model functions
export const models = {
  userModel,
  permissionModel,
  quoteModel,
  quoteHistoryModel,
  quoteAssignModel,
  logModel,
  categoryModel,
  productModel,
  notificationModel
};