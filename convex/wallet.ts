import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./lib/auth";
import { resolveUserName } from "./lib/users";
import { payoutStatus } from "./lib/validators";

// ============================================
// WALLET QUERIES
// ============================================

export const getMyWallet = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireAuth(ctx);

        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!wallet) {
            return {
                userId,
                availableBalance: 0,
                pendingBalance: 0,
                totalEarned: 0,
                totalWithdrawn: 0,
            };
        }

        return wallet;
    },
});

export const getMyTransactions = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        return await ctx.db
            .query("transactions")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(args.limit || 20);
    },
});

export const getMyPayouts = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireAuth(ctx);

        return await ctx.db
            .query("payouts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

// ============================================
// WALLET MUTATIONS
// ============================================

export const requestPayout = mutation({
    args: {
        amount: v.number(),
        paymentMethod: v.string(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        if (!wallet) {
            throw new Error("No wallet found");
        }

        if (args.amount <= 0) {
            throw new Error("Amount must be positive");
        }

        if (args.amount > wallet.availableBalance) {
            throw new Error("Insufficient balance");
        }

        const pendingPayout = await ctx.db
            .query("payouts")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("status"), "PENDING"))
            .first();

        if (pendingPayout) {
            throw new Error("You already have a pending payout request");
        }

        const payoutId = await ctx.db.insert("payouts", {
            userId,
            amount: args.amount,
            status: "PENDING",
            paymentMethod: args.paymentMethod,
            requestedAt: Date.now(),
            notes: args.notes,
        });

        await ctx.db.patch(wallet._id, {
            availableBalance: wallet.availableBalance - args.amount,
        });

        await ctx.db.insert("transactions", {
            userId,
            type: "PAYOUT_REQUESTED",
            amount: -args.amount,
            payoutId,
            createdAt: Date.now(),
            description: `Payout requested via ${args.paymentMethod}`,
        });

        return { success: true, payoutId };
    },
});

// ============================================
// ADMIN QUERIES
// ============================================

export const getPendingPayouts = query({
    args: {},
    handler: async (ctx) => {
        await requireAuth(ctx);

        const payouts = await ctx.db
            .query("payouts")
            .withIndex("by_status", (q) => q.eq("status", "PENDING"))
            .order("desc")
            .collect();

        const payoutsWithUser = await Promise.all(
            payouts.map(async (payout) => {
                const engineerName = await resolveUserName(ctx, payout.userId);

                return {
                    ...payout,
                    engineerName,
                    engineerEmail: payout.userId,
                };
            })
        );

        return payoutsWithUser;
    },
});

export const getAllPayouts = query({
    args: {
        status: v.optional(payoutStatus),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        const pageSize = args.limit ?? 50;
        let payouts;

        if (args.status) {
            payouts = await ctx.db
                .query("payouts")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .order("desc")
                .take(pageSize);
        } else {
            payouts = await ctx.db
                .query("payouts")
                .order("desc")
                .take(pageSize);
        }

        const payoutsWithUser = await Promise.all(
            payouts.map(async (payout) => {
                const engineerName = await resolveUserName(ctx, payout.userId);

                return {
                    ...payout,
                    engineerName,
                    engineerEmail: payout.userId,
                };
            })
        );

        return payoutsWithUser;
    },
});

export const getPayoutStats = query({
    args: {},
    handler: async (ctx) => {
        await requireAuth(ctx);

        const allPayouts = await ctx.db.query("payouts").collect();

        const pending = allPayouts.filter((p) => p.status === "PENDING");
        const paid = allPayouts.filter((p) => p.status === "PAID");

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const paidThisMonth = paid.filter(
            (p) => p.processedAt && p.processedAt >= startOfMonth.getTime()
        );

        return {
            pendingCount: pending.length,
            pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
            paidCount: paid.length,
            paidAmount: paid.reduce((sum, p) => sum + p.amount, 0),
            paidThisMonthCount: paidThisMonth.length,
            paidThisMonthAmount: paidThisMonth.reduce((sum, p) => sum + p.amount, 0),
        };
    },
});

// ============================================
// ADMIN MUTATIONS
// ============================================

export const processPayout = mutation({
    args: {
        payoutId: v.id("payouts"),
        action: v.union(v.literal("pay"), v.literal("reject")),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        const payout = await ctx.db.get(args.payoutId);
        if (!payout) throw new Error("Payout not found");
        if (payout.status !== "PENDING") throw new Error("Payout already processed");

        const wallet = await ctx.db
            .query("wallets")
            .withIndex("by_user", (q) => q.eq("userId", payout.userId))
            .first();

        if (args.action === "pay") {
            await ctx.db.patch(args.payoutId, {
                status: "PAID",
                processedAt: Date.now(),
                processedBy: userId,
                notes: args.notes || payout.notes,
            });

            if (wallet) {
                await ctx.db.patch(wallet._id, {
                    totalWithdrawn: wallet.totalWithdrawn + payout.amount,
                });
            }

            await ctx.db.insert("transactions", {
                userId: payout.userId,
                type: "PAYOUT_COMPLETED",
                amount: 0,
                payoutId: args.payoutId,
                createdAt: Date.now(),
                description: `Payout of ${payout.amount} completed via ${payout.paymentMethod}`,
            });
        } else {
            await ctx.db.patch(args.payoutId, {
                status: "REJECTED",
                processedAt: Date.now(),
                processedBy: userId,
                notes: args.notes || "Rejected by admin",
            });

            if (wallet) {
                await ctx.db.patch(wallet._id, {
                    availableBalance: wallet.availableBalance + payout.amount,
                });
            }

            await ctx.db.insert("transactions", {
                userId: payout.userId,
                type: "PAYOUT_REJECTED",
                amount: payout.amount,
                payoutId: args.payoutId,
                createdAt: Date.now(),
                description: `Payout rejected: ${args.notes || "No reason provided"}`,
            });
        }

        return { success: true };
    },
});

// ============================================
// INTERNAL HELPERS (called from tasks.ts)
// ============================================

export const creditWallet = mutation({
    args: {
        userId: v.string(),
        amount: v.number(),
        taskId: v.id("tasks"),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        let wallet = await ctx.db
            .query("wallets")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();

        if (!wallet) {
            await ctx.db.insert("wallets", {
                userId: args.userId,
                availableBalance: args.amount,
                pendingBalance: 0,
                totalEarned: args.amount,
                totalWithdrawn: 0,
            });
        } else {
            await ctx.db.patch(wallet._id, {
                availableBalance: wallet.availableBalance + args.amount,
                totalEarned: wallet.totalEarned + args.amount,
            });
        }

        await ctx.db.insert("transactions", {
            userId: args.userId,
            type: "TASK_APPROVED",
            amount: args.amount,
            taskId: args.taskId,
            createdAt: Date.now(),
            description: args.description,
        });

        return { success: true };
    },
});
