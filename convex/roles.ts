import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyRole = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        // Check if user is in 'engineers' table
        const engineer = await ctx.db
            .query("engineers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (engineer) {
            return "engineer";
        }

        // Default to lead if authenticated but not an engineer
        // In a real app, you might have a 'leads' table or check specific metadata
        // For this MVP, anyone authenticated who isn't an engineer is a lead (or admin)
        return "lead";
    },
});
