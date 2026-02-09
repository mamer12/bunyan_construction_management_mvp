import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Modal } from "./ui/modal";
import { MotionCard, MotionButton, StaggerContainer, StaggerItem } from "./ui/motion";
import {
    Check,
    X,
    Package,
    Truck,
    Clock,
    Plus,
    Edit2,
    Trash2,
    AlertTriangle,
    Search,
    DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// StockView - Stock content without layout wrapper, for embedding in LeadDashboard 
export function StockView() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Data
    const inventory = useQuery(api.stock.getInventory) || [];
    const requests = useQuery(api.stock.getMaterialRequests, {}) || [];
    const stockStats = useQuery(api.stock.getStockStats);

    // Mutations
    const processRequest = useMutation(api.stock.processRequest);
    const addMaterial = useMutation(api.stock.addMaterial);
    const updateMaterial = useMutation(api.stock.updateMaterial);
    const deleteMaterial = useMutation(api.stock.deleteMaterial);

    const handleProcess = async (requestId: string, action: string) => {
        try {
            await processRequest({ requestId: requestId as any, action });
            toast.success(`Request ${action.toLowerCase()} successfully`);
        } catch (error) {
            toast.error("Failed to process request");
        }
    };

    const handleAddMaterial = async (data: Record<string, any>) => {
        try {
            await addMaterial(data);
            toast.success("Material added successfully");
            setShowAddModal(false);
        } catch (error) {
            toast.error(error.message || "Failed to add material");
        }
    };

    const handleUpdateMaterial = async (data: Record<string, any>) => {
        try {
            await updateMaterial({
                materialId: editingMaterial._id,
                ...data
            });
            toast.success("Material updated successfully");
            setEditingMaterial(null);
        } catch (error) {
            toast.error("Failed to update material");
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm("Are you sure you want to delete this material?")) return;
        try {
            await deleteMaterial({ materialId: materialId as any });
            toast.success("Material deleted successfully");
        } catch (error) {
            toast.error("Failed to delete material");
        }
    };

    const filteredInventory = inventory.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lowStockItems = inventory.filter(
        (m) => m.minimumStock && m.currentStock <= m.minimumStock
    );

    return (
        <>
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
                                {requests.filter((r) => r.status === "PENDING").length}
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
                <MotionCard className="dashboard-card alert-card" style={{ marginTop: "1.5rem" }}>
                    <div className="card-header alert-header">
                        <div className="card-header__title">
                            <AlertTriangle size={20} className="text-warning" />
                            <h3>Low Stock Alert</h3>
                        </div>
                        <span className="badge badge--warning">{lowStockItems.length} items</span>
                    </div>
                    <div className="card-body">
                        <div className="low-stock-grid">
                            {lowStockItems.map((item) => (
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
            <MotionCard className="dashboard-card" style={{ marginTop: "1.5rem" }}>
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
                            className="btn-primary btn-sm"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus size={16} /> Add Material
                        </MotionButton>
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Current Stock</th>
                                    <th>Min Stock</th>
                                    <th>Unit</th>
                                    <th>Price/Unit</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.map((item) => (
                                    <motion.tr
                                        key={item._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                                        <td>{item.currentStock}</td>
                                        <td>{item.minimumStock || "-"}</td>
                                        <td>{item.unit}</td>
                                        <td>${item.pricePerUnit?.toFixed(2) || "-"}</td>
                                        <td>
                                            <span className={`badge ${item.minimumStock && item.currentStock <= item.minimumStock
                                                    ? "badge--danger"
                                                    : "badge--success"
                                                }`}>
                                                {item.minimumStock && item.currentStock <= item.minimumStock
                                                    ? "Low Stock"
                                                    : "In Stock"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => setEditingMaterial(item)}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon btn-icon--danger"
                                                    onClick={() => handleDeleteMaterial(item._id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </MotionCard>

            {/* Pending Requests Section */}
            <MotionCard className="dashboard-card" style={{ marginTop: "1.5rem" }}>
                <div className="card-header">
                    <div className="card-header__title">
                        <Truck size={20} />
                        <h3>Material Requests</h3>
                    </div>
                    <span className="badge badge--info">
                        {requests.filter((r) => r.status === "PENDING").length} pending
                    </span>
                </div>
                <div className="card-body">
                    {requests.filter((r) => r.status === "PENDING").length === 0 ? (
                        <div className="empty-state">
                            <Clock size={40} opacity={0.3} />
                            <p>No pending requests</p>
                        </div>
                    ) : (
                        <div className="requests-list">
                            {requests
                                .filter((r) => r.status === "PENDING")
                                .map((request) => (
                                    <div key={request._id} className="request-item">
                                        <div className="request-info">
                                            <div className="request-material">{request.materialName}</div>
                                            <div className="request-meta">
                                                <span>{request.quantity} {request.unit}</span>
                                                <span>•</span>
                                                <span>By: {request.engineerName || "Engineer"}</span>
                                            </div>
                                            {request.notes && (
                                                <div className="request-notes">{request.notes}</div>
                                            )}
                                        </div>
                                        <div className="request-actions">
                                            <MotionButton
                                                className="btn-success btn-sm"
                                                onClick={() => handleProcess(request._id, "approve")}
                                            >
                                                <Check size={16} /> Approve
                                            </MotionButton>
                                            <MotionButton
                                                className="btn-danger btn-sm"
                                                onClick={() => handleProcess(request._id, "reject")}
                                            >
                                                <X size={16} /> Reject
                                            </MotionButton>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </MotionCard>

            {/* Add Material Modal */}
            {showAddModal && (
                <MaterialFormModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddMaterial}
                />
            )}

            {/* Edit Material Modal */}
            {editingMaterial && (
                <MaterialFormModal
                    material={editingMaterial}
                    onClose={() => setEditingMaterial(null)}
                    onSubmit={handleUpdateMaterial}
                />
            )}
        </>
    );
}

// Material Form Modal Component
function MaterialFormModal({
    material,
    onClose,
    onSubmit
}: {
    material?: Record<string, any>;
    onClose: () => void;
    onSubmit: (data: Record<string, any>) => void;
}) {
    const [name, setName] = useState(material?.name || "");
    const [unit, setUnit] = useState(material?.unit || "pcs");
    const [currentStock, setCurrentStock] = useState(material?.currentStock?.toString() || "0");
    const [minimumStock, setMinimumStock] = useState(material?.minimumStock?.toString() || "");
    const [pricePerUnit, setPricePerUnit] = useState(material?.pricePerUnit?.toString() || "");

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Please enter material name");
            return;
        }
        onSubmit({
            name: name.trim(),
            unit,
            currentStock: parseFloat(currentStock) || 0,
            minimumStock: minimumStock ? parseFloat(minimumStock) : undefined,
            pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined
        });
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={material ? "Edit Material" : "Add Material"}
        >
            <div className="form-group">
                <label className="label">Material Name</label>
                <input
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Cement"
                />
            </div>

            <div className="form-group">
                <label className="label">Unit</label>
                <select
                    className="input"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="bags">Bags</option>
                    <option value="m">Meters</option>
                    <option value="m2">Square Meters</option>
                    <option value="m3">Cubic Meters</option>
                </select>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="label">Current Stock</label>
                    <input
                        type="number"
                        className="input"
                        value={currentStock}
                        onChange={(e) => setCurrentStock(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="label">Minimum Stock</label>
                    <input
                        type="number"
                        className="input"
                        value={minimumStock}
                        onChange={(e) => setMinimumStock(e.target.value)}
                        placeholder="Optional"
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="label">Price per Unit ($)</label>
                <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    placeholder="Optional"
                />
            </div>

            <div className="modal-actions">
                <MotionButton className="btn-ghost" onClick={onClose}>
                    Cancel
                </MotionButton>
                <MotionButton className="btn-primary" onClick={handleSubmit}>
                    {material ? "Update" : "Add"} Material
                </MotionButton>
            </div>
        </Modal>
    );
}
