import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { paymentPlan, paymentMethod, milestoneType } from "./lib/validators";
import { INSTALLMENT_INTERVAL_MS, FAR_FUTURE_PLACEHOLDER_MS } from "./lib/constants";

// ============================================
// INSTALLMENT MANAGEMENT (Aqsat Engine)
// ============================================

export const generateInstallmentPlan = mutation({
    args: {
        dealId: v.id("deals"),
        planType: paymentPlan,
        numberOfInstallments: v.optional(v.number()),
        milestones: v.optional(v.array(v.object({
            milestoneType: milestoneType,
            taskId: v.optional(v.id("tasks")),
            percentage: v.number(),
        }))),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        const deal = await ctx.db.get(args.dealId);
        if (!deal) throw new Error("Deal not found");

        const remainingAmount = deal.finalPrice - (deal.downPayment || 0);
        const now = Date.now();
        const installmentIds: string[] = [];

        if (args.planType === "monthly" && args.numberOfInstallments) {
            const installmentAmount = Math.ceil(remainingAmount / args.numberOfInstallments);

            for (let i = 1; i <= args.numberOfInstallments; i++) {
                const dueDate = now + i * INSTALLMENT_INTERVAL_MS;

                const id = await ctx.db.insert("installments", {
                    dealId: args.dealId,
                    installmentNumber: i,
                    amount: i === args.numberOfInstallments
                        ? remainingAmount - (installmentAmount * (args.numberOfInstallments - 1))
                        : installmentAmount,
                    dueDate,
                    status: "pending",
                    createdAt: now,
                });
                installmentIds.push(id);
            }
        } else if (args.planType === "construction_linked" && args.milestones) {
            let installmentNumber = 1;

            for (const milestone of args.milestones) {
                const amount = Math.ceil((milestone.percentage / 100) * remainingAmount);

                const dueDate = milestone.taskId
                    ? now + FAR_FUTURE_PLACEHOLDER_MS
                    : now + INSTALLMENT_INTERVAL_MS;

                const id = await ctx.db.insert("installments", {
                    dealId: args.dealId,
                    installmentNumber,
                    amount,
                    dueDate,
                    originalDueDate: dueDate,
                    linkedConstructionTaskId: milestone.taskId,
                    milestoneType: milestone.milestoneType,
                    status: "pending",
                    createdAt: now,
                });
                installmentIds.push(id);
                installmentNumber++;
            }
        }

        await ctx.db.patch(args.dealId, { paymentPlan: args.planType });

        return { installmentIds, count: installmentIds.length };
    },
});

export const recordInstallmentPayment = mutation({
    args: {
        installmentId: v.id("installments"),
        paidAmount: v.number(),
        paymentMethod: paymentMethod,
        receiptNumber: v.optional(v.string()),
        notes: v.optional(v.string()),
        paymentProofStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        await ctx.db.patch(args.installmentId, {
            status: "paid",
            paidAt: Date.now(),
            paidAmount: args.paidAmount,
            paymentMethod: args.paymentMethod,
            receiptNumber: args.receiptNumber,
            notes: args.notes,
            paymentProofStorageId: args.paymentProofStorageId,
            recordedBy: userId,
        });

        return { success: true };
    },
});

export const getOverdueInstallments = query({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        const allPending = await ctx.db
            .query("installments")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        const overdue = allPending.filter((i) => i.dueDate < now);

        const enriched = await Promise.all(
            overdue.map(async (installment) => {
                const deal = await ctx.db.get(installment.dealId);
                if (!deal) return null;

                const lead = await ctx.db.get(deal.leadId);
                const unit = await ctx.db.get(deal.unitId);

                return {
                    ...installment,
                    clientName: lead?.name,
                    clientPhone: lead?.phone,
                    unitName: unit?.name,
                    daysOverdue: Math.floor((now - installment.dueDate) / (24 * 60 * 60 * 1000)),
                };
            })
        );

        return enriched.filter(Boolean);
    },
});

export const getDealInstallments = query({
    args: { dealId: v.id("deals") },
    handler: async (ctx, args) => {
        const installments = await ctx.db
            .query("installments")
            .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
            .collect();

        return installments.sort((a, b) => a.installmentNumber - b.installmentNumber);
    },
});
