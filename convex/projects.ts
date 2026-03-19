import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./lib/auth";
import { projectStatus } from "./lib/validators";

// ============================================
// PROJECT MANAGEMENT
// ============================================

export const createProject = mutation({
    args: {
        name: v.string(),
        location: v.string(),
        totalBudget: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        return await ctx.db.insert("projects", {
            name: args.name,
            location: args.location,
            totalBudget: args.totalBudget,
            status: "ACTIVE",
            leadId: userId,
        });
    },
});

export const updateProject = mutation({
    args: {
        projectId: v.id("projects"),
        name: v.optional(v.string()),
        location: v.optional(v.string()),
        totalBudget: v.optional(v.number()),
        status: v.optional(projectStatus),
    },
    handler: async (ctx, args) => {
        await requireRole(ctx, ["admin", "acting_manager"]);

        const updates: {
            name?: string;
            location?: string;
            totalBudget?: number;
            status?: "ACTIVE" | "COMPLETED";
        } = {};

        if (args.name !== undefined) updates.name = args.name;
        if (args.location !== undefined) updates.location = args.location;
        if (args.totalBudget !== undefined) updates.totalBudget = args.totalBudget;
        if (args.status !== undefined) updates.status = args.status;

        await ctx.db.patch(args.projectId, updates);
        return { success: true };
    },
});

export const deleteProject = mutation({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        await requireRole(ctx, ["admin", "acting_manager"]);

        const units = await ctx.db
            .query("units")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        if (units.length > 0) {
            throw new Error("Cannot delete project with active units or villas. Please delete or migrate units first.");
        }

        await ctx.db.delete(args.projectId);
        return { success: true };
    },
});

export const getProjects = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireAuth(ctx);

        const projects = await ctx.db.query("projects").collect();

        const projectsWithStats = await Promise.all(
            projects.map(async (project) => {
                const units = await ctx.db
                    .query("units")
                    .withIndex("by_project", (q) => q.eq("projectId", project._id))
                    .collect();

                const unitIds = new Set(units.map((u) => u._id));

                // Use index-based queries per unit instead of loading all tasks
                let totalTasksCount = 0;
                let completedTasksCount = 0;
                let budgetSpent = 0;

                for (const unit of units) {
                    const tasks = await ctx.db
                        .query("tasks")
                        .withIndex("by_unit", (q) => q.eq("unitId", unit._id))
                        .collect();

                    totalTasksCount += tasks.length;
                    const completed = tasks.filter((t) => t.status === "APPROVED");
                    completedTasksCount += completed.length;
                    budgetSpent += completed.reduce((sum, t) => sum + t.amount, 0);
                }

                return {
                    ...project,
                    completedTasksCount,
                    totalTasksCount,
                    budgetSpent,
                    unitCount: units.length,
                };
            })
        );

        return projectsWithStats;
    },
});
