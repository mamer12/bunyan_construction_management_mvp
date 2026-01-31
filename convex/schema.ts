import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Role types: admin, acting_manager, engineering_lead, engineer, finance_manager, stock_manager
const roleValidator = v.union(
  v.literal("admin"),
  v.literal("acting_manager"),
  v.literal("engineering_lead"),
  v.literal("engineer"),
  v.literal("finance_manager"),
  v.literal("stock_manager")
);

const applicationTables = {
  // USER ROLES - Central role management
  userRoles: defineTable({
    userId: v.string(),
    role: roleValidator,
    assignedBy: v.optional(v.string()),
    assignedAt: v.number(),
    isActive: v.boolean(),
  }).index("by_user", ["userId"])
    .index("by_role", ["role"]),

  // 1. PROJECTS (The Job Site)
  projects: defineTable({
    name: v.string(),
    location: v.string(),
    totalBudget: v.number(),
    status: v.string(), // "ACTIVE", "COMPLETED"
    leadId: v.optional(v.string()),
    developerId: v.optional(v.string()), // Legacy
  }),

  // 2. UNITS (The Villa/Apartment)
  units: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    status: v.string(), // "UNDER_CONSTRUCTION", "FINISHED"
    contractorId: v.optional(v.string()), // Legacy
  }).index("by_project", ["projectId"]),

  // 3. ENGINEERS (Team members)
  engineers: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    leadId: v.string(),
  }).index("by_lead", ["leadId"])
    .index("by_user", ["userId"]),

  // 4. TASKS (The Work)
  tasks: defineTable({
    unitId: v.id("units"),
    title: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    status: v.string(), // "PENDING", "IN_PROGRESS", "SUBMITTED", "APPROVED", "REJECTED"
    assignedTo: v.string(),
    assignedBy: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("_storage"))),
    proofPhotoId: v.optional(v.id("_storage")),
    proofGps: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    submittedAt: v.optional(v.number()),
    comments: v.optional(v.array(v.object({
      text: v.string(),
      authorId: v.string(),
      authorName: v.string(),
      createdAt: v.number(),
    }))),
    rejectionReason: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
  }).index("by_assignee", ["assignedTo"])
    .index("by_unit", ["unitId"])
    .index("by_status", ["status"]),

  // 5. WALLETS (Engineer earnings)
  wallets: defineTable({
    userId: v.string(),
    availableBalance: v.number(),  // Can be withdrawn
    pendingBalance: v.number(),    // Awaiting task approval
    totalEarned: v.number(),       // Lifetime earnings
    totalWithdrawn: v.number(),    // Lifetime withdrawals
  }).index("by_user", ["userId"]),

  // 6. PAYOUTS (Withdrawal requests)
  payouts: defineTable({
    userId: v.string(),
    amount: v.number(),
    status: v.string(), // "PENDING", "APPROVED", "PAID", "REJECTED"
    paymentMethod: v.optional(v.string()), // "ZAINCASH", "CASH", "BANK"
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
    processedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // 7. TRANSACTIONS (Audit trail)
  transactions: defineTable({
    userId: v.string(),
    type: v.string(), // "TASK_APPROVED", "PAYOUT_REQUESTED", "PAYOUT_PAID", "PAYOUT_REJECTED"
    amount: v.number(),
    taskId: v.optional(v.id("tasks")),
    payoutId: v.optional(v.id("payouts")),
    createdAt: v.number(),
    description: v.string(),
  }).index("by_user", ["userId"]),

  // 8. MATERIALS (Inventory items)
  materials: defineTable({
    name: v.string(),
    nameAr: v.optional(v.string()),
    unit: v.string(), // "kg", "piece", "meter", "bag", "ton"
    category: v.string(), // "cement", "steel", "electrical", "plumbing", "finishing"
    currentStock: v.number(),
    minStock: v.number(), // Alert threshold
    unitPrice: v.number(),
    lastUpdated: v.number(),
    updatedBy: v.optional(v.string()),
  }).index("by_category", ["category"]),

  // 9. MATERIAL REQUESTS (Stock requests from engineers)
  materialRequests: defineTable({
    projectId: v.id("projects"),
    unitId: v.optional(v.id("units")),
    requestedBy: v.string(), // userId
    requestedByName: v.string(),
    items: v.array(v.object({
      materialId: v.id("materials"),
      materialName: v.string(),
      quantity: v.number(),
      unit: v.string(),
    })),
    status: v.string(), // "PENDING", "APPROVED", "REJECTED", "DELIVERED"
    priority: v.string(), // "LOW", "NORMAL", "HIGH", "URGENT"
    notes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.string()),
    deliveredAt: v.optional(v.number()),
    deliveredBy: v.optional(v.string()),
  }).index("by_project", ["projectId"])
    .index("by_requester", ["requestedBy"])
    .index("by_status", ["status"]),

  // 10. STOCK MOVEMENTS (Inventory audit trail)
  stockMovements: defineTable({
    materialId: v.id("materials"),
    type: v.string(), // "IN", "OUT", "ADJUSTMENT"
    quantity: v.number(),
    previousStock: v.number(),
    newStock: v.number(),
    relatedRequestId: v.optional(v.id("materialRequests")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.string(),
  }).index("by_material", ["materialId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
