import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireAdmin } from "./lib/auth";
import { userRole, userStatus } from "./lib/validators";
import { VALID_SYSTEM_ROLES } from "./lib/constants";

// ============================================
// USER MANAGEMENT
// ============================================

export const ensureUser = mutation({
    args: {
        email: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        const existing = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first() || await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", args.email))
                .first();

        if (existing && (!existing.userId || (typeof existing.userId === 'string' && existing.userId.startsWith('seed_')))) {
            // Claim existing seeded user or guest entry
            await ctx.db.patch(existing._id, { userId });
            return existing.role;
        }

        if (!existing) {
            let role = "guest";

            const email = args.email.toLowerCase();
            if (email.includes("admin@bunyan") || email.includes("admin")) {
                role = "admin";
            } else if (email.includes("manager@bunyan") || email.includes("manager")) {
                role = "acting_manager";
            } else if (email.includes("lead@bunyan") || email.includes("lead")) {
                role = "lead";
            } else if (email.includes("engineer@bunyan")) {
                role = "engineer";
            } else if (email.includes("finance@bunyan") || email.includes("finance")) {
                role = "finance";
            } else if (email.includes("stock@bunyan") || email.includes("stock")) {
                role = "stock";
            } else {
                const engineerEntry = await ctx.db
                    .query("engineers")
                    .filter((q) => q.eq(q.field("email"), args.email))
                    .first();

                if (engineerEntry) {
                    role = "engineer";
                } else {
                    const anyUser = await ctx.db.query("users").first();
                    role = anyUser ? "guest" : "admin";
                }
            }

            await ctx.db.insert("users", {
                userId,
                email: args.email,
                name: args.name,
                role,
                status: "active",
                joinedAt: Date.now(),
            });

            // Link engineer entry if exists
            const engineerEntry = await ctx.db
                .query("engineers")
                .filter((q) => q.eq(q.field("email"), args.email))
                .first();

            if (engineerEntry) {
                await ctx.db.patch(engineerEntry._id, { userId });
            }

            return role;
        }
        return existing.role;
    },
});

export const setUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: userRole,
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.userId, { role: args.role });
    },
});

export const getUsers = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);
        const pageSize = args.limit ?? 100;
        return await ctx.db.query("users").take(pageSize);
    },
});

export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: userRole,
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.userId, { role: args.role });
        return { success: true };
    },
});

export const updateUserStatus = mutation({
    args: {
        userId: v.id("users"),
        status: userStatus,
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.userId, { status: args.status });
        return { success: true };
    },
});

export const deleteUser = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const currentUserId = await requireAdmin(ctx);

        const targetUser = await ctx.db.get(args.userId);
        if (targetUser?.userId === currentUserId) {
            throw new Error("Cannot delete your own account");
        }

        await ctx.db.delete(args.userId);
        return { success: true };
    },
});

export const cleanupDuplicateUsers = mutation({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);

        const allUsers = await ctx.db.query("users").collect();

        const usersByAuthId: Record<string, typeof allUsers> = {};
        for (const user of allUsers) {
            if (user.userId) {
                if (!usersByAuthId[user.userId]) {
                    usersByAuthId[user.userId] = [];
                }
                usersByAuthId[user.userId].push(user);
            }
        }

        let cleaned = 0;
        for (const authId in usersByAuthId) {
            const duplicates = usersByAuthId[authId];
            if (duplicates.length > 1) {
                const mainEntry = duplicates.find((u) => u.role && u.email);
                if (mainEntry) {
                    for (const dup of duplicates) {
                        if (dup._id !== mainEntry._id) {
                            await ctx.db.delete(dup._id);
                            cleaned++;
                        }
                    }
                }
            }
        }

        return { cleaned };
    },
});

// ============= CUSTOM ROLE MANAGEMENT =============

export const getCustomRoles = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("custom_roles").collect();
    },
});

