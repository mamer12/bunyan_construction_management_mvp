import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    Package,
    PackagePlus,
    PackageMinus,
    AlertTriangle,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    Warehouse,
    TrendingUp,
    Plus,
    Filter
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "./TopBar";
import { useLanguage } from "../contexts/LanguageContext";
import { Modal, ModalFooter, FormField } from "./ui/Modal";
import {
    MotionCard,
    MotionGradientCard,
    AnimatedCounter,
    MotionButton,
    MotionListItem
} from "./ui/motion";
import { useIsMobile } from "../hooks/use-mobile";

const CATEGORIES = [
    { id: "cement", label: "Cement", icon: Package },
    { id: "steel", label: "Steel", icon: Package },
    { id: "electrical", label: "Electrical", icon: Package },
    { id: "plumbing", label: "Plumbing", icon: Package },
    { id: "finishing", label: "Finishing", icon: Package },
];

const PRIORITY_COLORS = {
    LOW: { bg: "#F1F5F9", color: "#64748B" },
    NORMAL: { bg: "#EFF6FF", color: "#3B82F6" },
    HIGH: { bg: "#FEF3C7", color: "#F59E0B" },
    URGENT: { bg: "#FEF2F2", color: "#EF4444" },
};

export function StockDashboard() {
    const { t, language } = useLanguage();
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    // Queries
    const materials = useQuery(api.stock.getAllMaterials) || [];
    const stockStats = useQuery(api.stock.getStockStats);
    const pendingRequests = useQuery(api.stock.getMaterialRequests, { status: "PENDING" }) || [];
    const approvedRequests = useQuery(api.stock.getMaterialRequests, { status: "APPROVED" }) || [];
    const lowStockMaterials = useQuery(api.stock.getLowStockMaterials) || [];

    // Mutations
    const addMaterial = useMutation(api.stock.addMaterial);
    const updateStock = useMutation(api.stock.updateStock);
    const approveRequest = useMutation(api.stock.approveMaterialRequest);
    const rejectRequest = useMutation(api.stock.rejectMaterialRequest);
    const deliverRequest = useMutation(api.stock.deliverMaterialRequest);

    const handleAddMaterial = async (data: any) => {
        try {
            await addMaterial(data);
            toast.success("Material added successfully");
            setShowAddMaterialModal(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to add material");
        }
    };

    const handleUpdateStock = async (type: "IN" | "OUT" | "ADJUSTMENT", quantity: number, notes?: string) => {
        if (!selectedMaterial) return;
        try {
            await updateStock({
                materialId: selectedMaterial._id,
                type,
                quantity,
                notes
            });
            toast.success("Stock updated");
            setShowStockModal(false);
            setSelectedMaterial(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to update stock");
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        try {
            await approveRequest({ requestId: requestId as any });
            toast.success("Request approved");
        } catch (error: any) {
            toast.error(error.message || "Failed to approve request");
        }
    };

    const handleRejectRequest = async (requestId: string, reason: string) => {
        try {
            await rejectRequest({ requestId: requestId as any, reason });
            toast.success("Request rejected");
            setSelectedRequest(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to reject request");
        }
    };

    const handleDeliverRequest = async (requestId: string) => {
        try {
            await deliverRequest({ requestId: requestId as any });
            toast.success("Materials delivered and stock updated");
        } catch (error: any) {
            toast.error(error.message || "Failed to mark as delivered");
        }
    };

    return (
        <div className="layout-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <StockSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="main-content">
                <TopBar
                    breadcrumb="Stock Management"
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    userName="Stock Manager"
                />

                <div className="p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === "dashboard" && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Stats */}
                                <div className="bento-grid" style={{ padding: 0, marginBottom: "1.5rem" }}>
                                    <MotionCard delay={0.1}>
                                        <div className="stat-card">
                                            <div className="stat-icon" style={{ background: "#F5F3FF", color: "#8B5CF6" }}>
                                                <Package size={20} />
                                            </div>
                                            <div className="stat-value">
                                                <AnimatedCounter value={stockStats?.totalMaterials || 0} />
                                            </div>
                                            <div className="stat-label">Total Materials</div>
                                        </div>
                                    </MotionCard>

                                    <MotionCard delay={0.15}>
                                        <div className="stat-card">
                                            <div className="stat-icon orange">
                                                <Clock size={20} />
                                            </div>
                                            <div className="stat-value">
                                                <AnimatedCounter value={stockStats?.pendingRequests || 0} />
                                            </div>
                                            <div className="stat-label">Pending Requests</div>
                                        </div>
                                    </MotionCard>

                                    <MotionCard delay={0.2}>
                                        <div className="stat-card">
                                            <div className="stat-icon emerald">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div className="stat-value">
                                                <AnimatedCounter value={stockStats?.approvedRequests || 0} />
                                            </div>
                                            <div className="stat-label">Ready to Deliver</div>
                                        </div>
                                    </MotionCard>

                                    <MotionCard delay={0.25}>
                                        <div className="stat-card">
                                            <div className="stat-icon" style={{ background: "#FEF2F2", color: "#EF4444" }}>
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div className="stat-value" style={{ color: "#EF4444" }}>
                                                <AnimatedCounter value={stockStats?.lowStockItems || 0} />
                                            </div>
                                            <div className="stat-label">Low Stock Alerts</div>
                                        </div>
                                    </MotionCard>
                                </div>

                                {/* Low Stock Alerts */}
                                {lowStockMaterials.length > 0 && (
                                    <MotionCard delay={0.3} style={{ marginBottom: "1.5rem" }}>
                                        <div className="card-header" style={{ 
                                            background: "#FEF2F2", 
                                            borderBottom: "1px solid #FECACA" 
                                        }}>
                                            <h3 className="card-title" style={{ color: "#DC2626", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <AlertTriangle size={18} /> Low Stock Alerts
                                            </h3>
                                        </div>
                                        <div className="card-body">
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                                                {lowStockMaterials.map((material: any) => (
                                                    <motion.div
                                                        key={material._id}
                                                        whileHover={{ scale: 1.02 }}
                                                        style={{
                                                            padding: "0.75rem 1rem",
                                                            background: "#FEF2F2",
                                                            border: "1px solid #FECACA",
                                                            borderRadius: "0.75rem",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "0.75rem"
                                                        }}
                                                    >
                                                        <span style={{ fontWeight: 600, color: "#DC2626" }}>
                                                            {material.name}
                                                        </span>
                                                        <span style={{ 
                                                            fontSize: "0.75rem", 
                                                            color: "#991B1B",
                                                            background: "white",
                                                            padding: "0.25rem 0.5rem",
                                                            borderRadius: "0.5rem"
                                                        }}>
                                                            {material.currentStock} / {material.minStock} {material.unit}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </MotionCard>
                                )}

                                {/* Pending Requests */}
                                <MotionCard delay={0.35}>
                                    <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 className="card-title">Pending Material Requests</h3>
                                    </div>
                                    {pendingRequests.length === 0 ? (
                                        <div className="empty-state">
                                            <CheckCircle2 size={48} style={{ color: "var(--success)", opacity: 0.5 }} />
                                            <p className="empty-title" style={{ marginTop: "1rem" }}>No pending requests</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
                                            {pendingRequests.map((request: any, index: number) => (
                                                <RequestCard
                                                    key={request._id}
                                                    request={request}
                                                    index={index}
                                                    onApprove={() => handleApproveRequest(request._id)}
                                                    onReject={() => setSelectedRequest(request)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </MotionCard>
                            </motion.div>
                        )}

                        {activeTab === "inventory" && (
                            <motion.div
                                key="inventory"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MotionCard>
                                    <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 className="card-title">Inventory</h3>
                                        <MotionButton
                                            className="btn-primary"
                                            onClick={() => setShowAddMaterialModal(true)}
                                            style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                                        >
                                            <Plus size={16} /> Add Material
                                        </MotionButton>
                                    </div>
                                    <div style={{ overflowX: "auto" }}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Material</th>
                                                    <th>Category</th>
                                                    <th>Current Stock</th>
                                                    <th>Min Stock</th>
                                                    <th>Unit Price</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {materials.map((material: any, index: number) => {
                                                    const isLow = material.currentStock <= material.minStock;
                                                    return (
                                                        <motion.tr
                                                            key={material._id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 + index * 0.03 }}
                                                            style={{
                                                                background: isLow ? "#FEF2F2" : undefined
                                                            }}
                                                        >
                                                            <td>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                                    {isLow && <AlertTriangle size={14} style={{ color: "#EF4444" }} />}
                                                                    <span style={{ fontWeight: 600 }}>{material.name}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="badge badge-neutral" style={{ textTransform: "capitalize" }}>
                                                                    {material.category}
                                                                </span>
                                                            </td>
                                                            <td style={{ 
                                                                fontWeight: 700, 
                                                                color: isLow ? "#EF4444" : "var(--brand-primary)" 
                                                            }}>
                                                                {material.currentStock} {material.unit}
                                                            </td>
                                                            <td style={{ color: "var(--text-secondary)" }}>
                                                                {material.minStock} {material.unit}
                                                            </td>
                                                            <td style={{ fontWeight: 600 }}>
                                                                ${material.unitPrice}
                                                            </td>
                                                            <td>
                                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                                    <MotionButton
                                                                        className="btn-secondary"
                                                                        onClick={() => {
                                                                            setSelectedMaterial(material);
                                                                            setShowStockModal(true);
                                                                        }}
                                                                        style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                                                                    >
                                                                        <PackagePlus size={14} /> Update
                                                                    </MotionButton>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </MotionCard>
                            </motion.div>
                        )}

                        {activeTab === "delivery" && (
                            <motion.div
                                key="delivery"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MotionCard>
                                    <div className="card-header">
                                        <h3 className="card-title">Ready for Delivery</h3>
                                    </div>
                                    {approvedRequests.length === 0 ? (
                                        <div className="empty-state">
                                            <Truck size={48} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
                                            <p className="empty-title" style={{ marginTop: "1rem" }}>No deliveries pending</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
                                            {approvedRequests.map((request: any, index: number) => (
                                                <motion.div
                                                    key={request._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 + index * 0.05 }}
                                                    style={{
                                                        padding: "1.25rem",
                                                        background: "var(--bg-mint)",
                                                        border: "1px solid var(--border-emerald)",
                                                        borderRadius: "1rem"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                                                        <div>
                                                            <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
                                                                {request.projectName}
                                                            </div>
                                                            <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                                                Requested by {request.requestedByName}
                                                            </div>
                                                        </div>
                                                        <span className="badge badge-success">Approved</span>
                                                    </div>

                                                    <div style={{ marginBottom: "1rem" }}>
                                                        {request.items.map((item: any, i: number) => (
                                                            <div key={i} style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                padding: "0.5rem 0",
                                                                borderBottom: i < request.items.length - 1 ? "1px solid var(--border)" : "none"
                                                            }}>
                                                                <span>{item.materialName}</span>
                                                                <span style={{ fontWeight: 600 }}>{item.quantity} {item.unit}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <MotionButton
                                                        className="btn-primary"
                                                        onClick={() => handleDeliverRequest(request._id)}
                                                        style={{ width: "100%" }}
                                                    >
                                                        <Truck size={16} /> Mark as Delivered
                                                    </MotionButton>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </MotionCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Add Material Modal */}
            <AddMaterialModal
                isOpen={showAddMaterialModal}
                onClose={() => setShowAddMaterialModal(false)}
                onSubmit={handleAddMaterial}
            />

            {/* Update Stock Modal */}
            <UpdateStockModal
                isOpen={showStockModal}
                material={selectedMaterial}
                onClose={() => {
                    setShowStockModal(false);
                    setSelectedMaterial(null);
                }}
                onUpdate={handleUpdateStock}
            />

            {/* Reject Request Modal */}
            <RejectRequestModal
                isOpen={!!selectedRequest}
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onReject={(reason) => handleRejectRequest(selectedRequest?._id, reason)}
            />
        </div>
    );
}

// Request Card Component
function RequestCard({ request, index, onApprove, onReject }: {
    request: any;
    index: number;
    onApprove: () => void;
    onReject: () => void;
}) {
    const priorityStyle = PRIORITY_COLORS[request.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.NORMAL;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            style={{
                padding: "1.25rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "1rem"
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                <div>
                    <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
                        {request.projectName}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                        {request.requestedByName} - {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <span 
                    className="badge"
                    style={{ background: priorityStyle.bg, color: priorityStyle.color }}
                >
                    {request.priority}
                </span>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                {request.items.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.375rem 0",
                        fontSize: "0.875rem"
                    }}>
                        <span>{item.materialName}</span>
                        <span style={{ fontWeight: 600 }}>{item.quantity} {item.unit}</span>
                    </div>
                ))}
                {request.items.length > 3 && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        +{request.items.length - 3} more items
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
                <MotionButton
                    className="btn-success"
                    onClick={onApprove}
                    style={{ flex: 1, padding: "0.625rem" }}
                >
                    <CheckCircle2 size={16} /> Approve
                </MotionButton>
                <MotionButton
                    className="btn-danger"
                    onClick={onReject}
                    style={{ padding: "0.625rem" }}
                >
                    <XCircle size={16} />
                </MotionButton>
            </div>
        </motion.div>
    );
}

// Add Material Modal
function AddMaterialModal({ isOpen, onClose, onSubmit }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}) {
    const [form, setForm] = useState({
        name: "",
        nameAr: "",
        unit: "piece",
        category: "cement",
        currentStock: 0,
        minStock: 10,
        unitPrice: 0
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit({
            ...form,
            currentStock: Number(form.currentStock),
            minStock: Number(form.minStock),
            unitPrice: Number(form.unitPrice)
        });
        setLoading(false);
        setForm({ name: "", nameAr: "", unit: "piece", category: "cement", currentStock: 0, minStock: 10, unitPrice: 0 });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Material"
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <FormField label="Material Name" required>
                    <input
                        className="input"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g., Portland Cement"
                        required
                    />
                </FormField>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <FormField label="Category" required>
                        <select
                            className="input"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </FormField>

                    <FormField label="Unit" required>
                        <select
                            className="input"
                            value={form.unit}
                            onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        >
                            <option value="piece">Piece</option>
                            <option value="kg">Kilogram (kg)</option>
                            <option value="ton">Ton</option>
                            <option value="meter">Meter</option>
                            <option value="bag">Bag</option>
                            <option value="box">Box</option>
                        </select>
                    </FormField>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <FormField label="Current Stock" required>
                        <input
                            className="input"
                            type="number"
                            value={form.currentStock}
                            onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })}
                            min="0"
                            required
                        />
                    </FormField>

                    <FormField label="Min Stock" required>
                        <input
                            className="input"
                            type="number"
                            value={form.minStock}
                            onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
                            min="0"
                            required
                        />
                    </FormField>

                    <FormField label="Unit Price ($)" required>
                        <input
                            className="input"
                            type="number"
                            value={form.unitPrice}
                            onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
                            min="0"
                            step="0.01"
                            required
                        />
                    </FormField>
                </div>

                <div className="modal-footer" style={{ marginTop: "1.5rem", padding: 0, border: "none" }}>
                    <ModalFooter
                        onCancel={onClose}
                        submitText="Add Material"
                        loading={loading}
                    />
                </div>
            </form>
        </Modal>
    );
}

// Update Stock Modal
function UpdateStockModal({ isOpen, material, onClose, onUpdate }: {
    isOpen: boolean;
    material: any;
    onClose: () => void;
    onUpdate: (type: "IN" | "OUT" | "ADJUSTMENT", quantity: number, notes?: string) => void;
}) {
    const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
    const [quantity, setQuantity] = useState(0);
    const [notes, setNotes] = useState("");

    if (!material) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Update Stock: ${material?.name}`}
            size="sm"
        >
            <div style={{ marginBottom: "1rem", padding: "1rem", background: "var(--bg-mint)", borderRadius: "0.75rem" }}>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Current Stock</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--brand-primary)" }}>
                    {material?.currentStock} {material?.unit}
                </div>
            </div>

            <FormField label="Type">
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[
                        { value: "IN", label: "Stock In", icon: PackagePlus, color: "#059669" },
                        { value: "OUT", label: "Stock Out", icon: PackageMinus, color: "#EF4444" },
                        { value: "ADJUSTMENT", label: "Adjust", icon: Package, color: "#3B82F6" }
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setType(opt.value as any)}
                            style={{
                                flex: 1,
                                padding: "0.75rem",
                                background: type === opt.value ? `${opt.color}15` : "var(--bg-primary)",
                                border: `2px solid ${type === opt.value ? opt.color : "var(--border)"}`,
                                borderRadius: "0.75rem",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.25rem"
                            }}
                        >
                            <opt.icon size={20} style={{ color: type === opt.value ? opt.color : "var(--text-muted)" }} />
                            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </FormField>

            <FormField label={type === "ADJUSTMENT" ? "New Stock Level" : "Quantity"}>
                <input
                    className="input"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="0"
                />
            </FormField>

            <FormField label="Notes (optional)">
                <input
                    className="input"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., New shipment received"
                />
            </FormField>

            <div className="modal-footer" style={{ marginTop: "1.5rem", padding: 0, border: "none" }}>
                <MotionButton className="btn-ghost" onClick={onClose}>Cancel</MotionButton>
                <MotionButton className="btn-primary" onClick={() => onUpdate(type, quantity, notes)}>
                    Update Stock
                </MotionButton>
            </div>
        </Modal>
    );
}

// Reject Request Modal
function RejectRequestModal({ isOpen, request, onClose, onReject }: {
    isOpen: boolean;
    request: any;
    onClose: () => void;
    onReject: (reason: string) => void;
}) {
    const [reason, setReason] = useState("");

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reject Request"
            size="sm"
        >
            <FormField label="Rejection Reason" required>
                <textarea
                    className="input"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    style={{ minHeight: 100, resize: "vertical" }}
                />
            </FormField>

            <div className="modal-footer" style={{ marginTop: "1.5rem", padding: 0, border: "none" }}>
                <MotionButton className="btn-ghost" onClick={onClose}>Cancel</MotionButton>
                <MotionButton 
                    className="btn-danger" 
                    onClick={() => {
                        onReject(reason);
                        setReason("");
                    }}
                    style={{ opacity: reason ? 1 : 0.5 }}
                >
                    Reject Request
                </MotionButton>
            </div>
        </Modal>
    );
}

// Stock-specific Sidebar
function StockSidebar({ activeTab, onTabChange, isOpen, onClose }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOpen: boolean;
    onClose: () => void;
}) {
    const { signOut } = require("@convex-dev/auth/react").useAuthActions();
    const { t } = useLanguage();
    const isMobile = useIsMobile();

    const menuItems = [
        { id: "dashboard", label: "Overview", icon: TrendingUp },
        { id: "inventory", label: "Inventory", icon: Warehouse },
        { id: "delivery", label: "Delivery", icon: Truck },
    ];

    const shouldBeOpen = isMobile ? isOpen : true;

    return (
        <>
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                className={`sidebar ${shouldBeOpen ? 'open' : ''}`}
                initial={false}
                animate={shouldBeOpen ? { x: 0, opacity: 1 } : { x: -280, opacity: 0 }}
                style={{
                    background: "linear-gradient(180deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)"
                }}
            >
                {/* Logo */}
                <div style={{
                    padding: "2rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    borderBottom: "1px solid rgba(255,255,255,0.1)"
                }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1.25rem"
                    }}>
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>Bunyan</h1>
                        <span style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Stock Manager
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "1.5rem 0" }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onTabChange(item.id);
                                if (isMobile) onClose();
                            }}
                            className={`sidebar-link ${activeTab === item.id ? "active" : ""}`}
                            style={{
                                width: "calc(100% - 1.5rem)",
                                background: activeTab === item.id ? "white" : "none",
                                color: activeTab === item.id ? "#7C3AED" : "rgba(255,255,255,0.8)",
                                border: "none",
                                cursor: "pointer",
                                textAlign: "left",
                                margin: "0.25rem 0.75rem"
                            }}
                        >
                            <item.icon size={20} />
                            <span style={{ fontWeight: activeTab === item.id ? 700 : 500 }}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Sign Out */}
                <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <button
                        className="sidebar-link"
                        onClick={() => void signOut()}
                        style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "1rem",
                            justifyContent: "center"
                        }}
                    >
                        {t("signOut")}
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
