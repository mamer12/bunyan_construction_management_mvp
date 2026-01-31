import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all materials
export const getAllMaterials = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db.query("materials").collect();
    },
});

// Get materials by category
export const getMaterialsByCategory = query({
    args: { category: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("materials")
            .withIndex("by_category", (q) => q.eq("category", args.category))
            .collect();
    },
});

// Get low stock materials
export const getLowStockMaterials = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const materials = await ctx.db.query("materials").collect();
        return materials.filter(m => m.currentStock <= m.minStock);
    },
});

// Add new material
export const addMaterial = mutation({
    args: {
        name: v.string(),
        nameAr: v.optional(v.string()),
        unit: v.string(),
        category: v.string(),
        currentStock: v.number(),
        minStock: v.number(),
        unitPrice: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        return await ctx.db.insert("materials", {
            ...args,
            lastUpdated: Date.now(),
            updatedBy: userId,
        });
    },
});

// Update material stock
export const updateStock = mutation({
    args: {
        materialId: v.id("materials"),
        type: v.union(v.literal("IN"), v.literal("OUT"), v.literal("ADJUSTMENT")),
        quantity: v.number(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const material = await ctx.db.get(args.materialId);
        if (!material) throw new Error("Material not found");

        let newStock = material.currentStock;
        if (args.type === "IN") {
            newStock += args.quantity;
        } else if (args.type === "OUT") {
            newStock -= args.quantity;
            if (newStock < 0) throw new Error("Insufficient stock");
        } else {
            newStock = args.quantity;
        }

        // Update material
        await ctx.db.patch(args.materialId, {
            currentStock: newStock,
            lastUpdated: Date.now(),
            updatedBy: userId,
        });

        // Record movement
        await ctx.db.insert("stockMovements", {
            materialId: args.materialId,
            type: args.type,
            quantity: args.quantity,
            previousStock: material.currentStock,
            newStock,
            notes: args.notes,
            createdAt: Date.now(),
            createdBy: userId,
        });

        return { success: true, newStock };
    },
});

// Create material request
export const createMaterialRequest = mutation({
    args: {
        projectId: v.id("projects"),
        unitId: v.optional(v.id("units")),
        items: v.array(v.object({
            materialId: v.id("materials"),
            quantity: v.number(),
        })),
        priority: v.union(
            v.literal("LOW"),
            v.literal("NORMAL"),
            v.literal("HIGH"),
            v.literal("URGENT")
        ),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Get user name
        const engineer = await ctx.db
            .query("engineers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("_id"), userId))
            .first();

        const requestedByName = engineer?.name || user?.name || user?.email?.split("@")[0] || "Unknown";

        // Build items with material names
        const itemsWithNames = await Promise.all(
            args.items.map(async (item) => {
                const material = await ctx.db.get(item.materialId);
                if (!material) throw new Error(`Material ${item.materialId} not found`);
                return {
                    materialId: item.materialId,
                    materialName: material.name,
                    quantity: item.quantity,
                    unit: material.unit,
                };
            })
        );

        return await ctx.db.insert("materialRequests", {
            projectId: args.projectId,
            unitId: args.unitId,
            requestedBy: userId,
            requestedByName,
            items: itemsWithNames,
            status: "PENDING",
            priority: args.priority,
            notes: args.notes,
            createdAt: Date.now(),
        });
    },
});

// Get material requests
export const getMaterialRequests = query({
    args: {
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        let requests;
        if (args.status) {
            requests = await ctx.db
                .query("materialRequests")
                .withIndex("by_status", (q) => q.eq("status", args.status))
                .collect();
        } else {
            requests = await ctx.db.query("materialRequests").collect();
        }

        // Enrich with project names
        const enrichedRequests = await Promise.all(
            requests.map(async (req) => {
                const project = await ctx.db.get(req.projectId);
                const unit = req.unitId ? await ctx.db.get(req.unitId) : null;
                return {
                    ...req,
                    projectName: project?.name || "Unknown Project",
                    unitName: unit?.name || null,
                };
            })
        );

        return enrichedRequests.sort((a, b) => b.createdAt - a.createdAt);
    },
});

// Get my material requests
export const getMyMaterialRequests = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const requests = await ctx.db
            .query("materialRequests")
            .withIndex("by_requester", (q) => q.eq("requestedBy", userId))
            .collect();

        const enrichedRequests = await Promise.all(
            requests.map(async (req) => {
                const project = await ctx.db.get(req.projectId);
                const unit = req.unitId ? await ctx.db.get(req.unitId) : null;
                return {
                    ...req,
                    projectName: project?.name || "Unknown Project",
                    unitName: unit?.name || null,
                };
            })
        );

        return enrichedRequests.sort((a, b) => b.createdAt - a.createdAt);
    },
});

// Approve material request
export const approveMaterialRequest = mutation({
    args: {
        requestId: v.id("materialRequests"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");
        if (request.status !== "PENDING") throw new Error("Request already processed");

        await ctx.db.patch(args.requestId, {
            status: "APPROVED",
            approvedAt: Date.now(),
            approvedBy: userId,
        });

        return { success: true };
    },
});

// Reject material request
export const rejectMaterialRequest = mutation({
    args: {
        requestId: v.id("materialRequests"),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");
        if (request.status !== "PENDING") throw new Error("Request already processed");

        await ctx.db.patch(args.requestId, {
            status: "REJECTED",
            rejectionReason: args.reason,
            approvedAt: Date.now(),
            approvedBy: userId,
        });

        return { success: true };
    },
});

// Mark as delivered (and deduct from stock)
export const deliverMaterialRequest = mutation({
    args: {
        requestId: v.id("materialRequests"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");
        if (request.status !== "APPROVED") throw new Error("Request must be approved first");

        // Deduct stock for each item
        for (const item of request.items) {
            const material = await ctx.db.get(item.materialId);
            if (!material) continue;

            const newStock = material.currentStock - item.quantity;
            if (newStock < 0) {
                throw new Error(`Insufficient stock for ${item.materialName}`);
            }

            // Update material
            await ctx.db.patch(item.materialId, {
                currentStock: newStock,
                lastUpdated: Date.now(),
                updatedBy: userId,
            });

            // Record movement
            await ctx.db.insert("stockMovements", {
                materialId: item.materialId,
                type: "OUT",
                quantity: item.quantity,
                previousStock: material.currentStock,
                newStock,
                relatedRequestId: args.requestId,
                notes: `Material request delivery`,
                createdAt: Date.now(),
                createdBy: userId,
            });
        }

        // Update request status
        await ctx.db.patch(args.requestId, {
            status: "DELIVERED",
            deliveredAt: Date.now(),
            deliveredBy: userId,
        });

        return { success: true };
    },
});

// Get stock movements for a material
export const getStockMovements = query({
    args: {
        materialId: v.id("materials"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("stockMovements")
            .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
            .collect();
    },
});

// Stock stats for dashboard
export const getStockStats = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const materials = await ctx.db.query("materials").collect();
        const requests = await ctx.db.query("materialRequests").collect();

        const pendingRequests = requests.filter(r => r.status === "PENDING").length;
        const approvedRequests = requests.filter(r => r.status === "APPROVED").length;
        const lowStockItems = materials.filter(m => m.currentStock <= m.minStock).length;
        const totalValue = materials.reduce((sum, m) => sum + (m.currentStock * m.unitPrice), 0);

        return {
            totalMaterials: materials.length,
            pendingRequests,
            approvedRequests,
            lowStockItems,
            totalValue,
        };
    },
});
