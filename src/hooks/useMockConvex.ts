// Mock hooks to replace Convex useQuery and useMutation
import { useMockData } from "../mocks/MockDataContext";
import { useCallback } from "react";

// Mock useQuery replacement - returns data based on the query path
export function useQuery(queryPath: any): any {
  const mockData = useMockData();

  // Map query paths to mock data
  const queryMap: Record<string, any> = {
    // Auth
    "auth:loggedInUser": mockData.user,

    // Roles
    "roles:getMyRoleWithPermissions": mockData.user ? {
      role: mockData.user.role,
      permissions: getPermissionsForRole(mockData.user.role),
    } : null,
    "roles:getAllUsersWithRoles": mockData.users.map(u => ({
      ...u,
      roleData: { role: u.role, isActive: true },
    })),

    // Tasks
    "tasks:getStats": mockData.stats,
    "tasks:getTasksForReview": mockData.tasks.filter(t => t.status === "PENDING"),
    "tasks:getAllTasks": mockData.tasks,
    "tasks:getMyEngineers": mockData.users.filter(u => u.role === "engineer"),
    "tasks:getAllUnits": mockData.units,
    "tasks:getMyTasks": mockData.tasks.filter(t => t.createdBy === mockData.user?.id),
    "tasks:getProjectDetails": (projectId: string) => mockData.projects.find(p => p._id === projectId),

    // Projects
    "projects:list": mockData.projects,
    "projects:getAll": mockData.projects,

    // Payouts
    "payouts:list": mockData.payouts,
    "payouts:getPendingPayouts": mockData.payouts.filter(p => p.status === "PENDING"),
    "payouts:getMyBalance": {
      approved: mockData.tasks.filter(t => t.createdBy === mockData.user?.id && t.status === "APPROVED")
        .reduce((sum, t) => sum + t.amount, 0),
      pending: mockData.payouts.filter(p => p.userId === mockData.user?.id && p.status === "PENDING")
        .reduce((sum, p) => sum + p.amount, 0),
      paid: mockData.payouts.filter(p => p.userId === mockData.user?.id && p.status === "PAID")
        .reduce((sum, p) => sum + p.amount, 0),
    },

    // Stock/Materials
    "stock:getAllMaterials": mockData.materials,
    "stock:getMaterialRequests": mockData.materialRequests,
    "stock:getPendingRequests": mockData.materialRequests.filter(r => r.status === "PENDING"),
    "stock:getLowStockMaterials": mockData.materials.filter(m => m.currentStock <= m.minStock),

    // Transactions
    "transactions:list": mockData.transactions,
    "transactions:getRecent": mockData.transactions.slice(0, 10),
  };

  // Handle function-style queries
  if (typeof queryPath === "function") {
    return undefined;
  }

  // Extract the query name from the path
  const queryName = typeof queryPath === "string" ? queryPath : queryPath?.toString() || "";
  
  return queryMap[queryName] ?? null;
}

// Mock useMutation replacement
export function useMutation(mutationPath: any): any {
  const mockData = useMockData();

  return useCallback(async (args: any) => {
    const mutationName = typeof mutationPath === "string" ? mutationPath : mutationPath?.toString() || "";

    switch (mutationName) {
      case "tasks:createTask":
        mockData.createTask(args);
        return { success: true };

      case "tasks:reviewTask":
        if (args.action === "approve") {
          mockData.approveTask(args.taskId);
        } else {
          mockData.rejectTask(args.taskId);
        }
        return { success: true };

      case "payouts:requestPayout":
        mockData.createPayout(mockData.user?.id || "", args.amount);
        return { success: true };

      case "payouts:processPayout":
        if (args.action === "approve") {
          mockData.approvePayout(args.payoutId);
        } else {
          mockData.rejectPayout(args.payoutId);
        }
        return { success: true };

      case "stock:createMaterial":
        mockData.addMaterial(args);
        return { success: true };

      case "stock:updateStock":
        mockData.updateMaterialStock(args.materialId, args.quantity);
        return { success: true };

      case "stock:createMaterialRequest":
        mockData.createMaterialRequest(args);
        return { success: true };

      case "stock:approveMaterialRequest":
        mockData.approveMaterialRequest(args.requestId);
        return { success: true };

      case "stock:rejectMaterialRequest":
        mockData.rejectMaterialRequest(args.requestId);
        return { success: true };

      case "roles:assignRole":
        mockData.assignRole(args.userId, args.role);
        return { success: true };

      default:
        console.log("[Mock] Unhandled mutation:", mutationName, args);
        return { success: true };
    }
  }, [mockData, mutationPath]);
}

// Helper function to get permissions for a role
function getPermissionsForRole(role: string) {
  const permissionMap: Record<string, string[]> = {
    admin: ["manage_users", "manage_roles", "view_all", "manage_projects", "manage_finance", "manage_stock"],
    acting_manager: ["view_all", "manage_projects", "approve_tasks", "manage_payouts"],
    engineering_lead: ["view_projects", "approve_tasks", "manage_team", "request_payouts"],
    engineer: ["view_assigned", "create_tasks", "request_materials"],
    finance_manager: ["view_finance", "manage_payouts", "view_transactions"],
    stock_manager: ["manage_stock", "approve_material_requests", "view_inventory"],
  };
  return permissionMap[role] || [];
}
