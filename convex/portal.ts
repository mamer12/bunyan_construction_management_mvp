import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/auth";

// ============================================
// PUBLIC VIEWER (Magic Link) - No Auth Required
// ============================================

export const generatePublicAccessToken = mutation({
    args: {
        dealId: v.id("deals"),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        const deal = await ctx.db.get(args.dealId);
        if (!deal) throw new Error("Deal not found");

        const token = `${deal.unitId.split("|")[1]?.slice(0, 8) || "unit"}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

        await ctx.db.patch(args.dealId, {
            publicAccessToken: token,
            publicAccessEnabled: true,
        });

        // Log action in audit
        await ctx.db.insert("audit_logs", {
            userId,
            action: "create",
            entityType: "deal",
            entityId: args.dealId,
            metadata: JSON.stringify({ token, action: "generate_public_link" }),
            createdAt: Date.now(),
        });

        return token;
    },
});

export const disablePublicAccess = mutation({
    args: {
        dealId: v.id("deals"),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        await ctx.db.patch(args.dealId, {
            publicAccessEnabled: false,
        });

        return { success: true };
    },
});

// Public query - NO AUTH REQUIRED
export const getPublicDealView = query({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const deal = await ctx.db
            .query("deals")
            .withIndex("by_public_token", (q) => q.eq("publicAccessToken", args.token))
            .first();

        if (!deal || !deal.publicAccessEnabled) {
            return null;
        }

        const unit = await ctx.db.get(deal.unitId);
        if (!unit) return null;

        const project = await ctx.db.get(unit.projectId);
        const lead = await ctx.db.get(deal.leadId);

        const allTasks = await ctx.db
            .query("tasks")
            .withIndex("by_unit", (q) => q.eq("unitId", deal.unitId))
            .collect();

        const milestones = allTasks
            .filter((t) => t.isMilestone)
            .map((task) => ({
                type: task.milestoneType,
                title: task.title,
                status: task.status,
                isComplete: task.status === "APPROVED",
                completedAt: task.reviewedAt,
                proofPhotoId: task.status === "APPROVED" ? task.proofPhotoId : undefined,
            }));

        const installments = await ctx.db
            .query("installments")
            .withIndex("by_deal", (q) => q.eq("dealId", deal._id))
            .collect();

        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter((t) => t.status === "APPROVED").length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const pendingInstallments = installments
            .filter((i) => i.status === "pending")
            .sort((a, b) => a.dueDate - b.dueDate);
        const nextInstallment = pendingInstallments[0] || null;

        const totalPaid = installments
            .filter((i) => i.status === "paid")
            .reduce((sum, i) => sum + (i.paidAmount || i.amount), 0);
        const totalDue = deal.finalPrice;
        const remaining = totalDue - totalPaid - (deal.downPayment || 0);

        return {
            unitName: unit.name,
            projectName: project?.name,
            projectLocation: project?.location,
            area: unit.area,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
            floor: unit.floor,
            features: unit.features,
            buyerName: lead?.name ? lead.name.split(" ")[0] : "Customer",
            purchaseDate: deal.createdAt,
            totalPrice: deal.finalPrice,
            downPayment: deal.downPayment,
            paymentPlan: deal.paymentPlan,
            progressPercentage,
            milestones,
            totalTasks,
            completedTasks,
            totalPaid,
            remaining,
            nextInstallment: nextInstallment ? {
                amount: nextInstallment.amount,
                dueDate: nextInstallment.dueDate,
                milestoneType: nextInstallment.milestoneType,
                installmentNumber: nextInstallment.installmentNumber,
            } : null,
            installmentSchedule: installments.map((i) => ({
                number: i.installmentNumber,
                amount: i.amount,
                dueDate: i.dueDate,
                status: i.status,
                milestoneType: i.milestoneType,
            })).sort((a, b) => a.number - b.number),
        };
    },
});

export const getPublicProofPhotoUrl = query({
    args: {
        token: v.string(),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        const deal = await ctx.db
            .query("deals")
            .withIndex("by_public_token", (q) => q.eq("publicAccessToken", args.token))
            .first();

        if (!deal || !deal.publicAccessEnabled) {
            return null;
        }

        return await ctx.storage.getUrl(args.storageId);
    },
});
