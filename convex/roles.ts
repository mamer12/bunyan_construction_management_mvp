import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Role hierarchy for permissions
export const ROLE_HIERARCHY = {
    admin: 100,
    acting_manager: 90,
    engineering_lead: 70,
    finance_manager: 60,
    stock_manager: 50,
    engineer: 30,
} as const;

export type Role = keyof typeof ROLE_HIERARCHY;

// Permissions for each role
export const ROLE_PERMISSIONS = {
    admin: [
        "manage_users", "manage_roles", "manage_projects", "manage_tasks",
        "approve_tasks", "manage_payouts", "view_finance", "manage_finance",
        "manage_stock", "approve_material_requests", "view_reports", "manage_all"
    ],
    acting_manager: [
        "manage_projects", "manage_tasks", "approve_tasks", "manage_payouts",
        "view_finance", "approve_material_requests", "view_reports"
    ],
    engineering_lead: [
        "manage_projects", "manage_tasks", "approve_tasks", "view_finance",
        "request_materials", "view_reports"
    ],
    finance_manager: [
        "view_finance", "manage_finance", "manage_payouts", "view_reports"
    ],
    stock_manager: [
        "manage_stock", "approve_material_requests", "view_reports"
    ],
    engineer: [
        "view_tasks", "submit_tasks", "request_materials"
    ],
} as const;

export const getMyRole = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        // Check userRoles table first
        const userRole = await ctx.db
            .query("userRoles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        if (userRole) {
            return userRole.role;
        }

        // Fallback: Check if user is in 'engineers' table
        const engineer = await ctx.db
            .query("engineers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (engineer) {
            return "engineer" as Role;
        }

        // Default to admin for first user (setup), otherwise engineering_lead
        const allRoles = await ctx.db.query("userRoles").collect();
        if (allRoles.length === 0) {
            return "admin" as Role;
        }

        return "engineering_lead" as Role;
    },
});

export const getMyRoleWithPermissions = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        // Check userRoles table first
        const userRole = await ctx.db
            .query("userRoles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        let role: Role = "engineering_lead";

        if (userRole) {
            role = userRole.role as Role;
        } else {
            // Fallback: Check if user is in 'engineers' table
            const engineer = await ctx.db
                .query("engineers")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .first();

            if (engineer) {
                role = "engineer";
            } else {
                // Default to admin for first user
                const allRoles = await ctx.db.query("userRoles").collect();
                if (allRoles.length === 0) {
                    role = "admin";
                }
            }
        }

        return {
            role,
            permissions: ROLE_PERMISSIONS[role] || [],
            hierarchy: ROLE_HIERARCHY[role] || 0,
        };
    },
});

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // Get all users from auth table
        const users = await ctx.db.query("users").collect();

        // Get all role assignments
        const userRoles = await ctx.db.query("userRoles").collect();
        const roleMap = new Map(
            userRoles.filter(r => r.isActive).map(r => [r.userId, r.role])
        );

        // Get engineers for name mapping
        const engineers = await ctx.db.query("engineers").collect();
        const engineerMap = new Map(
            engineers.map(e => [e.userId, e])
        );

        return users.map(user => ({
            _id: user._id,
            userId: user._id,
            email: user.email,
            name: engineerMap.get(user._id)?.name || user.name || user.email?.split("@")[0] || "User",
            role: roleMap.get(user._id) || (engineerMap.has(user._id) ? "engineer" : "engineering_lead"),
            isActive: true,
        }));
    },
});

export const assignRole = mutation({
    args: {
        targetUserId: v.string(),
        role: v.union(
            v.literal("admin"),
            v.literal("acting_manager"),
            v.literal("engineering_lead"),
            v.literal("engineer"),
            v.literal("finance_manager"),
            v.literal("stock_manager")
        ),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check if current user has permission to assign roles
        const currentUserRole = await ctx.db
            .query("userRoles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        // Only admin and acting_manager can assign roles
        if (currentUserRole && !["admin", "acting_manager"].includes(currentUserRole.role)) {
            throw new Error("You don't have permission to assign roles");
        }

        // Deactivate existing role
        const existingRole = await ctx.db
            .query("userRoles")
            .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        if (existingRole) {
            await ctx.db.patch(existingRole._id, { isActive: false });
        }

        // Assign new role
        await ctx.db.insert("userRoles", {
            userId: args.targetUserId,
            role: args.role,
            assignedBy: userId,
            assignedAt: Date.now(),
            isActive: true,
        });

        return { success: true };
    },
});

export const getUsersByRole = query({
    args: {
        role: v.union(
            v.literal("admin"),
            v.literal("acting_manager"),
            v.literal("engineering_lead"),
            v.literal("engineer"),
            v.literal("finance_manager"),
            v.literal("stock_manager")
        ),
    },
    handler: async (ctx, args) => {
        const users = await ctx.db
            .query("userRoles")
            .withIndex("by_role", (q) => q.eq("role", args.role))
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();

        return users;
    },
});

// Check if user has a specific permission
export const hasPermission = query({
    args: {
        permission: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return false;

        const userRole = await ctx.db
            .query("userRoles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isActive"), true))
            .first();

        let role: Role = "engineering_lead";
        if (userRole) {
            role = userRole.role as Role;
        } else {
            const engineer = await ctx.db
                .query("engineers")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .first();
            if (engineer) {
                role = "engineer";
            }
        }

        const permissions = ROLE_PERMISSIONS[role] || [];
        return permissions.includes(args.permission as any) || permissions.includes("manage_all" as any);
    },
});
