import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";

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
