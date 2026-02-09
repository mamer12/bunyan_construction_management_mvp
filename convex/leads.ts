import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { leadStatus, leadSource, activityType } from "./lib/validators";

// ============================================
// LEAD MANAGEMENT
// ============================================

export const createLead = mutation({
    args: {
        name: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        source: leadSource,
        notes: v.optional(v.string()),
        budget: v.optional(v.number()),
        preferredBedrooms: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

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

export const updateLeadStatus = mutation({
    args: {
        leadId: v.id("leads"),
        status: leadStatus,
        lostReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        const updates: {
            status: typeof args.status;
            lastContactedAt: number;
            lostReason?: string;
        } = {
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
        await requireAuth(ctx);

        const { leadId, ...updates } = args;
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([_, val]) => val !== undefined)
        );

        await ctx.db.patch(leadId, cleanUpdates);
        return { success: true };
    },
});

export const getLeads = query({
    args: {
        status: v.optional(leadStatus),
        limit: v.optional(v.number()),
        cursor: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const pageSize = args.limit ?? 50;
        let leads;

        if (args.status) {
            leads = await ctx.db
                .query("leads")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .take(pageSize);
        } else {
            leads = await ctx.db.query("leads").take(pageSize);
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

export const getLeadDetails = query({
    args: { leadId: v.id("leads") },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.leadId);
        if (!lead) return null;

        const activities = await ctx.db
            .query("sales_activities")
            .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
            .collect();

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

export const addLeadActivity = mutation({
    args: {
        leadId: v.id("leads"),
        type: activityType,
        description: v.string(),
        outcome: v.optional(v.string()),
        scheduledAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        const activityId = await ctx.db.insert("sales_activities", {
            leadId: args.leadId,
            type: args.type,
            description: args.description,
            outcome: args.outcome,
            scheduledAt: args.scheduledAt,
            createdBy: userId,
            createdAt: Date.now(),
        });

        await ctx.db.patch(args.leadId, {
            lastContactedAt: Date.now(),
        });

        return activityId;
    },
});
