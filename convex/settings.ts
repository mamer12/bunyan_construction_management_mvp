import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./lib/auth";
import { documentType } from "./lib/validators";

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
        const userId = await requireAuth(ctx);

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

export const getInvoiceData = query({
    args: {
        taskId: v.id("tasks"),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        const task = await ctx.db.get(args.taskId);
        if (!task) throw new Error("Task not found");

        const unit = await ctx.db.get(task.unitId);
        const project = unit ? await ctx.db.get(unit.projectId) : null;

        const engineer = await ctx.db
            .query("engineers")
            .withIndex("by_user", (q) => q.eq("userId", task.assignedTo))
            .first();

        const settings = await ctx.db.query("company_settings").first();

        const existingDocs = await ctx.db
            .query("documents")
            .withIndex("by_type", (q) => q.eq("type", "invoice"))
            .collect();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(existingDocs.length + 1).padStart(4, "0")}`;

        return {
            invoiceNumber,
            date: Date.now(),
            company: settings || {
                companyName: "Bunyan Development",
                companyNameAr: "بنيان للتطوير",
                address: "Baghdad, Iraq",
            },
            contractor: {
                name: engineer?.name || "Unknown",
                email: engineer?.email || "",
            },
            task: {
                title: task.title,
                description: task.description,
                amount: task.amount,
                approvedAt: task.reviewedAt,
            },
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

export const getContractData = query({
    args: {
        dealId: v.id("deals"),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        const deal = await ctx.db.get(args.dealId);
        if (!deal) throw new Error("Deal not found");

        const unit = await ctx.db.get(deal.unitId);
        const project = unit ? await ctx.db.get(unit.projectId) : null;
        const lead = await ctx.db.get(deal.leadId);
        const settings = await ctx.db.query("company_settings").first();

        const installments = await ctx.db
            .query("installments")
            .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
            .collect();

        const existingDocs = await ctx.db
            .query("documents")
            .withIndex("by_type", (q) => q.eq("type", "contract"))
            .collect();
        const contractNumber = `CON-${new Date().getFullYear()}-${String(existingDocs.length + 1).padStart(4, "0")}`;

        return {
            contractNumber,
            date: Date.now(),
            seller: settings || {
                companyName: "Bunyan Development",
                companyNameAr: "بنيان للتطوير",
                address: "Baghdad, Iraq",
            },
            buyer: {
                name: lead?.name || "Unknown",
                phone: lead?.phone || "",
                email: lead?.email || "",
            },
            property: {
                projectName: project?.name,
                projectLocation: project?.location,
                unitName: unit?.name,
                area: unit?.area,
                bedrooms: unit?.bedrooms,
                bathrooms: unit?.bathrooms,
                floor: unit?.floor,
            },
            financial: {
                totalPrice: deal.finalPrice,
                discount: deal.discount,
                downPayment: deal.downPayment,
                paymentPlan: deal.paymentPlan,
                installmentsCount: installments.length,
            },
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

export const getReceiptData = query({
    args: {
        installmentId: v.id("installments"),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        const installment = await ctx.db.get(args.installmentId);
        if (!installment) throw new Error("Installment not found");

        const deal = await ctx.db.get(installment.dealId);
        if (!deal) throw new Error("Deal not found");

        const unit = await ctx.db.get(deal.unitId);
        const project = unit ? await ctx.db.get(unit.projectId) : null;
        const lead = await ctx.db.get(deal.leadId);
        const settings = await ctx.db.query("company_settings").first();

        const existingDocs = await ctx.db
            .query("documents")
            .withIndex("by_type", (q) => q.eq("type", "receipt"))
            .collect();
        const receiptNumber = installment.receiptNumber ||
            `REC-${new Date().getFullYear()}-${String(existingDocs.length + 1).padStart(4, "0")}`;

        return {
            receiptNumber,
            date: installment.paidAt || Date.now(),
            company: settings || {
                companyName: "Bunyan Development",
                companyNameAr: "بنيان للتطوير",
                address: "Baghdad, Iraq",
            },
            payer: {
                name: lead?.name || "Unknown",
                phone: lead?.phone || "",
            },
            payment: {
                installmentNumber: installment.installmentNumber,
                amount: installment.paidAmount || installment.amount,
                method: installment.paymentMethod,
                paidAt: installment.paidAt,
            },
            reference: {
                projectName: project?.name,
                unitName: unit?.name,
                dealId: deal._id,
            },
        };
    },
});

export const recordDocument = mutation({
    args: {
        type: documentType,
        referenceType: v.string(),
        referenceId: v.string(),
        documentNumber: v.string(),
        metadata: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

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
