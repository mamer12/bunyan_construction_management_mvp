import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================
// LEAD MANAGEMENT
// ============================================

// Create a new lead
export const createLead = mutation({
    args: {
        name: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        source: v.string(), // "walk-in", "facebook", "broker_referral", "website", "referral"
        notes: v.optional(v.string()),
        budget: v.optional(v.number()),
        preferredBedrooms: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check for duplicate phone
        const existing = await ctx.db
            .query("leads")
            .withIndex("by_phone", (q) => q.eq("phone", args.phone))
            .first();

        if (existing) {
            throw new Error("Lead with this phone number already exists");
        }

        // Get user info for referral tracking
        const user = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        const leadId = await ctx.db.insert("leads", {
            name: args.name,
            phone: args.phone,
            email: args.email,
            status: "new",
            source: args.source,
            assignedTo: user?._id,
            referredBy: args.source === "broker_referral" ? user?._id : undefined,
            notes: args.notes,
            budget: args.budget,
            preferredBedrooms: args.preferredBedrooms,
            createdAt: Date.now(),
        });

        return leadId;
    },
});

// Update lead status
export const updateLeadStatus = mutation({
    args: {
        leadId: v.id("leads"),
        status: v.string(), // "new", "contacted", "qualified", "lost"
        lostReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const updates: any = {
            status: args.status,
            lastContactedAt: Date.now(),
        };

        if (args.status === "lost" && args.lostReason) {
            updates.lostReason = args.lostReason;
        }

        await ctx.db.patch(args.leadId, updates);
        return { success: true };
    },
});

// Update lead details
export const updateLead = mutation({
    args: {
        leadId: v.id("leads"),
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        notes: v.optional(v.string()),
        budget: v.optional(v.number()),
        preferredBedrooms: v.optional(v.number()),
        assignedTo: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const { leadId, ...updates } = args;
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(leadId, cleanUpdates);
        return { success: true };
    },
});

// Get all leads
export const getLeads = query({
    args: {
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let leads;

        if (args.status) {
            leads = await ctx.db
                .query("leads")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .collect();
        } else {
            leads = await ctx.db.query("leads").collect();
        }

        // Enrich with assigned user info
        const enrichedLeads = await Promise.all(
            leads.map(async (lead) => {
                let assignedUser = null;
                if (lead.assignedTo) {
                    assignedUser = await ctx.db.get(lead.assignedTo);
                }
                return {
                    ...lead,
                    assignedUserName: assignedUser?.name,
                };
            })
        );

        return enrichedLeads.sort((a, b) => b.createdAt - a.createdAt);
    },
});

// Get lead by ID with activities
export const getLeadDetails = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead) return null;

        // Get activities
        const activities = await ctx.db
            .query("sales_activities")
            .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
            .collect();

        // Get deals for this lead
        const deals = await ctx.db
            .query("deals")
            .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
            .collect();

        return {
            ...lead,
            activities: activities.sort((a, b) => b.createdAt - a.createdAt),
            deals,
        };
    },
});

// Add activity to lead
export const addLeadActivity = mutation({
    args: {
        leadId: v.id("leads"),
        type: v.string(), // "call", "meeting", "site_visit", "email", "note"
        description: v.string(),
        outcome: v.optional(v.string()),
        scheduledAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const activityId = await ctx.db.insert("sales_activities", {
            leadId: args.leadId,
            type: args.type,
            description: args.description,
            outcome: args.outcome,
            scheduledAt: args.scheduledAt,
            createdBy: userId,
            createdAt: Date.now(),
        });

        // Update lead's last contacted date
        await ctx.db.patch(args.leadId, {
            lastContactedAt: Date.now(),
        });

        return activityId;
    },
});

// ============================================
// DEAL MANAGEMENT
// ============================================

