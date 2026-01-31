import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================
// UPLOAD HELPERS
// ============================================

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// ============================================
// ENGINEER MANAGEMENT
// ============================================

export const addEngineer = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if engineer with this email already exists
    const existing = await ctx.db
      .query("engineers")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existing) {
      throw new Error("Engineer with this email already exists");
    }

    return await ctx.db.insert("engineers", {
      userId: "", // Will be set when engineer signs up
      name: args.name,
      email: args.email,
      leadId: userId,
    });
  },
});

export const getMyEngineers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("engineers")
      .withIndex("by_lead", (q) => q.eq("leadId", userId))
      .collect();
  },
});

// ============================================
// TASK MANAGEMENT - LEAD ACTIONS
// ============================================

export const createTask = mutation({
  args: {
    unitId: v.id("units"),
    title: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    assignedTo: v.string(), // Engineer email
    attachments: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Find engineer by email
    const engineer = await ctx.db
      .query("engineers")
      .filter((q) => q.eq(q.field("email"), args.assignedTo))
      .first();

    const assigneeId = engineer?.userId || args.assignedTo;

    return await ctx.db.insert("tasks", {
      unitId: args.unitId,
      title: args.title,
      description: args.description,
      amount: args.amount,
      status: "PENDING",
      assignedTo: assigneeId,
      assignedBy: userId,
      attachments: args.attachments,
    });
  },
});

export const reviewTask = mutation({
  args: {
    taskId: v.id("tasks"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const user = await ctx.db.get(userId);
    const authorName = user?.email || "Lead";

    const updates: any = {
      status: args.action === "approve" ? "APPROVED" : "REJECTED",
      reviewedAt: Date.now(),
    };

    if (args.action === "reject" && args.comment) {
      updates.rejectionReason = args.comment;
    }

    // Add comment if provided
    if (args.comment) {
      const existingComments = task.comments || [];
      updates.comments = [
        ...existingComments,
        {
          text: args.comment,
          authorId: userId,
          authorName,
          createdAt: Date.now(),
        },
      ];
    }

    await ctx.db.patch(args.taskId, updates);

    // CREDIT WALLET when task is approved
    if (args.action === "approve") {
      // Get or create wallet for the engineer
      let wallet = await ctx.db
        .query("wallets")
        .withIndex("by_user", (q) => q.eq("userId", task.assignedTo))
        .first();

      if (!wallet) {
        // Create new wallet
        await ctx.db.insert("wallets", {
          userId: task.assignedTo,
          availableBalance: task.amount,
          pendingBalance: 0,
          totalEarned: task.amount,
          totalWithdrawn: 0,
        });
      } else {
        // Update existing wallet
        await ctx.db.patch(wallet._id, {
          availableBalance: wallet.availableBalance + task.amount,
          totalEarned: wallet.totalEarned + task.amount,
        });
      }

      // Add transaction record
      await ctx.db.insert("transactions", {
        userId: task.assignedTo,
        type: "TASK_APPROVED",
        amount: task.amount,
        taskId: args.taskId,
        createdAt: Date.now(),
        description: `Task approved: ${task.title}`,
      });
    }

    return { success: true };
  },
});

export const addComment = mutation({
  args: {
    taskId: v.id("tasks"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const user = await ctx.db.get(userId);
    const authorName = user?.email || "User";

    const existingComments = task.comments || [];
    await ctx.db.patch(args.taskId, {
      comments: [
        ...existingComments,
        {
          text: args.text,
          authorId: userId,
          authorName,
          createdAt: Date.now(),
        },
      ],
    });

    return { success: true };
  },
});

// ============================================
// TASK MANAGEMENT - ENGINEER ACTIONS
// ============================================

export const startTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    if (task.assignedTo !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.taskId, {
      status: "IN_PROGRESS",
    });

    return { success: true };
  },
});

