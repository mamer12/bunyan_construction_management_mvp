import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
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

  // 8. USERS (RBAC Profile)
  users: defineTable({
    userId: v.optional(v.string()), // Links to Auth ID, optional for anonymous users
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.string()), // LEGACY: Single role for backward compatibility
    roles: v.optional(v.array(v.string())), // NEW: Array of roles for multi-role support
    status: v.optional(v.string()), // "active", "inactive"
    joinedAt: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // 9. CUSTOM ROLES (For creating additional roles)
  custom_roles: defineTable({
    name: v.string(), // Role identifier (e.g., "site_supervisor")
    displayName: v.string(), // Human-readable name
    displayNameAr: v.optional(v.string()), // Arabic display name
    permissions: v.array(v.string()), // Array of module access permissions
    color: v.optional(v.string()), // Color for UI display
    isSystem: v.optional(v.boolean()), // true for built-in roles that can't be deleted
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
  }).index("by_name", ["name"]),

  // 9. MATERIALS (Inventory)
  materials: defineTable({
    name: v.string(),
    unit: v.string(), // "kg", "pcs", "bags", "m", "m2", "m3"
    currentStock: v.number(),
    minimumStock: v.optional(v.number()),
    pricePerUnit: v.optional(v.number()),
    lastUpdated: v.number(),
  }).index("by_name", ["name"]),

  // 10. MATERIAL REQUESTS
  material_requests: defineTable({
    projectId: v.id("projects"),
    unitId: v.optional(v.id("units")),
    requestedBy: v.string(), // userId of requester
    status: v.string(), // "PENDING", "APPROVED", "PARTIALLY_FULFILLED", "FULFILLED", "REJECTED"
    items: v.array(v.object({
      materialId: v.id("materials"),
      quantity: v.number(),
      fulfilledQuantity: v.optional(v.number()),
    })),
    handledBy: v.optional(v.string()), // userId of stock manager
    handledAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_requester", ["requestedBy"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
