import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { FloatingMobileNav } from "./FloatingMobileNav";
import { useIsMobile } from "../hooks/use-mobile";
import { Modal } from "./ui/modal";
import { MotionCard, MotionButton, StaggerContainer, StaggerItem } from "./ui/motion";
import {
    X,
    Package,
    Truck,
    Clock,
    Plus,
    Edit2,
    Trash2,
    AlertTriangle,
    Search,
    DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const ROLE_MENU_ACCESS = {
    admin: ["dashboard", "projects", "teams", "wallet", "settings"],
    acting_manager: ["dashboard", "projects", "teams", "wallet", "settings"],
    lead: ["dashboard", "projects", "teams", "wallet"],
    engineer: ["dashboard", "tasks", "wallet"],
    guest: ["dashboard"]
};

export function StockDashboard() {
    const { language } = useLanguage();
    const location = useLocation();
    const navigateTo = useNavigate();
    const activeTab = location.pathname.split('/')[1] || 'dashboard';
    const setActiveTab = (tab: string) => navigateTo(`/${tab}`);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const isMobile = useIsMobile();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // User Data
    const currentUser = useQuery(api.auth.loggedInUser);
    const role = (currentUser?.role as keyof typeof ROLE_MENU_ACCESS) || "guest";
    const allowedMenuIds = ROLE_MENU_ACCESS[role] || [];

    // Data
    const inventory = useQuery(api.stock.getInventory) || [];
    const requests = useQuery(api.stock.getMaterialRequests, {}) || [];
    const stockStats = useQuery(api.stock.getStockStats);

    // Mutations
    const processRequest = useMutation(api.stock.processRequest);
    const addMaterial = useMutation(api.stock.addMaterial);
    const updateMaterial = useMutation(api.stock.updateMaterial);
    const deleteMaterial = useMutation(api.stock.deleteMaterial);

    const handleProcess = async (requestId: Id<"material_requests">, action: "FULFILL" | "REJECT") => {
        try {
            await processRequest({ requestId, action });
            toast.success(`Request ${action.toLowerCase()} successfully`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to process request");
        }
    };

    const handleAddMaterial = async (data: {
        name: string;
        unit: string;
        currentStock: number;
        minimumStock?: number;
        pricePerUnit?: number;
    }) => {
        try {
            await addMaterial(data);
            toast.success("Material added successfully");
            setShowAddModal(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add material");
        }
    };

    const handleUpdateMaterial = async (data: {
        name: string;
        unit: string;
        currentStock: number;
        minimumStock?: number;
        pricePerUnit?: number;
    }) => {
        try {
            await updateMaterial({
                materialId: editingMaterial._id as Id<"materials">,
                ...data
            });
            toast.success("Material updated successfully");
            setEditingMaterial(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update material");
        }
    };

    const handleDeleteMaterial = async (materialId: Id<"materials">) => {
        if (!confirm("Are you sure you want to delete this material?")) return;
        try {
            await deleteMaterial({ materialId });
            toast.success("Material deleted successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete material");
        }
    };

    const filteredInventory = inventory.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lowStockItems = inventory.filter(
        (m) => m.minimumStock && m.currentStock <= m.minimumStock
    );

    return (
        <div className="layout-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className="main-content">
                <TopBar
                    userName={currentUser?.name || "User"}
                    userRole={currentUser?.role || "guest"}
                />

                <div className="dashboard-content" style={{ padding: '2rem' }}>
                    {/* Stats Overview */}
                    <StaggerContainer className="stats-grid">
                        <StaggerItem>
                            <MotionCard className="stat-card stat-card--primary">
                                <div className="stat-card__icon">
                                    <Package size={24} />
                                </div>
                                <div className="stat-card__content">
                                    <span className="stat-card__value">{inventory.length}</span>
                                    <span className="stat-card__label">Total Materials</span>
                                </div>
                            </MotionCard>
                        </StaggerItem>

                        <StaggerItem>
                            <MotionCard className="stat-card stat-card--warning">
                                <div className="stat-card__icon">
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="stat-card__content">
                                    <span className="stat-card__value">{lowStockItems.length}</span>
                                    <span className="stat-card__label">Low Stock Items</span>
                                </div>
                            </MotionCard>
                        </StaggerItem>

                        <StaggerItem>
                            <MotionCard className="stat-card stat-card--info">
                                <div className="stat-card__icon">
                                    <Clock size={24} />
                                </div>
                                <div className="stat-card__content">
                                    <span className="stat-card__value">
                                        {requests.filter((r: any) => r.status === "PENDING").length}
                                    </span>
                                    <span className="stat-card__label">Pending Requests</span>
                                </div>
                            </MotionCard>
                        </StaggerItem>

                        <StaggerItem>
                            <MotionCard className="stat-card stat-card--success">
                                <div className="stat-card__icon">
                                    <DollarSign size={24} />
                                </div>
                                <div className="stat-card__content">
                                    <span className="stat-card__value">
                                        ${(stockStats?.totalInventoryValue || 0).toLocaleString()}
                                    </span>
                                    <span className="stat-card__label">Inventory Value</span>
                                </div>
                            </MotionCard>
                        </StaggerItem>
                    </StaggerContainer>

                    {/* Low Stock Alert */}
                    {lowStockItems.length > 0 && (
                        <MotionCard className="dashboard-card alert-card" style={{ marginTop: '2rem' }}>
                            <div className="card-header alert-header">
                                <div className="card-header__title">
                                    <AlertTriangle size={20} className="text-warning" />
                                    <h3>Low Stock Alert</h3>
                                </div>
                                <span className="badge badge--warning">{lowStockItems.length} items</span>
                            </div>
                            <div className="card-body">
                                <div className="low-stock-grid">
                                    {lowStockItems.map((item: any) => (
                                        <div key={item._id} className="low-stock-item">
                                            <span className="name">{item.name}</span>
                                            <span className="stock">
                                                {item.currentStock} / {item.minimumStock} {item.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </MotionCard>
                    )}

                    {/* Inventory Section */}
                    <MotionCard className="dashboard-card" style={{ marginTop: '2rem' }}>
                        <div className="card-header">
                            <div className="card-header__title">
                                <Package size={20} />
                                <h3>Inventory</h3>
                            </div>
                            <div className="card-header__actions">
                                <div className="search-input-wrapper">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search materials..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                                <MotionButton
                                    className="btn-primary"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    <Plus size={16} />
                                    Add Material
                                </MotionButton>
                            </div>
                        </div>

                        <div className="card-body">
                            {filteredInventory.length === 0 ? (
                                <div className="empty-state">
                                    <Package size={48} className="empty-state__icon" />
                                    <p>No materials found</p>
                                </div>
                            ) : (
                                <div className="inventory-grid">
                                    {filteredInventory.map((item: any) => (
                                        <motion.div
                                            key={item._id}
                                            className={`inventory-card ${item.minimumStock && item.currentStock <= item.minimumStock
                                                ? "inventory-card--low"
                                                : ""
                                                }`}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="inventory-card__header">
                                                <div className="inventory-card__icon">
                                                    <Package size={20} />
                                                </div>
                                                <div className="inventory-card__actions">
                                                    <button
                                                        className="icon-btn"
                                                        onClick={() => setEditingMaterial(item)}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        className="icon-btn icon-btn--danger"
                                                        onClick={() => handleDeleteMaterial(item._id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <h4 className="inventory-card__name">{item.name}</h4>
                                            <div className="inventory-card__stock">
                                                <span className="value">{item.currentStock}</span>
                                                <span className="unit">{item.unit}</span>
                                            </div>
                                            {item.minimumStock && (
                                                <div className="inventory-card__min">
                                                    Min: {item.minimumStock} {item.unit}
                                                </div>
                                            )}
                                            {item.pricePerUnit && (
                                                <div className="inventory-card__price">
                                                    ${item.pricePerUnit} / {item.unit}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </MotionCard>

                    {/* Material Requests */}
                    <MotionCard className="dashboard-card" style={{ marginTop: '2rem' }}>
                        <div className="card-header">
                            <div className="card-header__title">
                                <Truck size={20} />
                                <h3>Material Requests</h3>
                            </div>
                            <span className="badge badge--warning">
                                {requests.filter((r: any) => r.status === "PENDING").length} pending
                            </span>
                        </div>

                        <div className="card-body">
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Project</th>
                                            <th>Requested By</th>
                                            <th>Items</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-muted">
                                                    No material requests
                                                </td>
                                            </tr>
                                        ) : (
                                            requests.map((req: any) => (
                                                <tr key={req._id}>
                                                    <td>
                                                        <span className="font-medium">Project</span>
                                                        <div className="text-xs text-muted">
                                                            {req.projectId.toString().slice(0, 8)}...
                                                        </div>
                                                    </td>
                                                    <td className="text-muted">
                                                        User {req.requestedBy.slice(0, 8)}...
                                                    </td>
                                                    <td>
                                                        <div className="space-y-1">
                                                            {req.items.map((item: any, i: number) => {
                                                                const material = inventory.find(
                                                                    (m: any) => m._id === item.materialId
                                                                );
                                                                return (
                                                                    <div key={i} className="text-sm">
                                                                        <span className="font-semibold">{item.quantity}</span>
                                                                        {" x "}
                                                                        {material?.name || "Unknown"}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge--${req.status === "PENDING" ? "warning" :
                                                            req.status === "FULFILLED" ? "success" :
                                                                req.status === "REJECTED" ? "danger" : "neutral"
                                                            }`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {req.status === "PENDING" && (
                                                            <div className="flex gap-2">
                                                                <MotionButton
                                                                    className="btn-icon btn-icon--success"
                                                                    onClick={() => handleProcess(req._id, "FULFILL")}
                                                                >
                                                                    <Truck size={16} />
                                                                </MotionButton>
                                                                <MotionButton
                                                                    className="btn-icon btn-icon--danger"
                                                                    onClick={() => handleProcess(req._id, "REJECT")}
                                                                >
                                                                    <X size={16} />
                                                                </MotionButton>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </MotionCard>
                </div>

                {/* Modals & Nav */}
                <AnimatePresence>
                    {showAddModal && (
                        <MaterialFormModal
                            onClose={() => setShowAddModal(false)}
                            onSubmit={handleAddMaterial}
                        />
                    )}
                    {editingMaterial && (
                        <MaterialFormModal
                            material={editingMaterial}
                            onClose={() => setEditingMaterial(null)}
                            onSubmit={handleUpdateMaterial}
                        />
                    )}
                </AnimatePresence>

                {isMobile && (
                    <FloatingMobileNav />
                )}
            </main>
        </div>
    );
}

// Material Form Modal Component
function MaterialFormModal({
    material,
    onClose,
    onSubmit
}: {
    material?: any;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        unit: string;
        currentStock: number;
        minimumStock?: number;
        pricePerUnit?: number;
    }) => void;
}) {
    const [name, setName] = useState(material?.name || "");
    const [unit, setUnit] = useState(material?.unit || "pcs");
    const [currentStock, setCurrentStock] = useState(material?.currentStock?.toString() || "0");
    const [minimumStock, setMinimumStock] = useState(material?.minimumStock?.toString() || "");
    const [pricePerUnit, setPricePerUnit] = useState(material?.pricePerUnit?.toString() || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Please enter a material name");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                unit,
                currentStock: parseFloat(currentStock) || 0,
                minimumStock: minimumStock ? parseFloat(minimumStock) : undefined,
                pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={material ? "Edit Material" : "Add New Material"}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label className="form-label">Material Name *</label>
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Cement, Steel Rebar"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Unit *</label>
                        <select
                            className="form-select"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                        >
                            <option value="pcs">Pieces (pcs)</option>
                            <option value="kg">Kilograms (kg)</option>
                            <option value="bags">Bags</option>
                            <option value="m">Meters (m)</option>
                            <option value="m2">Square Meters (m²)</option>
                            <option value="m3">Cubic Meters (m³)</option>
                            <option value="liters">Liters</option>
                            <option value="rolls">Rolls</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Current Stock *</label>
                        <input
                            type="number"
                            className="form-input"
                            value={currentStock}
                            onChange={(e) => setCurrentStock(e.target.value)}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Minimum Stock (Alert Level)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={minimumStock}
                            onChange={(e) => setMinimumStock(e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Price per Unit ($)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={pricePerUnit}
                            onChange={(e) => setPricePerUnit(e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="Optional"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <MotionButton
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </MotionButton>
                    <MotionButton
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : material ? "Update Material" : "Add Material"}
                    </MotionButton>
                </div>
            </form>
        </Modal>
    );
}