export const submitTask = mutation({
  args: {
    taskId: v.id("tasks"),
    storageId: v.id("_storage"),
    gps: v.optional(v.object({ lat: v.number(), lng: v.number() })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    if (task.assignedTo !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.taskId, {
      proofPhotoId: args.storageId,
      proofGps: args.gps,
      submittedAt: Date.now(),
      status: "SUBMITTED",
    });

    return { success: true };
  },
});

// ============================================
// QUERIES
// ============================================

export const getMyTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignedTo", userId))
      .collect();

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const unit = await ctx.db.get(task.unitId);
        if (!unit) return null;

        const project = await ctx.db.get(unit.projectId);
        if (!project) return null;

        let photoUrl = null;
        if (task.proofPhotoId) {
          photoUrl = await ctx.storage.getUrl(task.proofPhotoId);
        }

        // Get attachment URLs
        const attachmentUrls = await Promise.all(
          (task.attachments || []).map((id) => ctx.storage.getUrl(id))
        );

        return {
          ...task,
          unit: unit.name,
          project: project.name,
          location: project.location,
          photoUrl,
          attachmentUrls: attachmentUrls.filter(Boolean),
        };
      })
    );

    return tasksWithDetails.filter(Boolean);
  },
});

export const getTasksForReview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get all tasks created by this lead that are submitted
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("status"), "SUBMITTED"))
      .collect();

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const unit = await ctx.db.get(task.unitId);
        if (!unit) return null;

        const project = await ctx.db.get(unit.projectId);
        if (!project) return null;

        let photoUrl = null;
        if (task.proofPhotoId) {
          photoUrl = await ctx.storage.getUrl(task.proofPhotoId);
        }

        const attachmentUrls = await Promise.all(
          (task.attachments || []).map((id) => ctx.storage.getUrl(id))
        );

        // Get engineer info
        const engineer = await ctx.db
          .query("engineers")
          .filter((q) => q.eq(q.field("userId"), task.assignedTo))
          .first();

        return {
          ...task,
          unit: unit.name,
          project: project.name,
          location: project.location,
          photoUrl,
          attachmentUrls: attachmentUrls.filter(Boolean),
          engineerName: engineer?.name || "Unknown",
        };
      })
    );

    return tasksWithDetails.filter(Boolean);
  },
});

export const getAllTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const tasks = await ctx.db.query("tasks").collect();

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const unit = await ctx.db.get(task.unitId);
        if (!unit) return null;

        const project = await ctx.db.get(unit.projectId);
        if (!project) return null;

        let photoUrl = null;
        if (task.proofPhotoId) {
          photoUrl = await ctx.storage.getUrl(task.proofPhotoId);
        }

        const attachmentUrls = await Promise.all(
          (task.attachments || []).map((id) => ctx.storage.getUrl(id))
        );

        const engineer = await ctx.db
          .query("engineers")
          .filter((q) => q.eq(q.field("userId"), task.assignedTo))
          .first();

        return {
          ...task,
          unit: unit.name,
          project: project.name,
          location: project.location,
          photoUrl,
          attachmentUrls: attachmentUrls.filter(Boolean),
          engineerName: engineer?.name || task.assignedTo,
        };
      })
    );

    return tasksWithDetails.filter(Boolean);
  },
});

export const createUnit = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    contractorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

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

        const completedTasks = tasks.filter(t => t.status === "APPROVED").length;
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

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

export const createProject = mutation({
  args: {
    name: v.string(),
    location: v.string(),
    totalBudget: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const projects = await ctx.db.query("projects").collect();

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        // Get all units for this project
        const units = await ctx.db
          .query("units")
          .withIndex("by_project", q => q.eq("projectId", project._id))
          .collect();

        const unitIds = units.map(u => u._id);

        // Get all tasks for these units (inefficient but works for MVP)
        const allTasks = await ctx.db.query("tasks").collect();
        const projectTasks = allTasks.filter(t => unitIds.some(uid => uid === t.unitId));

        const completedTasks = projectTasks.filter(t => t.status === "APPROVED");
        const budgetSpent = completedTasks.reduce((sum, t) => sum + t.amount, 0);

        return {
          ...project,
          completedTasksCount: completedTasks.length,
          totalTasksCount: projectTasks.length,
          budgetSpent,
          unitCount: units.length
        };
      })
    );

    return projectsWithStats;
  },
});

// ============================================
// STATS
// ============================================

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const allTasks = await ctx.db.query("tasks").collect();

    return {
      total: allTasks.length,
      pending: allTasks.filter((t) => t.status === "PENDING").length,
      inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
      submitted: allTasks.filter((t) => t.status === "SUBMITTED").length,
      approved: allTasks.filter((t) => t.status === "APPROVED").length,
      rejected: allTasks.filter((t) => t.status === "REJECTED").length,
    };
  },
});
