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

    // First, check if there's a user with this email (registered user)
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.assignedTo))
      .first();

    if (user && user.userId) {
      // User already registered, use their Auth ID
      return await ctx.db.insert("tasks", {
        unitId: args.unitId,
        title: args.title,
        description: args.description,
        amount: args.amount,
        status: "PENDING",
        assignedTo: user.userId,
        assignedBy: userId,
        attachments: args.attachments,
      });
    }

    // Check engineers table
    const engineer = await ctx.db
      .query("engineers")
      .filter((q) => q.eq(q.field("email"), args.assignedTo))
      .first();

    // Use engineer's userId only if it's not empty, otherwise use email
    const assigneeId = (engineer?.userId && engineer.userId.length > 0)
      ? engineer.userId
      : args.assignedTo;

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

    // Prevent reviewing already finalized tasks
    if (task.status === "APPROVED" || task.status === "REJECTED") {
      throw new Error(`Task has already been ${task.status.toLowerCase()}. Cannot change status.`);
    }

    // Only allow reviewing SUBMITTED tasks
    if (task.status !== "SUBMITTED") {
      throw new Error("Task must be submitted before it can be reviewed");
    }

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

      // === MILESTONE TRIGGER: Update linked installments ===
      if (task.isMilestone) {
        // Find all installments linked to this task
        const linkedInstallments = await ctx.db
          .query("installments")
          .withIndex("by_linked_task", (q) => q.eq("linkedConstructionTaskId", args.taskId))
          .collect();

        const now = Date.now();
        const gracePeriod = 7 * 24 * 60 * 60 * 1000; // 7 days grace period

        for (const installment of linkedInstallments) {
          // Update due date to now + grace period
          await ctx.db.patch(installment._id, {
            dueDate: now + gracePeriod,
            originalDueDate: installment.dueDate,
          });
        }

        // Note: In production, you'd also want to trigger notifications here
        // to the sales team about the milestone completion
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

// Update task (Lead/Admin only, only PENDING tasks)
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    amount: v.optional(v.number()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Check if user is admin or lead
    const user = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!user || !["admin", "lead", "acting_manager"].includes(user.role || "")) {
      throw new Error("Only leads and admins can edit tasks");
    }

    // Only PENDING tasks can be edited
    if (task.status !== "PENDING") {
      throw new Error("Only pending tasks can be edited. This task is " + task.status.toLowerCase());
    }

    // Build update object
    const updates: any = {};
    if (args.title) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.amount) updates.amount = args.amount;

    // Handle reassignment
    if (args.assignedTo) {
      // Check if new assignee is a registered user
      const newUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.assignedTo))
        .first();

      if (newUser && newUser.userId) {
        updates.assignedTo = newUser.userId;
      } else {
        // Check engineers table
        const engineer = await ctx.db
          .query("engineers")
          .filter((q) => q.eq(q.field("email"), args.assignedTo))
          .first();

        if (engineer?.userId) {
          updates.assignedTo = engineer.userId;
        } else {
          updates.assignedTo = args.assignedTo; // Store email for now
        }
      }
    }

    await ctx.db.patch(args.taskId, updates);
    return { success: true };
  },
});

// Delete task (Lead/Admin only, only PENDING tasks)
export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Check if user is admin or lead
    const user = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!user || !["admin", "lead", "acting_manager"].includes(user.role || "")) {
      throw new Error("Only leads and admins can delete tasks");
    }

    // Only PENDING tasks can be deleted
    if (task.status !== "PENDING") {
      throw new Error("Only pending tasks can be deleted. This task is " + task.status.toLowerCase());
    }

    // Delete any uploaded attachments
    if (task.attachments && task.attachments.length > 0) {
      for (const storageId of task.attachments) {
        try {
          await ctx.storage.delete(storageId);
        } catch (e) {
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Get user's email for authorization check
    const user = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Check authorization: either by Auth ID or by email
    const isAuthorized =
      task.assignedTo === userId ||
      (user?.email && task.assignedTo === user.email);

    if (!isAuthorized) throw new Error("Not authorized");

    // Status validation: Only PENDING or REJECTED tasks can be started
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

    // Update task - also update assignedTo to use Auth ID if it was email
    const updates: any = { status: "IN_PROGRESS" };
    if (task.assignedTo !== userId && user?.email && task.assignedTo === user.email) {
      updates.assignedTo = userId; // Migrate from email to Auth ID
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Get user's email for authorization check
    const user = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Check authorization: either by Auth ID or by email
    const isAuthorized =
      task.assignedTo === userId ||
      (user?.email && task.assignedTo === user.email);

    if (!isAuthorized) throw new Error("Not authorized");

    // Status validation: Only IN_PROGRESS tasks can be submitted
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

    // Update task - also migrate assignedTo to Auth ID if needed
    const updates: any = {
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get user's email for fallback search
    // Need to filter for entries with email since Auth creates minimal entries
    const users = await ctx.db
      .query("users")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Find the user entry with an email (not the Auth-created one)
    const user = users.find(u => u.email && u.role);

    // Also check engineers table for email
    const engineer = await ctx.db
      .query("engineers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Query tasks by Auth ID
    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignedTo", userId))
      .collect();

    // Also always try searching by email (in case tasks were assigned by email)
    const email = user?.email || engineer?.email;
    if (email) {
      const tasksByEmail = await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("assignedTo"), email))
        .collect();

      // Merge tasks, avoiding duplicates
      const existingIds = new Set(tasks.map(t => t._id));
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

        // Get engineer info - check users table first, then engineers table
        let engineerName = "Unknown";

        // First, try to find in users table by userId
        const user = await ctx.db
          .query("users")
          .withIndex("by_user", (q) => q.eq("userId", task.assignedTo))
          .first();

        if (user?.name) {
          engineerName = user.name;
        } else {
          // Try engineers table
          const engineer = await ctx.db
            .query("engineers")
            .filter((q) => q.eq(q.field("userId"), task.assignedTo))
            .first();

          if (engineer?.name) {
            engineerName = engineer.name;
          } else {
            // Try to find by email (if assignedTo is an email)
            const userByEmail = await ctx.db
              .query("users")
              .withIndex("by_email", (q) => q.eq("email", task.assignedTo))
              .first();

            if (userByEmail?.name) {
              engineerName = userByEmail.name;
            } else if (task.assignedTo && task.assignedTo.includes("@")) {
              // If it's an email, show the email
              engineerName = task.assignedTo;
            }
          }
        }

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

        // Get engineer info - check users table first, then engineers table
        let engineerName = "Unknown";

        // First, try to find in users table by userId
        const user = await ctx.db
          .query("users")
          .withIndex("by_user", (q) => q.eq("userId", task.assignedTo))
          .first();

        if (user?.name) {
          engineerName = user.name;
        } else {
          // Try engineers table
          const engineer = await ctx.db
            .query("engineers")
            .filter((q) => q.eq(q.field("userId"), task.assignedTo))
            .first();

          if (engineer?.name) {
            engineerName = engineer.name;
          } else {
            // Try to find by email (if assignedTo is an email)
            const userByEmail = await ctx.db
              .query("users")
              .withIndex("by_email", (q) => q.eq("email", task.assignedTo))
              .first();

            if (userByEmail?.name) {
              engineerName = userByEmail.name;
            } else if (task.assignedTo && task.assignedTo.includes("@")) {
              // If it's an email, show the email
              engineerName = task.assignedTo;
            }
          }
        }

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