export const createCustomRole = mutation({
    args: {
        name: v.string(),
        displayName: v.string(),
        displayNameAr: v.optional(v.string()),
        permissions: v.array(v.string()),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAdmin(ctx);

        const existingRole = await ctx.db
            .query("custom_roles")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();

        if (existingRole) {
            throw new Error("Role with this name already exists");
        }

        return await ctx.db.insert("custom_roles", {
            name: args.name.toLowerCase().replace(/\s+/g, "_"),
            displayName: args.displayName,
            displayNameAr: args.displayNameAr,
            permissions: args.permissions,
            color: args.color || "#6B7280",
            isSystem: false,
            createdAt: Date.now(),
            createdBy: userId,
        });
    },
});

export const updateCustomRole = mutation({
    args: {
        roleId: v.id("custom_roles"),
        displayName: v.optional(v.string()),
        displayNameAr: v.optional(v.string()),
        permissions: v.optional(v.array(v.string())),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const role = await ctx.db.get(args.roleId);
        if (!role) throw new Error("Role not found");

        if (role.isSystem) {
            throw new Error("Cannot modify system roles");
        }

        const updates: {
            displayName?: string;
            displayNameAr?: string;
            permissions?: string[];
            color?: string;
        } = {};

        if (args.displayName !== undefined) updates.displayName = args.displayName;
        if (args.displayNameAr !== undefined) updates.displayNameAr = args.displayNameAr;
        if (args.permissions !== undefined) updates.permissions = args.permissions;
        if (args.color !== undefined) updates.color = args.color;

        await ctx.db.patch(args.roleId, updates);
        return args.roleId;
    },
});

export const deleteCustomRole = mutation({
    args: {
        roleId: v.id("custom_roles"),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const role = await ctx.db.get(args.roleId);
        if (!role) throw new Error("Role not found");

        if (role.isSystem) {
            throw new Error("Cannot delete system roles");
        }

        // Remove this role from all users who have it
        const usersWithRole = await ctx.db.query("users").collect();
        for (const user of usersWithRole) {
            if (user.roles?.includes(role.name)) {
                const newRoles = user.roles.filter((r) => r !== role.name);
                await ctx.db.patch(user._id, { roles: newRoles });
            }
            if (user.role === role.name) {
                await ctx.db.patch(user._id, { role: undefined });
            }
        }

        await ctx.db.delete(args.roleId);
        return { success: true };
    },
});

export const assignUserRoles = mutation({
    args: {
        userId: v.id("users"),
        roles: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) throw new Error("User not found");

        await ctx.db.patch(args.userId, {
            roles: args.roles,
            role: args.roles.length > 0 ? args.roles[0] : undefined,
        });

        return { success: true, roles: args.roles };
    },
});

export const seedSystemRoles = mutation({
    args: {},
    handler: async (ctx) => {
        const systemRoles = [
            { name: "admin", displayName: "Administrator", displayNameAr: "مدير النظام", permissions: ["dashboard", "management", "projects", "finance", "team", "stock", "settings"], color: "#DC2626" },
            { name: "acting_manager", displayName: "Acting Manager", displayNameAr: "مدير بالإنابة", permissions: ["dashboard", "management", "projects", "finance", "team"], color: "#8B5CF6" },
            { name: "lead", displayName: "Lead Engineer", displayNameAr: "مهندس مشرف", permissions: ["dashboard", "projects", "finance", "team"], color: "#3B82F6" },
            { name: "engineer", displayName: "Site Engineer", displayNameAr: "مهندس موقع", permissions: ["dashboard", "projects"], color: "#059669" },
            { name: "finance", displayName: "Finance Officer", displayNameAr: "مسؤول مالي", permissions: ["dashboard", "finance"], color: "#F59E0B" },
            { name: "stock", displayName: "Stock Manager", displayNameAr: "مدير المخزون", permissions: ["dashboard", "stock"], color: "#6B7280" },
        ];

        let created = 0;
        for (const role of systemRoles) {
            const existing = await ctx.db
                .query("custom_roles")
                .withIndex("by_name", (q) => q.eq("name", role.name))
                .first();

            if (!existing) {
                await ctx.db.insert("custom_roles", {
                    name: role.name,
                    displayName: role.displayName,
                    displayNameAr: role.displayNameAr,
                    permissions: role.permissions,
                    color: role.color,
                    isSystem: true,
                    createdAt: Date.now(),
                });
                created++;
            }
        }

        return { created, total: systemRoles.length };
    },
});
