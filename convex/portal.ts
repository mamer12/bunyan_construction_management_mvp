import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================
// PUBLIC VIEWER (Magic Link) - No Auth Required
// ============================================

// Generate a public access token for a deal
export const generatePublicAccessToken = mutation({
    args: {
        dealId: v.id("deals"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const deal = await ctx.db.get(args.dealId);
        if (!deal) throw new Error("Deal not found");

        // Generate unique token
        const token = `${deal.unitId.split("|")[1]?.slice(0, 8) || "unit"}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

        await ctx.db.patch(args.dealId, {
            publicAccessToken: token,
            publicAccessEnabled: true,
        });

        // Log this action
        await ctx.db.insert("audit_logs", {
            userId,
            action: "generate_public_link",
            entityType: "deal",
            entityId: args.dealId,
            metadata: JSON.stringify({ token }),
            createdAt: Date.now(),
        });

        return token;
    },
});

// Disable public access
export const disablePublicAccess = mutation({
    args: {
        dealId: v.id("deals"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.patch(args.dealId, {
            publicAccessEnabled: false,
        });

        return { success: true };
    },
});

// Public query - NO AUTH REQUIRED
export const getPublicDealView = query({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        // Find deal by public token
        const deal = await ctx.db
            .query("deals")
            .withIndex("by_public_token", (q) => q.eq("publicAccessToken", args.token))
            .first();

        if (!deal || !deal.publicAccessEnabled) {
            return null;
        }

        // Get unit info
        const unit = await ctx.db.get(deal.unitId);
        if (!unit) return null;

        // Get project info
        const project = await ctx.db.get(unit.projectId);

        // Get lead info (buyer name only)
        const lead = await ctx.db.get(deal.leadId);

        // Get construction tasks for this unit (milestones only for progress)
        const allTasks = await ctx.db
            .query("tasks")
            .withIndex("by_unit", (q) => q.eq("unitId", deal.unitId))
            .collect();

        // Get milestone tasks with progress
        const milestones = allTasks
            .filter((t) => t.isMilestone)
            .map((task) => ({
                type: task.milestoneType,
                title: task.title,
                status: task.status,
                isComplete: task.status === "APPROVED",
                completedAt: task.reviewedAt,
                // Include proof photo URL if approved
                proofPhotoId: task.status === "APPROVED" ? task.proofPhotoId : undefined,
            }));

        // Get installments for this deal
        const installments = await ctx.db
            .query("installments")
            .withIndex("by_deal", (q) => q.eq("dealId", deal._id))
            .collect();

        // Calculate progress
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter((t) => t.status === "APPROVED").length;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Get next pending installment
        const pendingInstallments = installments
            .filter((i) => i.status === "pending")
            .sort((a, b) => a.dueDate - b.dueDate);
        const nextInstallment = pendingInstallments[0] || null;

        // Payment summary
        const totalPaid = installments
            .filter((i) => i.status === "paid")
            .reduce((sum, i) => sum + (i.paidAmount || i.amount), 0);
        const totalDue = deal.finalPrice;
        const remaining = totalDue - totalPaid - (deal.downPayment || 0);

        return {
            // Unit info
            unitName: unit.name,
            projectName: project?.name,
            projectLocation: project?.location,
            area: unit.area,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
            floor: unit.floor,
            features: unit.features,

            // Buyer info (limited)
            buyerName: lead?.name ? lead.name.split(" ")[0] : "Customer", // First name only

            // Deal info
            purchaseDate: deal.createdAt,
            totalPrice: deal.finalPrice,
            downPayment: deal.downPayment,
            paymentPlan: deal.paymentPlan,

            // Construction progress
            progressPercentage,
            milestones,
            totalTasks,
            completedTasks,

            // Payment info
            totalPaid,
            remaining,
            nextInstallment: nextInstallment ? {
                amount: nextInstallment.amount,
                dueDate: nextInstallment.dueDate,
                milestoneType: nextInstallment.milestoneType,
                installmentNumber: nextInstallment.installmentNumber,
            } : null,

            // Installment schedule (without sensitive data)
            installmentSchedule: installments.map((i) => ({
                number: i.installmentNumber,
                amount: i.amount,
                dueDate: i.dueDate,
                status: i.status,
                milestoneType: i.milestoneType,
            })).sort((a, b) => a.number - b.number),
        };
    },
});

// Get storage URL for public proof photos
export const getPublicProofPhotoUrl = query({
    args: {
        token: v.string(),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        // Verify token is valid first
        const deal = await ctx.db
            .query("deals")
            .withIndex("by_public_token", (q) => q.eq("publicAccessToken", args.token))
            .first();

        if (!deal || !deal.publicAccessEnabled) {
            return null;
        }

        // Return the URL
        return await ctx.storage.getUrl(args.storageId);
    },
});

// ============================================
// AUDIT LOGS
// ============================================

export const createAuditLog = mutation({
    args: {
        action: v.string(),
        entityType: v.string(),
        entityId: v.string(),
        changes: v.optional(v.string()),
        metadata: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const user = await ctx.db.get(userId);

        await ctx.db.insert("audit_logs", {
            userId,
            userEmail: user?.email,
            action: args.action,
            entityType: args.entityType,
            entityId: args.entityId,
            changes: args.changes,
            metadata: args.metadata,
            createdAt: Date.now(),
        });
    },
});

export const getAuditLogs = query({
    args: {
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        let logs;
        if (args.entityType && args.entityId) {
            logs = await ctx.db
                .query("audit_logs")
                .withIndex("by_entity", (q) =>
                    q.eq("entityType", args.entityType!).eq("entityId", args.entityId!)
                )
                .order("desc")
                .take(args.limit || 50);
        } else {
            logs = await ctx.db
                .query("audit_logs")
                .order("desc")
                .take(args.limit || 100);
        }

        return logs;
    },
});

// ============================================
// NOTIFICATIONS
// ============================================

export const createNotification = mutation({
    args: {
        userId: v.string(),
        type: v.string(),
        title: v.string(),
        message: v.string(),
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            userId: args.userId,
            type: args.type,
            title: args.title,
            message: args.message,
            entityType: args.entityType,
            entityId: args.entityId,
            isRead: false,
            createdAt: Date.now(),
        });
    },
});

export const getMyNotifications = query({
    args: {
        unreadOnly: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        if (args.unreadOnly) {
            return await ctx.db
                .query("notifications")
                .withIndex("by_user_unread", (q) =>
                    q.eq("userId", userId).eq("isRead", false)
                )
                .order("desc")
                .take(50);
        }

        return await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(50);
    },
});

export const markNotificationRead = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.notificationId, {
            isRead: true,
            readAt: Date.now(),
        });
    },
});

export const markAllNotificationsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const unreadNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) =>
                q.eq("userId", userId).eq("isRead", false)
            )
            .collect();

        await Promise.all(
            unreadNotifications.map((n) =>
                ctx.db.patch(n._id, { isRead: true, readAt: Date.now() })
            )
        );

        return { marked: unreadNotifications.length };
    },
});

// ============================================
// COMPANY SETTINGS
// ============================================

export const getCompanySettings = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("company_settings").first();
        return settings || {
            companyName: "Bunyan Development",
            companyNameAr: "بنيان للتطوير",
            address: "Baghdad, Iraq",
            phone: "+964 XXX XXX XXXX",
            email: "info@bunyan.iq",
        };
    },
});

export const updateCompanySettings = mutation({
    args: {
        companyName: v.string(),
        companyNameAr: v.optional(v.string()),
        address: v.optional(v.string()),
        addressAr: v.optional(v.string()),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        website: v.optional(v.string()),
        taxNumber: v.optional(v.string()),
        registrationNumber: v.optional(v.string()),
        bankDetails: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const existing = await ctx.db.query("company_settings").first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args,
                updatedAt: Date.now(),
                updatedBy: userId,
            });
        } else {
            await ctx.db.insert("company_settings", {
                ...args,
                updatedAt: Date.now(),
                updatedBy: userId,
            });
        }

        return { success: true };
    },
});

// ============================================
// DOCUMENT GENERATION HELPERS
// ============================================

// Get data for Invoice PDF
export const getInvoiceData = query({
    args: {
        taskId: v.id("tasks"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");

        const unit = await ctx.db.get(task.unitId);
        const project = unit ? await ctx.db.get(unit.projectId) : null;

        // Get engineer info
        const engineer = await ctx.db
            .query("engineers")
            .withIndex("by_user", (q) => q.eq("userId", task.assignedTo))
            .first();

        const settings = await ctx.db.query("company_settings").first();

        // Generate invoice number
        const existingDocs = await ctx.db
            .query("documents")
            .withIndex("by_type", (q) => q.eq("type", "invoice"))
            .collect();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(existingDocs.length + 1).padStart(4, "0")}`;

        return {
            invoiceNumber,
            date: Date.now(),
            // Company
            company: settings || {
                companyName: "Bunyan Development",
                companyNameAr: "بنيان للتطوير",
                address: "Baghdad, Iraq",
            },
            // Contractor
            contractor: {
                name: engineer?.name || "Unknown",
                email: engineer?.email || "",
            },
            // Task details
            task: {
                title: task.title,
                description: task.description,
                amount: task.amount,
                approvedAt: task.reviewedAt,
            },
            // Project
            project: {
                name: project?.name,
                location: project?.location,
            },
            unit: {
                name: unit?.name,
            },
        };
    },
});

// Get data for Sales Contract PDF
export const getContractData = query({
    args: {
        dealId: v.id("deals"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const deal = await ctx.db.get(args.dealId);
        if (!deal) throw new Error("Deal not found");

        const unit = await ctx.db.get(deal.unitId);
        const project = unit ? await ctx.db.get(unit.projectId) : null;
        const lead = await ctx.db.get(deal.leadId);
        const settings = await ctx.db.query("company_settings").first();

        // Get installments
        const installments = await ctx.db
            .query("installments")
            .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
            .collect();

        // Generate contract number
        const existingDocs = await ctx.db
            .query("documents")
            .withIndex("by_type", (q) => q.eq("type", "contract"))
            .collect();
        const contractNumber = `CON-${new Date().getFullYear()}-${String(existingDocs.length + 1).padStart(4, "0")}`;

        return {
            contractNumber,
            date: Date.now(),
            // Company (Seller)
            seller: settings || {
                companyName: "Bunyan Development",
                companyNameAr: "بنيان للتطوير",
                address: "Baghdad, Iraq",
            },
            // Buyer
            buyer: {
                name: lead?.name || "Unknown",
                phone: lead?.phone || "",
                email: lead?.email || "",
            },
            // Property
            property: {
                projectName: project?.name,
                projectLocation: project?.location,
                unitName: unit?.name,
                area: unit?.area,
                bedrooms: unit?.bedrooms,
                bathrooms: unit?.bathrooms,
                floor: unit?.floor,
            },
            // Financial
            financial: {
                totalPrice: deal.finalPrice,
                discount: deal.discount,
                downPayment: deal.downPayment,
                paymentPlan: deal.paymentPlan,
                installmentsCount: installments.length,
            },
            // Installment schedule
            installments: installments
                .map((i) => ({
                    number: i.installmentNumber,
                    amount: i.amount,
                    dueDate: i.dueDate,
                    milestoneType: i.milestoneType,
                }))
                .sort((a, b) => a.number - b.number),
        };
    },
});

// Get data for Payment Receipt PDF
export const getReceiptData = query({
    args: {
        installmentId: v.id("installments"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const installment = await ctx.db.get(args.installmentId);
        if (!installment) throw new Error("Installment not found");

        const deal = await ctx.db.get(installment.dealId);
        if (!deal) throw new Error("Deal not found");

        const unit = await ctx.db.get(deal.unitId);
        const project = unit ? await ctx.db.get(unit.projectId) : null;
        const lead = await ctx.db.get(deal.leadId);
        const settings = await ctx.db.query("company_settings").first();

        // Generate receipt number
        const existingDocs = await ctx.db
            .query("documents")
            .withIndex("by_type", (q) => q.eq("type", "receipt"))
            .collect();
        const receiptNumber = installment.receiptNumber ||
            `REC-${new Date().getFullYear()}-${String(existingDocs.length + 1).padStart(4, "0")}`;

        return {
            receiptNumber,
            date: installment.paidAt || Date.now(),
            // Company
            company: settings || {
                companyName: "Bunyan Development",
                companyNameAr: "بنيان للتطوير",
                address: "Baghdad, Iraq",
            },
            // Payer
            payer: {
                name: lead?.name || "Unknown",
                phone: lead?.phone || "",
            },
            // Payment details
            payment: {
                installmentNumber: installment.installmentNumber,
                amount: installment.paidAmount || installment.amount,
                method: installment.paymentMethod,
                paidAt: installment.paidAt,
            },
            // Reference
            reference: {
                projectName: project?.name,
                unitName: unit?.name,
                dealId: deal._id,
            },
        };
    },
});

// Record document generation
export const recordDocument = mutation({
    args: {
        type: v.string(),
        referenceType: v.string(),
        referenceId: v.string(),
        documentNumber: v.string(),
        metadata: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        await ctx.db.insert("documents", {
            type: args.type,
            referenceType: args.referenceType,
            referenceId: args.referenceId,
            documentNumber: args.documentNumber,
            metadata: args.metadata,
            generatedBy: userId,
            createdAt: Date.now(),
        });

        return { success: true };
    },
});
