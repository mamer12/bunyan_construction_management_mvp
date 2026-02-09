import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { salesStatus } from "./lib/validators";
import { THIRTY_DAYS_MS } from "./lib/constants";

// ============================================
// UNIT INVENTORY FOR SALES
// ============================================

export const getUnitsForSales = query({
    args: {
        projectId: v.optional(v.id("projects")),
        salesStatus: v.optional(salesStatus),
    },
    handler: async (ctx, args) => {
        let units;

        if (args.projectId) {
            units = await ctx.db
                .query("units")
                .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
                .collect();
        } else {
            units = await ctx.db.query("units").collect();
        }

        let filtered = units;
        if (args.salesStatus) {
            filtered = units.filter((u) =>
                (u.salesStatus || "available") === args.salesStatus
            );
        }

        const now = Date.now();
        const enriched = await Promise.all(
            filtered.map(async (unit) => {
                const project = await ctx.db.get(unit.projectId);

                let currentSalesStatus = unit.salesStatus || "available";
                let reservationTimeLeft = null;

                if (currentSalesStatus === "reserved" && unit.reservationExpiresAt) {
                    if (unit.reservationExpiresAt < now) {
                        currentSalesStatus = "available";
                    } else {
                        reservationTimeLeft = unit.reservationExpiresAt - now;
                    }
                }

                return {
                    ...unit,
                    projectName: project?.name,
                    projectLocation: project?.location,
                    salesStatus: currentSalesStatus,
                    reservationTimeLeft,
                };
            })
        );

        return enriched;
    },
});

export const updateUnitSalesInfo = mutation({
    args: {
        unitId: v.id("units"),
        listPrice: v.optional(v.number()),
        area: v.optional(v.number()),
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        floor: v.optional(v.number()),
        features: v.optional(v.array(v.string())),
        salesStatus: v.optional(salesStatus),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        const { unitId, ...updates } = args;
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, val]) => val !== undefined)
        );

        await ctx.db.patch(unitId, cleanUpdates);
        return { success: true };
    },
});

export const releaseExpiredReservations = mutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        const reservedUnits = await ctx.db
            .query("units")
            .withIndex("by_sales_status", (q) => q.eq("salesStatus", "reserved"))
            .collect();

        let released = 0;
        for (const unit of reservedUnits) {
            if (unit.reservationExpiresAt && unit.reservationExpiresAt < now) {
                await ctx.db.patch(unit._id, {
                    salesStatus: "available",
                    reservedAt: undefined,
                    reservedBy: undefined,
                    reservationExpiresAt: undefined,
                });

                const deal = await ctx.db
                    .query("deals")
                    .withIndex("by_unit", (q) => q.eq("unitId", unit._id))
                    .filter((q) => q.eq(q.field("status"), "reserved"))
                    .first();

                if (deal) {
                    await ctx.db.patch(deal._id, {
                        status: "cancelled",
                        cancelledAt: now,
                        cancellationReason: "Reservation expired",
                    });
                }

                released++;
            }
        }

        return { released };
    },
});

// ============================================
// SALES STATISTICS
// ============================================

export const getSalesStats = query({
    args: {},
    handler: async (ctx) => {
        // Use indexed queries where possible to reduce memory usage
        const leads = await ctx.db.query("leads").collect();
        const deals = await ctx.db.query("deals").collect();
        const installments = await ctx.db.query("installments").collect();
        const units = await ctx.db.query("units").collect();

        const now = Date.now();
        const thirtyDaysAgo = now - THIRTY_DAYS_MS;

        // Lead stats
        const newLeads = leads.filter((l) => l.createdAt > thirtyDaysAgo).length;
        const qualifiedLeads = leads.filter((l) => l.status === "qualified").length;
        const lostLeads = leads.filter((l) => l.status === "lost").length;

        // Deal stats
        const activeDeals = deals.filter((d) =>
            d.status === "draft" || d.status === "reserved" || d.status === "contract_signed"
        ).length;
        const completedDeals = deals.filter((d) => d.status === "completed").length;
        const totalRevenue = deals
            .filter((d) => d.status === "completed")
            .reduce((sum, d) => sum + d.finalPrice, 0);

        // Unit stats
        const availableUnits = units.filter((u) =>
            !u.salesStatus || u.salesStatus === "available"
        ).length;
        const reservedUnits = units.filter((u) => u.salesStatus === "reserved").length;
        const soldUnits = units.filter((u) => u.salesStatus === "sold").length;

        // Installment stats
        const pendingInstallments = installments.filter((i) => i.status === "pending");
        const pendingAmount = pendingInstallments.reduce((sum, i) => sum + i.amount, 0);
        const overdueInstallments = pendingInstallments.filter((i) => i.dueDate < now);
        const overdueAmount = overdueInstallments.reduce((sum, i) => sum + i.amount, 0);
        const collectedAmount = installments
            .filter((i) => i.status === "paid")
            .reduce((sum, i) => sum + (i.paidAmount || i.amount), 0);

        return {
            leads: {
                total: leads.length,
                newThisMonth: newLeads,
                qualified: qualifiedLeads,
                lost: lostLeads,
                conversionRate: leads.length > 0
                    ? Math.round((qualifiedLeads / leads.length) * 100)
                    : 0,
            },
            deals: {
                active: activeDeals,
                completed: completedDeals,
                totalRevenue,
            },
            units: {
                total: units.length,
                available: availableUnits,
                reserved: reservedUnits,
                sold: soldUnits,
            },
            installments: {
                pendingCount: pendingInstallments.length,
                pendingAmount,
                overdueCount: overdueInstallments.length,
                overdueAmount,
                collectedAmount,
            },
        };
    },
});
