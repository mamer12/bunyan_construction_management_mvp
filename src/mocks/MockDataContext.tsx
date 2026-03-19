import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  currentUser,
  mockUsers,
  mockProjects,
  mockUnits,
  mockTasks,
  mockPayouts,
  mockMaterials,
  mockMaterialRequests,
  mockTransactions,
  mockStats,
  MockUser,
  MockProject,
  MockUnit,
  MockTask,
  MockPayout,
  MockMaterial,
  MockMaterialRequest,
  MockTransaction,
  UserRole,
} from "./mockData";

interface MockDataContextType {
  // Auth
  user: MockUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  
  // Data
  users: MockUser[];
  projects: MockProject[];
  units: MockUnit[];
  tasks: MockTask[];
  payouts: MockPayout[];
  materials: MockMaterial[];
  materialRequests: MockMaterialRequest[];
  transactions: MockTransaction[];
  stats: typeof mockStats;
  
  // Actions
  createTask: (task: Omit<MockTask, "_id" | "createdAt">) => void;
  approveTask: (taskId: string) => void;
  rejectTask: (taskId: string) => void;
  createPayout: (userId: string, amount: number) => void;
  approvePayout: (payoutId: string) => void;
  rejectPayout: (payoutId: string) => void;
  createMaterialRequest: (request: Omit<MockMaterialRequest, "_id" | "createdAt" | "status">) => void;
  approveMaterialRequest: (requestId: string) => void;
  rejectMaterialRequest: (requestId: string) => void;
  addMaterial: (material: Omit<MockMaterial, "_id">) => void;
  updateMaterialStock: (materialId: string, quantity: number) => void;
  assignRole: (userId: string, role: UserRole) => void;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(currentUser);
  const [users, setUsers] = useState<MockUser[]>(mockUsers);
  const [projects] = useState<MockProject[]>(mockProjects);
  const [units] = useState<MockUnit[]>(mockUnits);
  const [tasks, setTasks] = useState<MockTask[]>(mockTasks);
  const [payouts, setPayouts] = useState<MockPayout[]>(mockPayouts);
  const [materials, setMaterials] = useState<MockMaterial[]>(mockMaterials);
  const [materialRequests, setMaterialRequests] = useState<MockMaterialRequest[]>(mockMaterialRequests);
  const [transactions, setTransactions] = useState<MockTransaction[]>(mockTransactions);
  const [stats, setStats] = useState(mockStats);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    // Default to current user for any login
    setUser(currentUser);
    return true;
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  }, [user]);

  const createTask = useCallback((task: Omit<MockTask, "_id" | "createdAt">) => {
    const newTask: MockTask = {
      ...task,
      _id: `task_${Date.now()}`,
      createdAt: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const approveTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => 
      t._id === taskId 
        ? { ...t, status: "APPROVED" as const, approvedAt: Date.now(), approvedBy: user?.id }
        : t
    ));
    setStats(prev => ({ ...prev, completedTasks: prev.completedTasks + 1, pendingTasks: prev.pendingTasks - 1 }));
  }, [user]);

  const rejectTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => 
      t._id === taskId ? { ...t, status: "REJECTED" as const } : t
    ));
    setStats(prev => ({ ...prev, pendingTasks: prev.pendingTasks - 1 }));
  }, []);

  const createPayout = useCallback((userId: string, amount: number) => {
    const targetUser = users.find(u => u.id === userId);
    const newPayout: MockPayout = {
      _id: `payout_${Date.now()}`,
      userId,
      userName: targetUser?.name || "Unknown",
      amount,
      status: "PENDING",
      createdAt: Date.now(),
    };
    setPayouts(prev => [...prev, newPayout]);
    setStats(prev => ({ ...prev, pendingPayouts: prev.pendingPayouts + amount }));
  }, [users]);

  const approvePayout = useCallback((payoutId: string) => {
    setPayouts(prev => prev.map(p => 
      p._id === payoutId 
        ? { ...p, status: "PAID" as const, paidAt: Date.now() }
        : p
    ));
  }, []);

  const rejectPayout = useCallback((payoutId: string) => {
    setPayouts(prev => prev.map(p => 
      p._id === payoutId ? { ...p, status: "REJECTED" as const } : p
    ));
  }, []);

  const createMaterialRequest = useCallback((request: Omit<MockMaterialRequest, "_id" | "createdAt" | "status">) => {
    const newRequest: MockMaterialRequest = {
      ...request,
      _id: `req_${Date.now()}`,
      status: "PENDING",
      createdAt: Date.now(),
    };
    setMaterialRequests(prev => [...prev, newRequest]);
  }, []);

  const approveMaterialRequest = useCallback((requestId: string) => {
    setMaterialRequests(prev => prev.map(r => 
      r._id === requestId ? { ...r, status: "APPROVED" as const } : r
    ));
  }, []);

  const rejectMaterialRequest = useCallback((requestId: string) => {
    setMaterialRequests(prev => prev.map(r => 
      r._id === requestId ? { ...r, status: "REJECTED" as const } : r
    ));
  }, []);

  const addMaterial = useCallback((material: Omit<MockMaterial, "_id">) => {
    const newMaterial: MockMaterial = {
      ...material,
      _id: `mat_${Date.now()}`,
    };
    setMaterials(prev => [...prev, newMaterial]);
  }, []);

  const updateMaterialStock = useCallback((materialId: string, quantity: number) => {
    setMaterials(prev => prev.map(m => 
      m._id === materialId ? { ...m, currentStock: m.currentStock + quantity } : m
    ));
  }, []);

  const assignRole = useCallback((userId: string, role: UserRole) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role } : u
    ));
  }, []);

  const value: MockDataContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
    users,
    projects,
    units,
    tasks,
    payouts,
    materials,
    materialRequests,
    transactions,
    stats,
    createTask,
    approveTask,
    rejectTask,
    createPayout,
    approvePayout,
    rejectPayout,
    createMaterialRequest,
    approveMaterialRequest,
    rejectMaterialRequest,
    addMaterial,
    updateMaterialStock,
    assignRole,
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error("useMockData must be used within a MockDataProvider");
  }
  return context;
}
