import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const ensureUser = mutation({
    args: {
        email: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!existing) {
            // Determine role based on email for test accounts
            let role = "guest";

            // Check for test account emails
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
                // Check if this email is in the engineers table (added by a lead)
                const engineerEntry = await ctx.db
                    .query("engineers")
                    .filter((q) => q.eq(q.field("email"), args.email))
                    .first();

                if (engineerEntry) {
                    role = "engineer";
                } else {
                    // First non-test user becomes admin, others are guest
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

            // IMPORTANT: Link the engineer entry if it exists
            // This connects their Auth ID to tasks assigned by lead
            const engineerEntry = await ctx.db
                .query("engineers")
                .filter((q) => q.eq(q.field("email"), args.email))
                .first();

            if (engineerEntry) {
                await ctx.db.patch(engineerEntry._id, {
                    userId: userId,
                });
                console.log(`Linked engineer ${args.email} to Auth ID ${userId}`);
            }

            return role;
        }
        return existing.role;
    },
});

export const setUserRole = mutation({
    args: {
        targetUserId: v.string(), // This is the Convex ID of the USER doc, or Auth ID? Schema says userId is Auth ID. let's use Auth ID for lookup or User Doc ID. 
        // Usually easier to update by Document ID. Let's accept Document ID or email.
        // Let's use Document ID of the 'users' table for safety.
        userId: v.id("users"),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", currentUserId))
            .first();

        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Unauthorized: Only admins can set roles");
        }

        await ctx.db.patch(args.userId, {
            role: args.role,
        });
    },
});

export const getUsers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // In a real app, restrict this to Admin/Lead
        return await ctx.db.query("users").collect();
    },
});

// Update user role (Admin only)
export const updateUserRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Check if current user is admin
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", currentUserId))
            .first();

        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Unauthorized: Only admins can change user roles");
        }

        // Validate role
        const validRoles = ["admin", "acting_manager", "lead", "engineer", "finance", "stock", "guest"];
        if (!validRoles.includes(args.role)) {
            throw new Error("Invalid role");
        }

        await ctx.db.patch(args.userId, { role: args.role });
        return { success: true };
    },
});

// Update user status (Admin only)
export const updateUserStatus = mutation({
    args: {
        userId: v.id("users"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Check if current user is admin
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", currentUserId))
            .first();

        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Unauthorized: Only admins can change user status");
        }

        // Validate status
        if (!["active", "inactive"].includes(args.status)) {
            throw new Error("Invalid status");
        }

        await ctx.db.patch(args.userId, { status: args.status });
        return { success: true };
    },
});

// Delete user (Admin only)
export const deleteUser = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Check if current user is admin
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", currentUserId))
            .first();

        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Unauthorized: Only admins can delete users");
        }

        // Prevent deleting yourself
        const targetUser = await ctx.db.get(args.userId);
        if (targetUser?.userId === currentUserId) {
            throw new Error("Cannot delete your own account");
        }

        await ctx.db.delete(args.userId);
        return { success: true };
    },
});

