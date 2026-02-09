import { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Resolves a user's display name from either their Auth ID or email.
 * Checks users table first, then engineers table, then falls back to showing the email.
 */
export async function resolveUserName(
    ctx: QueryCtx | MutationCtx,
    assignedTo: string
): Promise<string> {
    // 1. Try to find in 'users' table by userId (Auth ID)
    const user = await ctx.db
        .query("users")
        .withIndex("by_user", (q) => q.eq("userId", assignedTo))
        .first();

    if (user?.name) return user.name;

    // 2. Try 'engineers' table by userId
    const engineer = await ctx.db
        .query("engineers")
        .filter((q) => q.eq(q.field("userId"), assignedTo))
        .first();

    if (engineer?.name) return engineer.name;

    // 3. Try 'users' table by email (if assignedTo looks like an email)
    if (assignedTo.includes("@")) {
        const userByEmail = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", assignedTo))
            .first();

        if (userByEmail?.name) return userByEmail.name;
        return assignedTo; // Show email as fallback
    }

    return "Unknown";
}

/**
 * Resolves the correct assignee ID for task assignment.
 * Given an email, looks up the user or engineer and returns their Auth ID.
 * Falls back to the email string if user hasn't registered yet.
 */
export async function resolveAssigneeId(
    ctx: QueryCtx | MutationCtx,
    email: string
): Promise<string> {
    // Check registered users first
    const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

    if (user?.userId) return user.userId;

    // Check engineers table
    const engineer = await ctx.db
        .query("engineers")
        .filter((q) => q.eq(q.field("email"), email))
        .first();

    if (engineer?.userId && engineer.userId.length > 0) return engineer.userId;

    // Not registered yet — store email as placeholder
    return email;
}
