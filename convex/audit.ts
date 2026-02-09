import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

// ============================================
// AUDIT LOG MANAGEMENT
// ============================================

export const createAuditLog = mutation({
    args: {
        action: v.string(),
        entityType: v.string(),
        entityId: v.string(),
        changes: v.optional(v.string()),
        metadata: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        const user = await ctx.db.get(userId);

        await ctx.db.insert("audit_logs", {
            userId,
            userEmail: user?.email,
            action: args.action,
            entityType: args.entityType,
            entityId: args.entityId,
            changes: args.changes,
            metadata: args.metadata,
            createdAt: Date.now(),
        });
    },
});

export const getAuditLogs = query({
    args: {
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        if (args.entityType && args.entityId) {
            return await ctx.db
                .query("audit_logs")
                .withIndex("by_entity", (q) =>
                    q.eq("entityType", args.entityType!).eq("entityId", args.entityId!)
                )
                .order("desc")
                .take(args.limit || 50);
        }

        return await ctx.db
            .query("audit_logs")
            .order("desc")
            .take(args.limit || 100);
    },
});
