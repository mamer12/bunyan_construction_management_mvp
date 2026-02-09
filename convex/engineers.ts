import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

// ============================================
// ENGINEER MANAGEMENT
// ============================================

export const addEngineer = mutation({
    args: {
        name: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        const existing = await ctx.db
            .query("engineers")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (existing) {
            throw new Error("Engineer with this email already exists");
        }

        return await ctx.db.insert("engineers", {
            userId: "", // Will be set when engineer signs up
            name: args.name,
            email: args.email,
            leadId: userId,
        });
    },
});

export const getMyEngineers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireAuth(ctx);

        return await ctx.db
            .query("engineers")
            .withIndex("by_lead", (q) => q.eq("leadId", userId))
            .collect();
    },
});
