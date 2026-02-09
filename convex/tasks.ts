import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireManagement, getUserByAuthId } from "./lib/auth";
import { resolveUserName, resolveAssigneeId } from "./lib/users";
import { MILESTONE_GRACE_PERIOD_MS } from "./lib/constants";

// ============================================
// UPLOAD HELPERS
// ============================================

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
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
    const userId = await requireAuth(ctx);
    const assigneeId = await resolveAssigneeId(ctx, args.assignedTo);

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
    const userId = await requireAuth(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    if (task.status === "APPROVED" || task.status === "REJECTED") {
      throw new Error(`Task has already been ${task.status.toLowerCase()}. Cannot change status.`);
    }

    if (task.status !== "SUBMITTED") {
      throw new Error("Task must be submitted before it can be reviewed");
    }

    const user = await getUserByAuthId(ctx, userId);
    const authorName = user?.email || "Lead";

    const updates: {
      status: "APPROVED" | "REJECTED";
      reviewedAt: number;
      rejectionReason?: string;
      comments?: Array<{ text: string; authorId: string; authorName: string; createdAt: number }>;
    } = {
      status: args.action === "approve" ? "APPROVED" : "REJECTED",
      reviewedAt: Date.now(),
    };

    if (args.action === "reject" && args.comment) {
      updates.rejectionReason = args.comment;
    }

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
      let wallet = await ctx.db
        .query("wallets")
        .withIndex("by_user", (q) => q.eq("userId", task.assignedTo))
        .first();

      if (!wallet) {
        await ctx.db.insert("wallets", {
          userId: task.assignedTo,
          availableBalance: task.amount,
          pendingBalance: 0,
          totalEarned: task.amount,
          totalWithdrawn: 0,
        });
      } else {
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

      // MILESTONE TRIGGER: Update linked installments
      if (task.isMilestone) {
        const linkedInstallments = await ctx.db
          .query("installments")
          .withIndex("by_linked_task", (q) => q.eq("linkedConstructionTaskId", args.taskId))
          .collect();

        const now = Date.now();

        for (const installment of linkedInstallments) {
          await ctx.db.patch(installment._id, {
            dueDate: now + MILESTONE_GRACE_PERIOD_MS,
            originalDueDate: installment.dueDate,
          });
        }
      }
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
    const userId = await requireAuth(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const user = await getUserByAuthId(ctx, userId);
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

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireManagement(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    if (task.status !== "PENDING") {
      throw new Error("Only pending tasks can be edited. This task is " + task.status.toLowerCase());
    }

    const updates: {
      title?: string;
      description?: string;
      amount?: number;
      assignedTo?: string;
    } = {};

    if (args.title) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.amount) updates.amount = args.amount;

    if (args.assignedTo) {
      updates.assignedTo = await resolveAssigneeId(ctx, args.assignedTo);
    }

    await ctx.db.patch(args.taskId, updates);
    return { success: true };
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await requireManagement(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    if (task.status !== "PENDING") {
      throw new Error("Only pending tasks can be deleted. This task is " + task.status.toLowerCase());
    }

    if (task.attachments && task.attachments.length > 0) {
      for (const storageId of task.attachments) {
        try {
          await ctx.storage.delete(storageId);
        } catch (_) {
          // Ignore storage deletion errors
        }
      }
    }

    await ctx.db.delete(args.taskId);
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
    const userId = await requireAuth(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const user = await getUserByAuthId(ctx, userId);

    const isAuthorized =
      task.assignedTo === userId ||
      (user?.email && task.assignedTo === user.email);

    if (!isAuthorized) throw new Error("Not authorized");

    if (task.status !== "PENDING" && task.status !== "REJECTED") {
      if (task.status === "APPROVED") {
        throw new Error("This task has already been approved and cannot be restarted");
      } else if (task.status === "SUBMITTED") {
        throw new Error("This task is already submitted and waiting for review");
      } else if (task.status === "IN_PROGRESS") {
        throw new Error("This task is already in progress");
      } else {
        throw new Error(`Cannot start task with status: ${task.status}`);
      }
    }

    const updates: { status: "IN_PROGRESS"; assignedTo?: string } = { status: "IN_PROGRESS" };
    if (task.assignedTo !== userId && user?.email && task.assignedTo === user.email) {
      updates.assignedTo = userId;
    }

    await ctx.db.patch(args.taskId, updates);
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
    const userId = await requireAuth(ctx);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const user = await getUserByAuthId(ctx, userId);

    const isAuthorized =
      task.assignedTo === userId ||
      (user?.email && task.assignedTo === user.email);

    if (!isAuthorized) throw new Error("Not authorized");

    if (task.status !== "IN_PROGRESS") {
      if (task.status === "PENDING") {
        throw new Error("Task must be started before it can be submitted");
      } else if (task.status === "REJECTED") {
        throw new Error("Task was rejected. Please restart the task first");
      } else if (task.status === "SUBMITTED") {
        throw new Error("Task has already been submitted");
      } else if (task.status === "APPROVED") {
        throw new Error("Task has already been approved");
      } else {
        throw new Error(`Cannot submit task with status: ${task.status}`);
      }
    }

    const updates: {
      proofPhotoId: typeof args.storageId;
      proofGps: typeof args.gps;
      submittedAt: number;
      status: "SUBMITTED";
      assignedTo?: string;
    } = {
      proofPhotoId: args.storageId,
      proofGps: args.gps,
      submittedAt: Date.now(),
      status: "SUBMITTED",
    };
    if (task.assignedTo !== userId && user?.email && task.assignedTo === user.email) {
      updates.assignedTo = userId;
    }

    await ctx.db.patch(args.taskId, updates);
    return { success: true };
  },
});

// ============================================
// QUERIES
// ============================================

export const getMyTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const user = await getUserByAuthId(ctx, userId);

    const engineer = await ctx.db
      .query("engineers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignedTo", userId))
      .collect();

    const email = user?.email || engineer?.email;
    if (email) {
      const tasksByEmail = await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("assignedTo"), email))
        .collect();

      const existingIds = new Set(tasks.map((t) => t._id));
      for (const task of tasksByEmail) {
        if (!existingIds.has(task._id)) {
          tasks.push(task);
        }
      }
    }

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
    await requireAuth(ctx);

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "SUBMITTED"))
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

        const engineerName = await resolveUserName(ctx, task.assignedTo);

        return {
          ...task,
          unit: unit.name,
          project: project.name,
          location: project.location,
          photoUrl,
          attachmentUrls: attachmentUrls.filter(Boolean),
          engineerName,
        };
      })
    );

    return tasksWithDetails.filter(Boolean);
  },
});

export const getAllTasks = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const pageSize = args.limit ?? 100;
    const tasks = await ctx.db.query("tasks").take(pageSize);

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

        const engineerName = await resolveUserName(ctx, task.assignedTo);

        return {
          ...task,
          unit: unit.name,
          project: project.name,
          location: project.location,
          photoUrl,
          attachmentUrls: attachmentUrls.filter(Boolean),
          engineerName,
        };
      })
    );

    return tasksWithDetails.filter(Boolean);
  },
});

// ============================================
// STATS
// ============================================

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);

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
