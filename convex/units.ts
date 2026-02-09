import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

// ============================================
// UNIT MANAGEMENT (Construction)
// ============================================

export const createUnit = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.string(),
        contractorId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        return await ctx.db.insert("units", {
            projectId: args.projectId,
            name: args.name,
            status: "UNDER_CONSTRUCTION",
            contractorId: args.contractorId,
        });
    },
});

export const getProjectUnits = query({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        const units = await ctx.db
            .query("units")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        const unitsWithStats = await Promise.all(
            units.map(async (unit) => {
                const tasks = await ctx.db
                    .query("tasks")
                    .withIndex("by_unit", (q) => q.eq("unitId", unit._id))
                    .collect();

                const completedTasks = tasks.filter((t) => t.status === "APPROVED").length;
                const totalAmount = tasks.reduce((sum, t) => sum + t.amount, 0);

                return {
                    ...unit,
                    totalTasks: tasks.length,
                    completedTasks,
                    totalAmount,
                };
            })
        );

        return unitsWithStats;
    },
});

export const getAllUnits = query({
    args: {},
    handler: async (ctx) => {
        await requireAuth(ctx);

        const units = await ctx.db.query("units").collect();

        const unitsWithDetails = await Promise.all(
            units.map(async (unit) => {
                const project = await ctx.db.get(unit.projectId);
                if (!project) return null;

                const tasks = await ctx.db
                    .query("tasks")
                    .withIndex("by_unit", (q) => q.eq("unitId", unit._id))
                    .collect();

                return {
                    ...unit,
                    project: project.name,
                    location: project.location,
                    taskCount: tasks.length,
                    completedTasks: tasks.filter((t) => t.status === "APPROVED").length,
                };
            })
        );

        return unitsWithDetails.filter(Boolean);
    },
});