// Create a new deal
export const createDeal = mutation({
    args: {
        unitId: v.id("units"),
        leadId: v.id("leads"),
        finalPrice: v.number(),
        discount: v.optional(v.number()),
        paymentPlan: v.string(), // "cash", "monthly", "construction_linked"
        downPayment: v.optional(v.number()),
        notes: v.optional(v.string()),
        brokerId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

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

        // Get user info
        const user = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

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

// Reserve a unit (24-hour hold)
export const reserveUnit = mutation({
    args: {
        unitId: v.id("units"),
        leadId: v.id("leads"),
        finalPrice: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Check unit availability
        const unit = await ctx.db.get(args.unitId);
        if (!unit) throw new Error("Unit not found");
        if (unit.salesStatus === "sold" || unit.salesStatus === "reserved") {
            throw new Error("Unit is not available");
        }

        const now = Date.now();
        const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

        // Get user info
        const user = await ctx.db
            .query("users")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        // Create deal with reservation
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

        // Update unit status
        await ctx.db.patch(args.unitId, {
            salesStatus: "reserved",
            reservedAt: now,
            reservedBy: userId,
            reservationExpiresAt: expiresAt,
        });

        return { dealId, expiresAt };
    },
});

// Update deal status
export const updateDealStatus = mutation({
    args: {
        dealId: v.id("deals"),
        status: v.string(), // "contract_signed", "completed", "cancelled"
        cancellationReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const deal = await ctx.db.get(args.dealId);
        if (!deal) throw new Error("Deal not found");

        const updates: any = { status: args.status };
        const now = Date.now();

        if (args.status === "contract_signed") {
            updates.contractSignedAt = now;
            // Update unit to sold
            await ctx.db.patch(deal.unitId, { salesStatus: "sold" });
        } else if (args.status === "completed") {
            updates.completedAt = now;
        } else if (args.status === "cancelled") {
            updates.cancelledAt = now;
            updates.cancellationReason = args.cancellationReason;
            // Release unit
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

// Get all deals
export const getDeals = query({
    args: {
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let deals;

        if (args.status) {
            deals = await ctx.db
                .query("deals")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .collect();
        } else {
            deals = await ctx.db.query("deals").collect();
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

// Get deal details
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

        // Get installments
        const installments = await ctx.db
            .query("installments")
            .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
            .collect();

        // Get activities
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

// ============================================
// INSTALLMENT MANAGEMENT (Aqsat Engine)
// ============================================

// Generate installment plan
export const generateInstallmentPlan = mutation({
    args: {
        dealId: v.id("deals"),
        planType: v.string(), // "monthly", "construction_linked"
        numberOfInstallments: v.optional(v.number()), // For monthly plan
        milestones: v.optional(v.array(v.object({
            milestoneType: v.string(), // "foundation", "structure", "roof", "finish"
            taskId: v.optional(v.id("tasks")),
            percentage: v.number(), // Percentage of total
        }))), // For construction_linked plan
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const deal = await ctx.db.get(args.dealId);
        if (!deal) throw new Error("Deal not found");

        const remainingAmount = deal.finalPrice - (deal.downPayment || 0);
        const now = Date.now();
        const installmentIds: string[] = [];

        if (args.planType === "monthly" && args.numberOfInstallments) {
            const installmentAmount = Math.ceil(remainingAmount / args.numberOfInstallments);

            for (let i = 1; i <= args.numberOfInstallments; i++) {
                // Calculate due date (30 days apart)
                const dueDate = now + i * 30 * 24 * 60 * 60 * 1000;

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

                // If no task linked, set due date far in future (will be updated when milestone completes)
                const dueDate = milestone.taskId
                    ? now + 365 * 24 * 60 * 60 * 1000 // Far future, will be updated
                    : now + 30 * 24 * 60 * 60 * 1000; // 30 days default

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

        // Update deal with payment plan
        await ctx.db.patch(args.dealId, { paymentPlan: args.planType });

        return { installmentIds, count: installmentIds.length };
    },
});

// Record installment payment
export const recordInstallmentPayment = mutation({
    args: {
        installmentId: v.id("installments"),
        paidAmount: v.number(),
        paymentMethod: v.string(),
        receiptNumber: v.optional(v.string()),
        notes: v.optional(v.string()),
        paymentProofStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

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

// Get overdue installments
export const getOverdueInstallments = query({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();

        const allPending = await ctx.db
            .query("installments")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();

        const overdue = allPending.filter((i) => i.dueDate < now);

        // Enrich with deal and client info
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

// Get deal installments
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

// ============================================
// UNIT INVENTORY FOR SALES
// ============================================

// Get units for sales view
export const getUnitsForSales = query({
    args: {
        projectId: v.optional(v.id("projects")),
        salesStatus: v.optional(v.string()),
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

        // Filter by sales status if provided
        let filtered = units;
        if (args.salesStatus) {
            filtered = units.filter((u) =>
                (u.salesStatus || "available") === args.salesStatus
            );
        }

        // Enrich with project info and check reservation expiry
        const now = Date.now();
        const enriched = await Promise.all(
            filtered.map(async (unit) => {
                const project = await ctx.db.get(unit.projectId);

                // Check if reservation expired
                let currentSalesStatus = unit.salesStatus || "available";
                let reservationTimeLeft = null;

                if (currentSalesStatus === "reserved" && unit.reservationExpiresAt) {
                    if (unit.reservationExpiresAt < now) {
                        // Reservation expired - release it
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

// Update unit sales info
export const updateUnitSalesInfo = mutation({
    args: {
        unitId: v.id("units"),
        listPrice: v.optional(v.number()),
        area: v.optional(v.number()),
        bedrooms: v.optional(v.number()),
        bathrooms: v.optional(v.number()),
        floor: v.optional(v.number()),
        features: v.optional(v.array(v.string())),
        salesStatus: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const { unitId, ...updates } = args;
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, v]) => v !== undefined)
        );

        await ctx.db.patch(unitId, cleanUpdates);
        return { success: true };
    },
});

// Release expired reservations (called by cron or manually)
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

                // Also cancel/expire the associated deal
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
        const leads = await ctx.db.query("leads").collect();
        const deals = await ctx.db.query("deals").collect();
        const installments = await ctx.db.query("installments").collect();
        const units = await ctx.db.query("units").collect();

        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

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
