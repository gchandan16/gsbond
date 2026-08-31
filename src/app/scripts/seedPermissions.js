import { connectTodb } from "../lib/connectDb.js";
import { permissionModel } from "../models/permission.model.js";
import { userModel } from "../models/user.model.js";
import { hashPassword } from "../utils/index.js";

const seedPermissions = async () => {
  try {
    // Connect to database
    const sequelize = await connectTodb();
    
    if (!sequelize) {
      console.error("❌ Database connection failed");
      process.exit(1);
    }

    console.log("✅ Database connected successfully");

    // Sync models with database (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log("✅ Models synchronized with database");

    // Get models
    const User = userModel();
    const Permission = permissionModel();

    if (!User || !Permission) {
      console.error("❌ Failed to load models");
      process.exit(1);
    }

    // Seed Users
    console.log("\n📝 Seeding users...");
    const userCount = await User.count();
    
    if (userCount === 0) {
      const password = "admin@gmail.com";
      const hashedPassword = await hashPassword(password);
      
      await User.create({
        name: "Admin User",
        email: "admin@gmail.com",
        password: hashedPassword,
        isVerified: true,
      });
      
      console.log("✅ Admin user created");
    } else {
      console.log(`ℹ️  Users already exist (${userCount} found), skipping user creation`);
    }

    // Seed Permissions
    console.log("\n📝 Seeding permissions...");
    
    const permissionsData = [
      {
        role: "admin",
        permissions: {
          user: { view: true, create: true, edit: true, delete: true },
          permissions: { view: true, create: true, edit: true, delete: true },
          quote: { view: true, create: true, edit: true, delete: true },
          assignedQuote: { view: true, create: true, edit: true, delete: true },
          category: { view: true, create: true, edit: true, delete: true },
          products: { view: true, create: true, edit: true, delete: true },
          leads: { view: true, create: true, edit: true, delete: true },
          
        },
        status: true,
      },
      {
        role: "operator",
        permissions: {
          user: { view: false, create: false, edit: false, delete: false },
          permissions: { view: false, create: false, edit: false, delete: false },
          quote: { view: true, create: false, edit: true, delete: false },
          assignedQuote: { view: true, create: false, edit: false, delete: false },
          category: { view: false, create: false, edit: false, delete: false },
          products: { view: false, create: false, edit: false, delete: false },
        },
        status: true,
      },
    ];

    // Upsert permissions
    for (const data of permissionsData) {
      try {
        const [permission, created] = await Permission.upsert(data, {
          returning: true,
        });

        if (created) {
          console.log(`✅ Created permissions for role: ${data.role}`);
        } else {
          console.log(`🔄 Updated permissions for role: ${data.role}`);
        }
      } catch (error) {
        console.error(`❌ Error upserting permissions for role ${data.role}:`, error.message);
      }
    }

    console.log("\n✅ Permission seeding completed successfully!");
    
    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error("❌ Error during seeding:", error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the seeding
seedPermissions();