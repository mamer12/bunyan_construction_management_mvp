import { v } from "convex/values";

// ============================================
// TASK STATUS
// ============================================
export const taskStatus = v.union(
    v.literal("PENDING"),
    v.literal("IN_PROGRESS"),
    v.literal("SUBMITTED"),
    v.literal("APPROVED"),
    v.literal("REJECTED")
);

// ============================================
// PROJECT STATUS
// ============================================
export const projectStatus = v.union(
    v.literal("ACTIVE"),
    v.literal("COMPLETED")
);

// ============================================
// UNIT STATUSES
// ============================================
export const constructionStatus = v.union(
    v.literal("UNDER_CONSTRUCTION"),
    v.literal("FINISHED")
);

export const salesStatus = v.union(
    v.literal("available"),
    v.literal("reserved"),
    v.literal("sold")
);

// ============================================
// CRM STATUSES
// ============================================
export const leadStatus = v.union(
    v.literal("new"),
    v.literal("contacted"),
    v.literal("qualified"),
    v.literal("lost")
);

export const leadSource = v.union(
    v.literal("walk-in"),
    v.literal("facebook"),
    v.literal("broker_referral"),
    v.literal("website"),
    v.literal("referral")
);

export const dealStatus = v.union(
    v.literal("draft"),
    v.literal("reserved"),
    v.literal("contract_signed"),
    v.literal("completed"),
    v.literal("cancelled")
);

export const paymentPlan = v.union(
    v.literal("cash"),
    v.literal("monthly"),
    v.literal("construction_linked")
);

// ============================================
// INSTALLMENT
// ============================================
export const installmentStatus = v.union(
    v.literal("pending"),
    v.literal("paid"),
    v.literal("overdue"),
    v.literal("cancelled")
);

export const paymentMethod = v.union(
    v.literal("cash"),
    v.literal("bank_transfer"),
    v.literal("check")
);

// ============================================
// WALLET / PAYOUT
// ============================================
export const payoutStatus = v.union(
    v.literal("PENDING"),
    v.literal("PAID"),
    v.literal("REJECTED")
);

export const transactionType = v.union(
    v.literal("TASK_APPROVED"),
    v.literal("PAYOUT_REQUESTED"),
    v.literal("PAYOUT_COMPLETED"),
    v.literal("PAYOUT_REJECTED"),
    v.literal("PAYOUT_PAID")
);

// ============================================
// MATERIAL REQUEST STATUS
// ============================================
export const materialRequestStatus = v.union(
    v.literal("PENDING"),
    v.literal("APPROVED"),
    v.literal("REJECTED"),
    v.literal("FULFILLED")
);

// ============================================
// USER ROLES
// ============================================
export const userRole = v.union(
    v.literal("admin"),
    v.literal("acting_manager"),
    v.literal("lead"),
    v.literal("engineer"),
    v.literal("finance"),
    v.literal("stock"),
    v.literal("sales_agent"),
    v.literal("broker"),
    v.literal("guest")
);

export const userStatus = v.union(
    v.literal("active"),
    v.literal("inactive")
);

// ============================================
// ACTIVITY / AUDIT
// ============================================
export const activityType = v.union(
    v.literal("call"),
    v.literal("meeting"),
    v.literal("site_visit"),
    v.literal("email"),
    v.literal("note"),
    v.literal("status_change")
);

export const auditAction = v.union(
    v.literal("create"),
    v.literal("update"),
    v.literal("delete"),
    v.literal("status_change"),
    v.literal("payment_recorded"),
    v.literal("generate_public_link")
);

export const notificationType = v.union(
    v.literal("task_assigned"),
    v.literal("payment_due"),
    v.literal("deal_update"),
    v.literal("system")
);

export const documentType = v.union(
    v.literal("invoice"),
    v.literal("contract"),
    v.literal("receipt")
);

export const milestoneType = v.union(
    v.literal("foundation"),
    v.literal("structure"),
    v.literal("roof"),
    v.literal("finish")
);