// Clean up duplicate user entries (Admin only)
export const cleanupDuplicateUsers = mutation({
    args: {},
    handler: async (ctx) => {
        const currentUserId = await getAuthUserId(ctx);
        if (!currentUserId) throw new Error("Not authenticated");

        // Check if current user is admin
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", currentUserId))
            .first();

        if (!currentUser || currentUser.role !== "admin") {
            throw new Error("Unauthorized: Only admins can run cleanup");
        }

        const allUsers = await ctx.db.query("users").collect();

        // Group by userId
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
        // For each group with duplicates, keep the one with role and delete others
        for (const authId in usersByAuthId) {
            const duplicates = usersByAuthId[authId];
            if (duplicates.length > 1) {
                // Find the "main" entry (one with role)
                const mainEntry = duplicates.find(u => u.role && u.email);
                if (mainEntry) {
                    // Delete the others
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

// Get all custom roles
export const getCustomRoles = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("custom_roles").collect();
    },
});

// Create a custom role (Admin only)
export const createCustomRole = mutation({
    args: {
        name: v.string(),
        displayName: v.string(),
        displayNameAr: v.optional(v.string()),
        permissions: v.array(v.string()),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check admin permission
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        const userRoles = currentUser?.roles || (currentUser?.role ? [currentUser.role] : []);
        if (!userRoles.includes("admin")) {
            throw new Error("Only admins can create roles");
        }

        // Check if role name already exists
        const existingRole = await ctx.db
            .query("custom_roles")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();

        if (existingRole) {
            throw new Error("Role with this name already exists");
        }

        const roleId = await ctx.db.insert("custom_roles", {
            name: args.name.toLowerCase().replace(/\s+/g, '_'),
            displayName: args.displayName,
            displayNameAr: args.displayNameAr,
            permissions: args.permissions,
            color: args.color || "#6B7280",
            isSystem: false,
            createdAt: Date.now(),
            createdBy: userId,
        });

        return roleId;
    },
});

// Update a custom role (Admin only)
export const updateCustomRole = mutation({
    args: {
        roleId: v.id("custom_roles"),
        displayName: v.optional(v.string()),
        displayNameAr: v.optional(v.string()),
        permissions: v.optional(v.array(v.string())),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check admin permission
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        const userRoles = currentUser?.roles || (currentUser?.role ? [currentUser.role] : []);
        if (!userRoles.includes("admin")) {
            throw new Error("Only admins can update roles");
        }

        const role = await ctx.db.get(args.roleId);
        if (!role) throw new Error("Role not found");

        // Can't change name of system roles
        if (role.isSystem) {
            throw new Error("Cannot modify system roles");
        }

        const updates: Record<string, any> = {};
        if (args.displayName !== undefined) updates.displayName = args.displayName;
        if (args.displayNameAr !== undefined) updates.displayNameAr = args.displayNameAr;
        if (args.permissions !== undefined) updates.permissions = args.permissions;
        if (args.color !== undefined) updates.color = args.color;

        await ctx.db.patch(args.roleId, updates);
        return args.roleId;
    },
});

// Delete a custom role (Admin only)
export const deleteCustomRole = mutation({
    args: {
        roleId: v.id("custom_roles"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check admin permission
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        const userRoles = currentUser?.roles || (currentUser?.role ? [currentUser.role] : []);
        if (!userRoles.includes("admin")) {
            throw new Error("Only admins can delete roles");
        }

        const role = await ctx.db.get(args.roleId);
        if (!role) throw new Error("Role not found");

        if (role.isSystem) {
            throw new Error("Cannot delete system roles");
        }

        // Remove this role from all users who have it
        const usersWithRole = await ctx.db.query("users").collect();
        for (const user of usersWithRole) {
            if (user.roles?.includes(role.name)) {
                const newRoles = user.roles.filter(r => r !== role.name);
                await ctx.db.patch(user._id, { roles: newRoles });
            }
            // Also check legacy role field
            if (user.role === role.name) {
                await ctx.db.patch(user._id, { role: undefined });
            }
        }

        await ctx.db.delete(args.roleId);
        return { success: true };
    },
});

// Assign multiple roles to a user (Admin only)
export const assignUserRoles = mutation({
    args: {
        userId: v.id("users"),
        roles: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const authUserId = await getAuthUserId(ctx);
        if (!authUserId) throw new Error("Not authenticated");

        // Check admin permission
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", authUserId))
            .first();

        const currentUserRoles = currentUser?.roles || (currentUser?.role ? [currentUser.role] : []);
        if (!currentUserRoles.includes("admin")) {
            throw new Error("Only admins can assign roles");
        }

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) throw new Error("User not found");

        // Update both roles array and legacy role field (use first role for backward compatibility)
        await ctx.db.patch(args.userId, {
            roles: args.roles,
            role: args.roles.length > 0 ? args.roles[0] : undefined,
        });

        return { success: true, roles: args.roles };
    },
});

// Seed system roles (call once to initialize built-in roles)
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
