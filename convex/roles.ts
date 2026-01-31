import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's primary role (for backward compatibility)
export const getMyRole = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        // 1. Check 'users' table first (New RBAC system)
        const user = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (user) {
            // Return first role from roles array, or legacy role field
            if (user.roles && user.roles.length > 0) {
                return user.roles[0];
            }
            return user.role;
        }

        // 2. Fallback to 'engineers' table (Legacy support during migration)
        const engineer = await ctx.db
            .query("engineers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (engineer) {
            return "engineer";
        }

        // 3. Default fallback (e.g. for initial admin setup or unassigned)
        return "guest";
    },
});

// Get all user roles (for multi-role support)
export const getMyRoles = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (user) {
            // Return roles array if exists, otherwise wrap legacy role in array
            if (user.roles && user.roles.length > 0) {
                return user.roles;
            }
            if (user.role) {
                return [user.role];
            }
        }

        // Fallback to 'engineers' table
        const engineer = await ctx.db
            .query("engineers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (engineer) {
            return ["engineer"];
        }

        return ["guest"];
    },
});
