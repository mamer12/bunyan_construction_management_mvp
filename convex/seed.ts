import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Seed sample data for testing
export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const leadId = userId || "demo_lead";

    // Create a sample project
    const projectId = await ctx.db.insert("projects", {
      name: "Al-Mansour Residential Complex",
      location: "Baghdad, Al-Mansour",
      totalBudget: 500000,
      status: "ACTIVE",
      leadId,
    });

    // Create sample units
    const unit1Id = await ctx.db.insert("units", {
      projectId,
      name: "Villa 101",
      status: "UNDER_CONSTRUCTION",
    });

    const unit2Id = await ctx.db.insert("units", {
      projectId,
      name: "Villa 102",
      status: "UNDER_CONSTRUCTION",
    });

    // Create sample engineers
    await ctx.db.insert("engineers", {
      userId: "eng_1",
      name: "Ahmed Hassan",
      email: "ahmed@bunyan.io",
      leadId,
    });

    await ctx.db.insert("engineers", {
      userId: "eng_2",
      name: "Sara Ali",
      email: "sara@bunyan.io",
      leadId,
    });

    // Create sample tasks
    await ctx.db.insert("tasks", {
      unitId: unit1Id,
      title: "Install Electrical Wiring",
      description: "Install main electrical panel and wiring for ground floor",
      amount: 15000,
      status: "PENDING",
      assignedTo: "eng_1",
      assignedBy: leadId,
    });

    await ctx.db.insert("tasks", {
      unitId: unit1Id,
      title: "Plumbing Installation",
      description: "Install water pipes and fixtures for bathrooms",
      amount: 12000,
      status: "SUBMITTED",
      assignedTo: "eng_1",
      assignedBy: leadId,
      submittedAt: Date.now() - 86400000,
    });

    await ctx.db.insert("tasks", {
      unitId: unit2Id,
      title: "Foundation Inspection",
      description: "Inspect and document foundation quality",
      amount: 8000,
      status: "IN_PROGRESS",
      assignedTo: "eng_2",
      assignedBy: leadId,
    });

    await ctx.db.insert("tasks", {
      unitId: unit2Id,
      title: "Roof Waterproofing",
      description: "Apply waterproof coating to roof surface",
      amount: 20000,
      status: "APPROVED",
      assignedTo: "eng_2",
      assignedBy: leadId,
      submittedAt: Date.now() - 172800000,
      reviewedAt: Date.now() - 86400000,
    });

    return { success: true, message: "Sample data created" };
  },
});

// Assign all tasks to the current user (for testing as engineer)
export const assignTasksToMe = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const tasks = await ctx.db.query("tasks").collect();

    for (const task of tasks) {
      await ctx.db.patch(task._id, { assignedTo: userId });
    }

    // Also update any engineer record
    const engineers = await ctx.db.query("engineers").collect();
    if (engineers.length > 0) {
      await ctx.db.patch(engineers[0]._id, { userId });
    }

    return { success: true, message: `Assigned ${tasks.length} tasks to you` };
  },
});

// Clear all data (for testing)
export const clearData = mutation({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    for (const task of tasks) await ctx.db.delete(task._id);

    const units = await ctx.db.query("units").collect();
    for (const unit of units) await ctx.db.delete(unit._id);

    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) await ctx.db.delete(project._id);

    const engineers = await ctx.db.query("engineers").collect();
    for (const engineer of engineers) await ctx.db.delete(engineer._id);

    return { success: true, message: "All data cleared" };
  },
});
