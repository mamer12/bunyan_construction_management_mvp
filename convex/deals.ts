import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireAuth } from "./lib/auth";
import { getUserByAuthId } from "./lib/users";
import { dealStatus, paymentPlan } from "./lib/validators";
import { RESERVATION_DURATION_MS } from "./lib/constants";

// ============================================
// DEAL MANAGEMENT
// ============================================

export const createDeal = mutation({
    args: {
        unitId: v.id("units"),
        leadId: v.id("leads"),
        finalPrice: v.number(),
        discount: v.optional(v.number()),
        paymentPlan: paymentPlan,
        downPayment: v.optional(v.number()),
        notes: v.optional(v.string()),
        brokerId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        // Check unit availability
        const unit = await ctx.db.get(args.unitId);
        if (!unit) throw new Error("Unit not found");
        if (unit.salesStatus === "sold") {
            throw new Error("Unit is already sold");
        }

        // Check for existing active deal on this unit
        const existingDeal = await ctx.db
            .query("deals")
            .withIndex("by_unit", (q) => q.eq("unitId", args.unitId))
            .filter((q) =>
                q.or(
                    q.eq(q.field("status"), "draft"),
                    q.eq(q.field("status"), "reserved"),
                    q.eq(q.field("status"), "contract_signed")
                )
            )
            .first();

        if (existingDeal) {
            throw new Error("An active deal already exists for this unit");
        }

        const user = await getUserByAuthId(ctx, userId);

        const dealId = await ctx.db.insert("deals", {
            unitId: args.unitId,
            leadId: args.leadId,
            brokerId: args.brokerId,
            salesAgentId: user?._id,
            finalPrice: args.finalPrice,
            discount: args.discount,
            status: "draft",
            paymentPlan: args.paymentPlan,
            downPayment: args.downPayment,
            notes: args.notes,
            createdAt: Date.now(),
            createdBy: userId,
        });

        // Update lead status to qualified
        await ctx.db.patch(args.leadId, { status: "qualified" });

        return dealId;
    },
});

export const reserveUnit = mutation({
    args: {
        unitId: v.id("units"),
        leadId: v.id("leads"),
        finalPrice: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        const unit = await ctx.db.get(args.unitId);
        if (!unit) throw new Error("Unit not found");
        if (unit.salesStatus === "sold" || unit.salesStatus === "reserved") {
            throw new Error("Unit is not available");
        }

        const now = Date.now();
        const expiresAt = now + RESERVATION_DURATION_MS;

        const user = await getUserByAuthId(ctx, userId);

        const dealId = await ctx.db.insert("deals", {
            unitId: args.unitId,
            leadId: args.leadId,
            brokerId: user?.role === "broker" ? user._id : undefined,
            salesAgentId: user?.role !== "broker" ? user?._id : undefined,
            finalPrice: args.finalPrice,
            status: "reserved",
            reservationExpiresAt: expiresAt,
            createdAt: now,
            createdBy: userId,
        });

        await ctx.db.patch(args.unitId, {
            salesStatus: "reserved",
            reservedAt: now,
            reservedBy: userId,
            reservationExpiresAt: expiresAt,
        });

        return { dealId, expiresAt };
    },
});

export const updateDealStatus = mutation({
    args: {
        dealId: v.id("deals"),
        status: dealStatus,
        cancellationReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        const deal = await ctx.db.get(args.dealId);
        if (!deal) throw new Error("Deal not found");

        const updates: Record<string, unknown> = { status: args.status };
        const now = Date.now();

        if (args.status === "contract_signed") {
            updates.contractSignedAt = now;
            await ctx.db.patch(deal.unitId, { salesStatus: "sold" });
        } else if (args.status === "completed") {
            updates.completedAt = now;
        } else if (args.status === "cancelled") {
            updates.cancelledAt = now;
            updates.cancellationReason = args.cancellationReason;
            await ctx.db.patch(deal.unitId, {
                salesStatus: "available",
                reservedAt: undefined,
                reservedBy: undefined,
                reservationExpiresAt: undefined,
            });
        }

        await ctx.db.patch(args.dealId, updates);
        return { success: true };
    },
});

export const getDeals = query({
    args: {
        status: v.optional(dealStatus),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const pageSize = args.limit ?? 50;
        let deals;

        if (args.status) {
            deals = await ctx.db
                .query("deals")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .take(pageSize);
        } else {
            deals = await ctx.db.query("deals").take(pageSize);
        }

        // Enrich with unit and lead info
        const enrichedDeals = await Promise.all(
            deals.map(async (deal) => {
                const unit = await ctx.db.get(deal.unitId);
                const lead = await ctx.db.get(deal.leadId);
                let project = null;
                if (unit?.projectId) {
                    project = await ctx.db.get(unit.projectId);
                }

                return {
                    ...deal,
                    unitName: unit?.name,
                    projectName: project?.name,
                    clientName: lead?.name,
                    clientPhone: lead?.phone,
                };
            })
        );

        return enrichedDeals.sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const listDeals = query({
    args: {
        paginationOpts: paginationOptsValidator,
        status: v.optional(dealStatus),
    },
    handler: async (ctx, args) => {
        let baseQuery = ctx.db.query("deals").order("desc");

        if (args.status) {
            baseQuery = ctx.db
                .query("deals")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .order("desc");
        }

        const results = await baseQuery.paginate(args.paginationOpts);

        // Enrich page items with unit/lead/project info
        const enrichedPage = await Promise.all(
            results.page.map(async (deal) => {
                const unit = await ctx.db.get(deal.unitId);
                const lead = await ctx.db.get(deal.leadId);
                let project = null;
                if (unit?.projectId) {
                    project = await ctx.db.get(unit.projectId);
                }

                return {
                    ...deal,
                    unitName: unit?.name,
                    projectName: project?.name,
                    clientName: lead?.name,
                    clientPhone: lead?.phone,
                };
            })
        );

        return {
            ...results,
            page: enrichedPage,
        };
    },
});


export const getDealDetails = query({
    args: { dealId: v.id("deals") },
    handler: async (ctx, args) => {
        const deal = await ctx.db.get(args.dealId);
        if (!deal) return null;

        const unit = await ctx.db.get(deal.unitId);
        const lead = await ctx.db.get(deal.leadId);
        let project = null;
        if (unit?.projectId) {
            project = await ctx.db.get(unit.projectId);
        }

        const installments = await ctx.db
            .query("installments")
            .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
            .collect();

        const activities = await ctx.db
            .query("sales_activities")
            .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
            .collect();

        return {
            ...deal,
            unit,
            lead,
            project,
            installments: installments.sort((a, b) => a.installmentNumber - b.installmentNumber),
            activities: activities.sort((a, b) => b.createdAt - a.createdAt),
        };
    },
});
