// Mock data for development without Convex

export type UserRole = "admin" | "acting_manager" | "engineering_lead" | "engineer" | "finance_manager" | "stock_manager";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface MockProject {
  _id: string;
  name: string;
  location: string;
  totalBudget: number;
  status: "ACTIVE" | "COMPLETED";
  leadId?: string;
}

export interface MockUnit {
  _id: string;
  projectId: string;
  name: string;
  status: "UNDER_CONSTRUCTION" | "FINISHED";
}

export interface MockTask {
  _id: string;
  unitId: string;
  projectId: string;
  title: string;
  description?: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdBy: string;
  createdByName: string;
  createdAt: number;
  approvedAt?: number;
  approvedBy?: string;
}

export interface MockPayout {
  _id: string;
  userId: string;
  userName: string;
  amount: number;
  status: "PENDING" | "PAID" | "REJECTED";
  createdAt: number;
  paidAt?: number;
}

export interface MockMaterial {
  _id: string;
  name: string;
  nameAr?: string;
  unit: string;
  category: string;
  currentStock: number;
  minStock: number;
  unitPrice: number;
}

export interface MockMaterialRequest {
  _id: string;
  projectId: string;
  projectName?: string;
  requestedBy: string;
  requestedByName: string;
  items: Array<{
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
  }>;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DELIVERED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  notes?: string;
  createdAt: number;
}

export interface MockTransaction {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  createdAt: number;
  description: string;
}

// Current logged in user (can be changed for testing different roles)
export const currentUser: MockUser = {
  id: "user_001",
  name: "Eng. Ali Hassan",
  email: "ali.hassan@bunyan.iq",
  role: "engineering_lead",
};

// All users in the system
export const mockUsers: MockUser[] = [
  currentUser,
  { id: "user_002", name: "Ahmed Mohammed", email: "ahmed@bunyan.iq", role: "engineer" },
  { id: "user_003", name: "Sara Ali", email: "sara@bunyan.iq", role: "finance_manager" },
  { id: "user_004", name: "Omar Khalid", email: "omar@bunyan.iq", role: "stock_manager" },
  { id: "user_005", name: "Fatima Hassan", email: "fatima@bunyan.iq", role: "admin" },
  { id: "user_006", name: "Yusuf Ibrahim", email: "yusuf@bunyan.iq", role: "engineer" },
  { id: "user_007", name: "Layla Ahmed", email: "layla@bunyan.iq", role: "acting_manager" },
];

// Projects
export const mockProjects: MockProject[] = [
  { _id: "proj_001", name: "Al-Rashid Villas", location: "Baghdad, Al-Mansour", totalBudget: 450000000, status: "ACTIVE", leadId: "user_001" },
  { _id: "proj_002", name: "Green Park Residences", location: "Erbil, Ankawa", totalBudget: 320000000, status: "ACTIVE", leadId: "user_001" },
  { _id: "proj_003", name: "Sunset Towers", location: "Basra, Al-Ashar", totalBudget: 580000000, status: "ACTIVE", leadId: "user_001" },
];

// Units
export const mockUnits: MockUnit[] = [
  { _id: "unit_001", projectId: "proj_001", name: "Villa A1", status: "UNDER_CONSTRUCTION" },
  { _id: "unit_002", projectId: "proj_001", name: "Villa A2", status: "UNDER_CONSTRUCTION" },
  { _id: "unit_003", projectId: "proj_001", name: "Villa B1", status: "FINISHED" },
  { _id: "unit_004", projectId: "proj_002", name: "Building A - Floor 1", status: "UNDER_CONSTRUCTION" },
  { _id: "unit_005", projectId: "proj_002", name: "Building A - Floor 2", status: "UNDER_CONSTRUCTION" },
  { _id: "unit_006", projectId: "proj_003", name: "Tower 1 - Apt 101", status: "UNDER_CONSTRUCTION" },
];

// Tasks
export const mockTasks: MockTask[] = [
  { _id: "task_001", unitId: "unit_001", projectId: "proj_001", title: "Foundation work completed", description: "Poured concrete foundation", amount: 15000000, status: "APPROVED", createdBy: "user_002", createdByName: "Ahmed Mohammed", createdAt: Date.now() - 86400000 * 3, approvedAt: Date.now() - 86400000 * 2 },
  { _id: "task_002", unitId: "unit_001", projectId: "proj_001", title: "Electrical wiring - Phase 1", description: "Main electrical lines installed", amount: 8500000, status: "PENDING", createdBy: "user_002", createdByName: "Ahmed Mohammed", createdAt: Date.now() - 86400000 },
  { _id: "task_003", unitId: "unit_002", projectId: "proj_001", title: "Plumbing installation", description: "Main water and sewage lines", amount: 12000000, status: "PENDING", createdBy: "user_006", createdByName: "Yusuf Ibrahim", createdAt: Date.now() - 86400000 * 2 },
  { _id: "task_004", unitId: "unit_004", projectId: "proj_002", title: "Wall framing completed", description: "All interior walls framed", amount: 22000000, status: "APPROVED", createdBy: "user_002", createdByName: "Ahmed Mohammed", createdAt: Date.now() - 86400000 * 5 },
  { _id: "task_005", unitId: "unit_006", projectId: "proj_003", title: "HVAC installation", description: "Central air conditioning system", amount: 35000000, status: "PENDING", createdBy: "user_006", createdByName: "Yusuf Ibrahim", createdAt: Date.now() - 3600000 },
];

