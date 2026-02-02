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

  // 2. UNITS (The Villa/Apartment) - Enhanced for Sales
  units: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    status: v.string(), // Construction status: "UNDER_CONSTRUCTION", "FINISHED"
    contractorId: v.optional(v.string()), // Legacy
    // === NEW SALES FIELDS ===
    salesStatus: v.optional(v.string()), // "available", "reserved", "sold" 
    listPrice: v.optional(v.number()), // Original listing price
    area: v.optional(v.number()), // Area in m²
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    floor: v.optional(v.number()),
    features: v.optional(v.array(v.string())), // ["balcony", "parking", "garden"]
    reservedAt: v.optional(v.number()), // Timestamp when reserved
    reservedBy: v.optional(v.string()), // Broker who reserved
    reservationExpiresAt: v.optional(v.number()), // Auto-release time
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
    // === NEW MILESTONE FLAG ===
    isMilestone: v.optional(v.boolean()), // true = triggers installment due dates
    milestoneType: v.optional(v.string()), // "foundation", "structure", "roof", "finish"
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
    status: v.string(),
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
    type: v.string(),
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
    // === NEW BROKER FIELDS ===
    phone: v.optional(v.string()),
    company: v.optional(v.string()), // For brokers
    commissionRate: v.optional(v.number()), // Broker commission %
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
    status: v.string(),
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

  // ============================================
  // SMART CRM TABLES
  // ============================================

  // 12. LEADS (Potential Clients)
  leads: defineTable({
    name: v.string(),
    phone: v.string(), // Unique identifier for client
    email: v.optional(v.string()),
    status: v.string(), // "new", "contacted", "qualified", "lost"
    source: v.string(), // "walk-in", "facebook", "broker_referral", "website", "referral"
    assignedTo: v.optional(v.id("users")), // Sales agent assigned
    referredBy: v.optional(v.id("users")), // Broker who referred
    notes: v.optional(v.string()),
    budget: v.optional(v.number()), // Client's stated budget
    preferredArea: v.optional(v.string()), // Area preference in m²
    preferredBedrooms: v.optional(v.number()),
    interestedInUnits: v.optional(v.array(v.id("units"))), // Units they've viewed
    createdAt: v.number(),
    lastContactedAt: v.optional(v.number()),
    lostReason: v.optional(v.string()), // If status = "lost"
  }).index("by_phone", ["phone"])
    .index("by_status", ["status"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_source", ["source"]),

  // 13. DEALS (Sale Agreements)
  deals: defineTable({
    unitId: v.id("units"), // The unit being sold
    leadId: v.id("leads"), // The client (buyer)
    brokerId: v.optional(v.id("users")), // External agent (if any)
    salesAgentId: v.optional(v.id("users")), // Internal sales agent
    finalPrice: v.number(), // Actual sold price (may differ from list)
    discount: v.optional(v.number()), // Discount amount
    status: v.string(), // "draft", "reserved", "contract_signed", "completed", "cancelled"
    reservationExpiresAt: v.optional(v.number()), // For 24h hold
    paymentPlan: v.optional(v.string()), // "cash", "monthly", "construction_linked"
    downPayment: v.optional(v.number()), // Initial payment
    downPaymentPaidAt: v.optional(v.number()),
    contractSignedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.string(), // userId who created the deal
    // === NEW: MAGIC LINK ===
    publicAccessToken: v.optional(v.string()), // Unique token for public viewer
    publicAccessEnabled: v.optional(v.boolean()), // Allow public access
  }).index("by_unit", ["unitId"])
    .index("by_lead", ["leadId"])
    .index("by_status", ["status"])
    .index("by_broker", ["brokerId"])
    .index("by_public_token", ["publicAccessToken"]),

  // 14. INSTALLMENTS (The "Aqsat" Engine)
  installments: defineTable({
    dealId: v.id("deals"),
    installmentNumber: v.number(), // 1, 2, 3, ...
    amount: v.number(),
    dueDate: v.number(), // Timestamp
    originalDueDate: v.optional(v.number()), // Before milestone adjustment
    linkedConstructionTaskId: v.optional(v.id("tasks")), // CRITICAL: Dynamic due date
    milestoneType: v.optional(v.string()), // "foundation", "structure", "roof", "finish"
    status: v.string(), // "pending", "paid", "overdue", "cancelled"
    paidAt: v.optional(v.number()),
    paidAmount: v.optional(v.number()), // Actual amount paid (may differ)
    paymentMethod: v.optional(v.string()), // "cash", "bank_transfer", "check"
    paymentProofUrl: v.optional(v.string()),
    paymentProofStorageId: v.optional(v.id("_storage")),
    receiptNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    recordedBy: v.optional(v.string()), // userId who recorded payment
    createdAt: v.number(),
  }).index("by_deal", ["dealId"])
    .index("by_status", ["status"])
    .index("by_due_date", ["dueDate"])
    .index("by_linked_task", ["linkedConstructionTaskId"]),

  // 15. SALES ACTIVITIES (Activity Log for CRM)
  sales_activities: defineTable({
    leadId: v.optional(v.id("leads")),
    dealId: v.optional(v.id("deals")),
    type: v.string(), // "call", "meeting", "site_visit", "email", "note", "status_change"
    description: v.string(),
    outcome: v.optional(v.string()), // "interested", "callback_scheduled", "not_interested"
    scheduledAt: v.optional(v.number()), // For follow-ups
    completedAt: v.optional(v.number()),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("by_lead", ["leadId"])
    .index("by_deal", ["dealId"])
    .index("by_type", ["type"]),

  // ============================================
  // AUDIT & NOTIFICATION TABLES
  // ============================================

  // 16. AUDIT LOGS (Who changed what)
  audit_logs: defineTable({
    userId: v.string(),
    userEmail: v.optional(v.string()),
    action: v.string(), // "create", "update", "delete", "status_change", "payment_recorded"
    entityType: v.string(), // "deal", "lead", "installment", "task", "unit"
    entityId: v.string(),
    changes: v.optional(v.string()), // JSON stringified old vs new values
    metadata: v.optional(v.string()), // Additional context
    ipAddress: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_entity", ["entityType", "entityId"])
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_created_at", ["createdAt"]),

  // 17. NOTIFICATIONS (In-app alerts)
  notifications: defineTable({
    userId: v.string(), // Recipient
    type: v.string(), // "task_assigned", "payment_due", "deal_update", "system"
    title: v.string(),
    message: v.string(),
    entityType: v.optional(v.string()), // "deal", "task", "installment"
    entityId: v.optional(v.string()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_type", ["type"]),

  // 18. INVOICES & DOCUMENTS (Generated PDFs)
  documents: defineTable({
    type: v.string(), // "invoice", "contract", "receipt"
    referenceType: v.string(), // "task", "deal", "installment"
    referenceId: v.string(),
    documentNumber: v.string(), // e.g., "INV-2026-001"
    storageId: v.optional(v.id("_storage")), // PDF file
    metadata: v.optional(v.string()), // JSON with document details
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
    bankDetails: v.optional(v.string()), // JSON with bank info
    updatedAt: v.number(),
    updatedBy: v.string(),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

