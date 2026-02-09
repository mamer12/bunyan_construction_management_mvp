import { QueryCtx, MutationCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Requires authentication and returns the userId.
 * Throws if user is not authenticated.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<string> {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return userId;
}

/**
 * Gets the user record from the 'users' table by their Auth ID.
 * Returns null if no user record found.
 */
export async function getUserByAuthId(ctx: QueryCtx | MutationCtx, authUserId: string) {
    return await ctx.db
        .query("users")
        .withIndex("by_user", (q) => q.eq("userId", authUserId))
        .first();
}

/**
 * Gets the user's roles array, with backward compatibility for legacy 'role' field.
 */
export function getUserRoles(user: { roles?: string[]; role?: string } | null): string[] {
    if (!user) return [];
    if (user.roles && user.roles.length > 0) return user.roles;
    if (user.role) return [user.role];
    return [];
}

/**
 * Requires the user to have one of the given roles.
 * Throws if not authenticated or lacks the required role.
 * Returns the userId.
 */
export async function requireRole(
    ctx: QueryCtx | MutationCtx,
    allowedRoles: string[]
): Promise<string> {
    const userId = await requireAuth(ctx);
    const user = await getUserByAuthId(ctx, userId);
    const userRoles = getUserRoles(user);

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
        throw new Error(`Unauthorized: Requires one of [${allowedRoles.join(", ")}]`);
    }
    return userId;
}

/**
 * Shorthand: requires the user to be an admin.
 * Returns the userId.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<string> {
    return requireRole(ctx, ["admin"]);
}

/**
 * Shorthand: requires admin or management roles.
 * Returns the userId.
 */
export async function requireManagement(ctx: QueryCtx | MutationCtx): Promise<string> {
    return requireRole(ctx, ["admin", "acting_manager", "lead"]);
}