// Payouts
export const mockPayouts: MockPayout[] = [
  { _id: "payout_001", userId: "user_002", userName: "Ahmed Mohammed", amount: 15000000, status: "PAID", createdAt: Date.now() - 86400000 * 7, paidAt: Date.now() - 86400000 * 5 },
  { _id: "payout_002", userId: "user_002", userName: "Ahmed Mohammed", amount: 8500000, status: "PENDING", createdAt: Date.now() - 86400000 },
  { _id: "payout_003", userId: "user_006", userName: "Yusuf Ibrahim", amount: 22000000, status: "PENDING", createdAt: Date.now() - 86400000 * 2 },
];

// Materials
export const mockMaterials: MockMaterial[] = [
  { _id: "mat_001", name: "Portland Cement", nameAr: "اسمنت بورتلاند", unit: "bag", category: "cement", currentStock: 500, minStock: 100, unitPrice: 15000 },
  { _id: "mat_002", name: "Steel Rebar 12mm", nameAr: "حديد تسليح 12مم", unit: "ton", category: "steel", currentStock: 25, minStock: 10, unitPrice: 1200000 },
  { _id: "mat_003", name: "Copper Wire 2.5mm", nameAr: "سلك نحاس 2.5مم", unit: "meter", category: "electrical", currentStock: 2000, minStock: 500, unitPrice: 2500 },
  { _id: "mat_004", name: "PVC Pipes 4 inch", nameAr: "انابيب PVC 4 انش", unit: "piece", category: "plumbing", currentStock: 150, minStock: 50, unitPrice: 25000 },
  { _id: "mat_005", name: "White Paint", nameAr: "دهان ابيض", unit: "bucket", category: "finishing", currentStock: 80, minStock: 30, unitPrice: 45000 },
  { _id: "mat_006", name: "Sand", nameAr: "رمل", unit: "ton", category: "cement", currentStock: 45, minStock: 20, unitPrice: 50000 },
  { _id: "mat_007", name: "Gravel", nameAr: "حصى", unit: "ton", category: "cement", currentStock: 8, minStock: 15, unitPrice: 75000 },
];

// Material Requests
export const mockMaterialRequests: MockMaterialRequest[] = [
  {
    _id: "req_001",
    projectId: "proj_001",
    projectName: "Al-Rashid Villas",
    requestedBy: "user_002",
    requestedByName: "Ahmed Mohammed",
    items: [
      { materialId: "mat_001", materialName: "Portland Cement", quantity: 50, unit: "bag" },
      { materialId: "mat_006", materialName: "Sand", quantity: 5, unit: "ton" },
    ],
    status: "PENDING",
    priority: "HIGH",
    notes: "Needed for foundation work on Villa A2",
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    _id: "req_002",
    projectId: "proj_002",
    projectName: "Green Park Residences",
    requestedBy: "user_006",
    requestedByName: "Yusuf Ibrahim",
    items: [
      { materialId: "mat_003", materialName: "Copper Wire 2.5mm", quantity: 500, unit: "meter" },
    ],
    status: "APPROVED",
    priority: "NORMAL",
    createdAt: Date.now() - 86400000,
  },
];

// Transactions
export const mockTransactions: MockTransaction[] = [
  { _id: "txn_001", userId: "user_002", type: "TASK_APPROVED", amount: 15000000, createdAt: Date.now() - 86400000 * 2, description: "Task approved: Foundation work completed" },
  { _id: "txn_002", userId: "user_002", type: "PAYOUT_PAID", amount: 15000000, createdAt: Date.now() - 86400000 * 5, description: "Payout processed" },
  { _id: "txn_003", userId: "user_002", type: "TASK_APPROVED", amount: 22000000, createdAt: Date.now() - 86400000 * 5, description: "Task approved: Wall framing completed" },
];

// Stats for dashboards
export const mockStats = {
  totalInvestment: 1350000000,
  totalSpent: 285000000,
  pendingPayouts: 30500000,
  activeProjects: 3,
  completedTasks: 12,
  pendingTasks: 5,
  engineersCount: 4,
  lowStockItems: 2,
};

// Helper to format currency
export function formatCurrency(amount: number, locale: "en" | "ar" = "en"): string {
  if (locale === "ar") {
    return `${(amount / 1000000).toFixed(1)} مليون د.ع`;
  }
  return `${(amount / 1000000).toFixed(1)}M IQD`;
}

// Helper to format date
export function formatDate(timestamp: number, locale: "en" | "ar" = "en"): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale === "ar" ? "ar-IQ" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Helper to get relative time
export function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}
