import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { notificationType } from "./lib/validators";
import { MAX_LOCAL_NOTIFICATIONS } from "./lib/constants";

// ============================================
// NOTIFICATION MANAGEMENT
// ============================================

export const createNotification = mutation({
    args: {
        userId: v.string(),
        type: notificationType,
        title: v.string(),
        message: v.string(),
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            userId: args.userId,
            type: args.type,
            title: args.title,
            message: args.message,
            entityType: args.entityType,
            entityId: args.entityId,
            isRead: false,
            createdAt: Date.now(),
        });
    },
});

export const getMyNotifications = query({
    args: {
        unreadOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        if (args.unreadOnly) {
            return await ctx.db
                .query("notifications")
                .withIndex("by_user_unread", (q) =>
                    q.eq("userId", userId).eq("isRead", false)
                )
                .order("desc")
                .take(MAX_LOCAL_NOTIFICATIONS);
        }

        return await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(MAX_LOCAL_NOTIFICATIONS);
    },
});

export const markNotificationRead = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.notificationId, {
            isRead: true,
            readAt: Date.now(),
        });
    },
});

export const markAllNotificationsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await requireAuth(ctx);

        const unreadNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) =>
                q.eq("userId", userId).eq("isRead", false)
            )
            .collect();

        await Promise.all(
            unreadNotifications.map((n) =>
                ctx.db.patch(n._id, { isRead: true, readAt: Date.now() })
            )
        );

        return { marked: unreadNotifications.length };
    },
});
