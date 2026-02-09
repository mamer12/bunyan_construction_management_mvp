import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import {
  taskStatus,
  projectStatus,
  constructionStatus,
  salesStatus,
  leadStatus,
  leadSource,
  dealStatus,
  paymentPlan,
  installmentStatus,
  paymentMethod,
  payoutStatus,
  transactionType,
  materialRequestStatus,
  activityType,
  auditAction,
  notificationType,
  documentType,
  milestoneType,
} from "./lib/validators";

const applicationTables = {
  // 1. PROJECTS (The Job Site)
  projects: defineTable({
    name: v.string(),
    location: v.string(),
    totalBudget: v.number(),
    status: projectStatus,
    leadId: v.optional(v.string()),
    developerId: v.optional(v.string()), // Legacy
  }),

  // 2. UNITS (The Villa/Apartment) - Enhanced for Sales
  units: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    status: constructionStatus,
    contractorId: v.optional(v.string()), // Legacy
    // Sales fields
    salesStatus: v.optional(salesStatus),
    listPrice: v.optional(v.number()),
    area: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    floor: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    reservedAt: v.optional(v.number()),
    reservedBy: v.optional(v.string()),
    reservationExpiresAt: v.optional(v.number()),
  }).index("by_project", ["projectId"])
    .index("by_sales_status", ["salesStatus"]),

  // 3. ENGINEERS (Team members)
  engineers: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    leadId: v.string(),
  }).index("by_lead", ["leadId"])
    .index("by_user", ["userId"]),

  // 4. TASKS (The Work) - Enhanced with milestone flag
  tasks: defineTable({
    unitId: v.id("units"),
    title: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    status: taskStatus,
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
    isMilestone: v.optional(v.boolean()),
    milestoneType: v.optional(milestoneType),
  }).index("by_assignee", ["assignedTo"])
    .index("by_unit", ["unitId"])
    .index("by_status", ["status"]),

  // 5. WALLETS (Engineer earnings)
  wallets: defineTable({
    userId: v.string(),
    availableBalance: v.number(),
    pendingBalance: v.number(),
    totalEarned: v.number(),
    totalWithdrawn: v.number(),
  }).index("by_user", ["userId"]),

  // 6. PAYOUTS (Withdrawal requests)
  payouts: defineTable({
    userId: v.string(),
    amount: v.number(),
    status: payoutStatus,
    paymentMethod: v.optional(v.string()),
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
    processedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // 7. TRANSACTIONS (Audit trail)
  transactions: defineTable({
    userId: v.string(),
    type: transactionType,
    amount: v.number(),
    taskId: v.optional(v.id("tasks")),
    payoutId: v.optional(v.id("payouts")),
    createdAt: v.number(),
    description: v.string(),
  }).index("by_user", ["userId"]),

  // 8. USERS (RBAC Profile)
  users: defineTable({
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    joinedAt: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    commissionRate: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // 9. CUSTOM ROLES
  custom_roles: defineTable({
    name: v.string(),
    displayName: v.string(),
    displayNameAr: v.optional(v.string()),
    permissions: v.array(v.string()),
    color: v.optional(v.string()),
    isSystem: v.optional(v.boolean()),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
  }).index("by_name", ["name"]),

  // 10. MATERIALS (Inventory)
  materials: defineTable({
    name: v.string(),
    unit: v.string(),
    currentStock: v.number(),
    minimumStock: v.optional(v.number()),
    pricePerUnit: v.optional(v.number()),
    lastUpdated: v.number(),
  }).index("by_name", ["name"]),

  // 11. MATERIAL REQUESTS
  material_requests: defineTable({
    projectId: v.id("projects"),
    unitId: v.optional(v.id("units")),
    requestedBy: v.string(),
    status: materialRequestStatus,
    items: v.array(v.object({
      materialId: v.id("materials"),
      quantity: v.number(),
      fulfilledQuantity: v.optional(v.number()),
    })),
    handledBy: v.optional(v.string()),
    handledAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_requester", ["requestedBy"]),

  // 12. LEADS (Potential Clients)
  leads: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    status: leadStatus,
    source: leadSource,
    assignedTo: v.optional(v.id("users")),
    referredBy: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    budget: v.optional(v.number()),
    preferredArea: v.optional(v.string()),
    preferredBedrooms: v.optional(v.number()),
    interestedInUnits: v.optional(v.array(v.id("units"))),
    createdAt: v.number(),
    lastContactedAt: v.optional(v.number()),
    lostReason: v.optional(v.string()),
  }).index("by_phone", ["phone"])
    .index("by_status", ["status"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_source", ["source"]),

  // 13. DEALS (Sale Agreements)
  deals: defineTable({
    unitId: v.id("units"),
    leadId: v.id("leads"),
    brokerId: v.optional(v.id("users")),
    salesAgentId: v.optional(v.id("users")),
    finalPrice: v.number(),
    discount: v.optional(v.number()),
    status: dealStatus,
    reservationExpiresAt: v.optional(v.number()),
    paymentPlan: v.optional(paymentPlan),
    downPayment: v.optional(v.number()),
    downPaymentPaidAt: v.optional(v.number()),
    contractSignedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.string(),
    publicAccessToken: v.optional(v.string()),
    publicAccessEnabled: v.optional(v.boolean()),
  }).index("by_unit", ["unitId"])
    .index("by_lead", ["leadId"])
    .index("by_status", ["status"])
    .index("by_broker", ["brokerId"])
    .index("by_public_token", ["publicAccessToken"]),

  // 14. INSTALLMENTS (The "Aqsat" Engine)
  installments: defineTable({
    dealId: v.id("deals"),
    installmentNumber: v.number(),
    amount: v.number(),
    dueDate: v.number(),
    originalDueDate: v.optional(v.number()),
    linkedConstructionTaskId: v.optional(v.id("tasks")),
    milestoneType: v.optional(milestoneType),
    status: installmentStatus,
    paidAt: v.optional(v.number()),
    paidAmount: v.optional(v.number()),
    paymentMethod: v.optional(paymentMethod),
    paymentProofUrl: v.optional(v.string()),
    paymentProofStorageId: v.optional(v.id("_storage")),
    receiptNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    recordedBy: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_deal", ["dealId"])
    .index("by_status", ["status"])
    .index("by_due_date", ["dueDate"])
    .index("by_linked_task", ["linkedConstructionTaskId"]),

  // 15. SALES ACTIVITIES (Activity Log for CRM)
  sales_activities: defineTable({
    leadId: v.optional(v.id("leads")),
    dealId: v.optional(v.id("deals")),
    type: activityType,
    description: v.string(),
    outcome: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("by_lead", ["leadId"])
    .index("by_deal", ["dealId"])
    .index("by_type", ["type"]),

  // 16. AUDIT LOGS (Who changed what)
  audit_logs: defineTable({
    userId: v.string(),
    userEmail: v.optional(v.string()),
    action: auditAction,
    entityType: v.string(),
    entityId: v.string(),
    changes: v.optional(v.string()),
    metadata: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_created_at", ["createdAt"]),

  // 17. NOTIFICATIONS (In-app alerts)
  notifications: defineTable({
    userId: v.string(),
    type: notificationType,
    title: v.string(),
    message: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_type", ["type"]),

  // 18. INVOICES & DOCUMENTS (Generated PDFs)
  documents: defineTable({
    type: documentType,
    referenceType: v.string(),
    referenceId: v.string(),
    documentNumber: v.string(),
    storageId: v.optional(v.id("_storage")),
    metadata: v.optional(v.string()),
    generatedBy: v.string(),
    createdAt: v.number(),
  }).index("by_reference", ["referenceType", "referenceId"])
    .index("by_type", ["type"])
    .index("by_document_number", ["documentNumber"]),

  // 19. COMPANY SETTINGS (Branding for PDFs)
  company_settings: defineTable({
    companyName: v.string(),
    companyNameAr: v.optional(v.string()),
    address: v.optional(v.string()),
    addressAr: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    taxNumber: v.optional(v.string()),
    registrationNumber: v.optional(v.string()),
    bankDetails: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.string(),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
