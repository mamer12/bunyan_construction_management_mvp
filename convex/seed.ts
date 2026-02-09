import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// CLEAR ALL DATA (Admin Only - Use with caution!)
// ============================================

export const clearAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Clear all application tables
    const appTables = [
      "tasks",
      "units",
      "projects",
      "engineers",
      "wallets",
      "payouts",
      "transactions",
      "users",
      "materials",
      "material_requests",
    ] as const;

    for (const tableName of appTables) {
      const docs = await ctx.db.query(tableName as any).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    // Clear auth tables (Convex Auth system tables)
    const authTables = [
      "authAccounts",
      "authSessions",
      "authRefreshTokens",
      "authRateLimits",
      "authVerificationCodes",
      "authVerifiers",
    ] as const;

    for (const tableName of authTables) {
      try {
        const docs = await ctx.db.query(tableName as any).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
      } catch (e) {
        // Table might not exist, ignore
      }
    }

    console.log("All application and auth data cleared.");
  },
});

// ============================================
// SEED TEST USERS
// ============================================

interface TestUser {
  email: string;
  name: string;
  role: string;
}

const TEST_USERS: TestUser[] = [
  { email: "admin@bunyan.test", name: "Admin User", role: "admin" },
  { email: "manager@bunyan.test", name: "Acting Manager", role: "acting_manager" },
  { email: "lead@bunyan.test", name: "Lead Engineer", role: "lead" },
  { email: "engineer@bunyan.test", name: "Site Engineer", role: "engineer" },
  { email: "finance@bunyan.test", name: "Finance Officer", role: "finance" },
  { email: "stock@bunyan.test", name: "Stock Manager", role: "stock" },
];

export const seedTestUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const user of TEST_USERS) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", user.email))
        .first();

      if (!existing) {
        await ctx.db.insert("users", {
          userId: `test_${user.role}_${Date.now()}`,
          email: user.email,
          name: user.name,
          role: user.role,
          status: "active",
          joinedAt: Date.now(),
        });
        console.log(`Created user: ${user.email} with role ${user.role}`);
      }
    }
  },
});

// ============================================
// SEED MATERIALS
// ============================================

export const seedMaterials = internalMutation({
  args: {},
  handler: async (ctx) => {
    const materials = [
      { name: "Cement", unit: "bags", currentStock: 100, minimumStock: 20, pricePerUnit: 5 },
      { name: "Sand", unit: "m3", currentStock: 50, minimumStock: 10, pricePerUnit: 15 },
      { name: "Gravel", unit: "m3", currentStock: 40, minimumStock: 10, pricePerUnit: 18 },
      { name: "Bricks", unit: "pcs", currentStock: 5000, minimumStock: 1000, pricePerUnit: 0.5 },
      { name: "Steel Bars (12mm)", unit: "pcs", currentStock: 200, minimumStock: 50, pricePerUnit: 12 },
      { name: "Steel Bars (16mm)", unit: "pcs", currentStock: 150, minimumStock: 40, pricePerUnit: 18 },
      { name: "Plywood", unit: "pcs", currentStock: 80, minimumStock: 20, pricePerUnit: 25 },
      { name: "Paint (White)", unit: "liters", currentStock: 100, minimumStock: 30, pricePerUnit: 8 },
      { name: "PVC Pipes (4 inch)", unit: "m", currentStock: 200, minimumStock: 50, pricePerUnit: 4 },
      { name: "Electrical Wire", unit: "m", currentStock: 500, minimumStock: 100, pricePerUnit: 2 },
    ];

    for (const mat of materials) {
      const existing = await ctx.db
        .query("materials")
        .withIndex("by_name", (q) => q.eq("name", mat.name))
        .first();

      if (!existing) {
        await ctx.db.insert("materials", {
          ...mat,
          lastUpdated: Date.now(),
        });
        console.log(`Created material: ${mat.name}`);
      }
    }
  },
});

// ============================================
// SEED SAMPLE PROJECT
// ============================================

export const seedSampleProject = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if any project exists
    const existingProject = await ctx.db.query("projects").first();
    if (existingProject) {
      console.log("Sample project already exists.");
      return;
    }

    // Create sample project
    const projectId = await ctx.db.insert("projects", {
      name: "Al-Rashid Residential Complex",
      location: "Baghdad, Iraq",
      totalBudget: 500000,
      status: "ACTIVE",
    });

    // Create sample units
    const units = [
      { name: "Villa 101", status: "UNDER_CONSTRUCTION" },
      { name: "Villa 102", status: "UNDER_CONSTRUCTION" },
      { name: "Villa 103", status: "UNDER_CONSTRUCTION" },
      { name: "Apartment Block A", status: "UNDER_CONSTRUCTION" },
    ] as const;

    for (const unit of units) {
      await ctx.db.insert("units", {
        projectId,
        name: unit.name,
        status: unit.status,
      });
    }

    console.log(`Created sample project with ${units.length} units.`);
  },
});

