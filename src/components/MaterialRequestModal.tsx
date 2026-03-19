import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Id } from '../../convex/_generated/dataModel';

interface MaterialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: Id<"projects">;
  projectName: string;
  userId: string;
  userName: string;
}

interface RequestItem {
  materialId: Id<"materials">;
  materialName: string;
  quantity: number;
  unit: string;
}

export function MaterialRequestModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  userId,
  userName,
}: MaterialRequestModalProps) {
  const materials = useQuery(api.stock.getMaterials) || [];
  const createRequest = useMutation(api.stock.createMaterialRequest);
  
  const [items, setItems] = useState<RequestItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [priority, setPriority] = useState<string>('NORMAL');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = () => {
    const material = materials.find(m => m._id === selectedMaterial);
    if (!material || quantity <= 0) return;

    const existingIndex = items.findIndex(i => i.materialId === selectedMaterial);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      setItems(updated);
    } else {
      setItems([...items, {
        materialId: material._id as Id<"materials">,
        materialName: material.name,
        quantity,
        unit: material.unit,
      }]);
    }
    setSelectedMaterial('');
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await createRequest({
        projectId,
        requestedBy: userId,
        requestedByName: userName,
        items,
        priority,
        notes: notes || undefined,
      });
      onClose();
      setItems([]);
      setNotes('');
      setPriority('NORMAL');
    } catch (error) {
      console.error('Failed to create request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityColors: Record<string, string> = {
    LOW: 'var(--text-muted)',
    NORMAL: 'var(--brand-primary)',
    HIGH: '#f59e0b',
    URGENT: '#ef4444',
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal"
          style={{ maxWidth: '600px' }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <h2 className="modal-title">Request Materials</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Project: {projectName}
              </p>
            </div>
            <button className="modal-close" onClick={onClose}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="modal-body">
            {/* Add Material Form */}
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <select
                className="input"
                style={{ flex: '2', minWidth: '200px' }}
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                <option value="">Select Material...</option>
                {materials.map((mat) => (
                  <option key={mat._id} value={mat._id}>
                    {mat.name} ({mat.currentStock} {mat.unit} available)
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="input"
                style={{ flex: '1', minWidth: '100px' }}
                placeholder="Qty"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
              <motion.button
                className="btn btn-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddItem}
                disabled={!selectedMaterial || quantity <= 0}
              >
                Add
              </motion.button>
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                  Requested Items ({items.length})
                </label>
                <div style={{ 
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden'
                }}>
                  {items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderBottom: index < items.length - 1 ? '1px solid var(--border)' : 'none',
                        background: 'var(--bg-secondary)',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 500 }}>{item.materialName}</span>
                        <span style={{ 
                          marginLeft: '0.5rem',
                          padding: '0.125rem 0.5rem',
                          background: 'var(--brand-primary)',
                          color: 'white',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                        }}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0.25rem',
                        }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                Priority
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((p) => (
                  <motion.button
                    key={p}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPriority(p)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      border: priority === p ? 'none' : '1px solid var(--border)',
                      background: priority === p ? priorityColors[p] : 'transparent',
                      color: priority === p ? 'white' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                Notes (Optional)
              </label>
              <textarea
                className="input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Add any special instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <motion.button
              className="btn btn-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
            >
              Cancel
            </motion.button>
            <motion.button
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={items.length === 0 || isSubmitting}
              style={{ opacity: items.length === 0 ? 0.5 : 1 }}
            >
              {isSubmitting ? 'Submitting...' : `Submit Request (${items.length} items)`}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MaterialRequestModal;