// ============================================
// FULL SEED - Run all seeders
// ============================================

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting full seed...");

    // 1. Clear Data (Application + Auth)
    const appTables = [
      "tasks", "units", "projects", "engineers", "wallets",
      "payouts", "transactions", "users", "materials",
      "material_requests", "custom_roles", "audit_logs",
      "notifications", "documents", "deals", "installments",
      "sales_activities"
    ] as const;

    const authTables = [
      "authAccounts", "authSessions", "authRefreshTokens",
      "authRateLimits", "authVerificationCodes", "authVerifiers",
    ] as const;

    for (const tableName of [...appTables, ...authTables]) {
      try {
        const docs = await ctx.db.query(tableName as any).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
        }
      } catch (e) {
        // Table might not exist, ignore
      }
    }

    // 2. Seed System Roles
    const systemRoles = [
      { name: "admin", displayName: "Administrator", displayNameAr: "مدير النظام", permissions: ["dashboard", "management", "projects", "finance", "team", "stock", "settings"], color: "#DC2626" },
      { name: "acting_manager", displayName: "Acting Manager", displayNameAr: "مدير بالإنابة", permissions: ["dashboard", "management", "projects", "finance", "team"], color: "#8B5CF6" },
      { name: "lead", displayName: "Lead Engineer", displayNameAr: "مهندس مشرف", permissions: ["dashboard", "projects", "finance", "team"], color: "#3B82F6" },
      { name: "engineer", displayName: "Site Engineer", displayNameAr: "مهندس موقع", permissions: ["dashboard", "projects"], color: "#059669" },
      { name: "finance", displayName: "Finance Officer", displayNameAr: "مسؤول مالي", permissions: ["dashboard", "finance"], color: "#F59E0B" },
      { name: "stock", displayName: "Stock Manager", displayNameAr: "مدير المخزون", permissions: ["dashboard", "stock"], color: "#6B7280" },
    ];

    for (const role of systemRoles) {
      await ctx.db.insert("custom_roles", {
        ...role,
        isSystem: true,
        createdAt: Date.now(),
      });
    }

    // 3. Seed Users
    for (const user of TEST_USERS) {
      await ctx.db.insert("users", {
        userId: `seed_${user.role}_${Date.now()}`,
        email: user.email,
        name: user.name,
        role: user.role,
        status: "active",
        joinedAt: Date.now(),
      });
    }

    // 4. Seed Materials
    const materials = [
      { name: "Cement", unit: "bags", currentStock: 100, minimumStock: 20, pricePerUnit: 5 },
      { name: "Sand", unit: "m3", currentStock: 50, minimumStock: 10, pricePerUnit: 15 },
      { name: "Gravel", unit: "m3", currentStock: 40, minimumStock: 10, pricePerUnit: 18 },
      { name: "Bricks", unit: "pcs", currentStock: 5000, minimumStock: 1000, pricePerUnit: 0.5 },
      { name: "Steel Bars (12mm)", unit: "pcs", currentStock: 200, minimumStock: 50, pricePerUnit: 12 },
    ];

    for (const mat of materials) {
      await ctx.db.insert("materials", {
        ...mat,
        lastUpdated: Date.now(),
      });
    }

    // 5. Seed Project & Units
    const projectId = await ctx.db.insert("projects", {
      name: "Al-Rashid Residential Complex",
      location: "Baghdad, Iraq",
      totalBudget: 500000,
      status: "ACTIVE",
    });

    const units = [
      { name: "Villa 101", status: "UNDER_CONSTRUCTION" },
      { name: "Villa 102", status: "UNDER_CONSTRUCTION" },
      { name: "Villa 103", status: "UNDER_CONSTRUCTION" },
      { name: "Apartment Block A", status: "UNDER_CONSTRUCTION" },
    ] as const;

    for (const unit of units) {
      await ctx.db.insert("units", {
        projectId,
        name: unit.name,
        status: unit.status,
        salesStatus: "available",
      });
    }

    console.log("Full seed completed successfully.");
    return { success: true };
  },
});

// ============================================
// Create User via API (for testing without Auth)
// ============================================

export const createTestUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user with email exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error(`User with email ${args.email} already exists`);
    }

    const userId = await ctx.db.insert("users", {
      userId: `manual_${args.role}_${Date.now()}`,
      email: args.email,
      name: args.name,
      role: args.role,
      status: "active",
      joinedAt: Date.now(),
    });

    return userId;
  },
});
