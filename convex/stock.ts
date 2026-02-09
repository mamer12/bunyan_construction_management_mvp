import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./lib/auth";
import { materialRequestStatus } from "./lib/validators";

// === QUERIES ===

export const getInventory = query({
    args: {},
    handler: async (ctx) => {
        await requireAuth(ctx);
        return await ctx.db.query("materials").collect();
    },
});

export const getMaterialRequests = query({
    args: {
        status: v.optional(materialRequestStatus),
    },
    handler: async (ctx, args) => {
        await requireAuth(ctx);

        if (args.status) {
            return await ctx.db
                .query("material_requests")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .collect();
        }

        return await ctx.db.query("material_requests").collect();
    },
});

// === MUTATIONS ===

export const requestMaterial = mutation({
    args: {
        projectId: v.id("projects"),
        unitId: v.optional(v.id("units")),
        items: v.array(v.object({
            materialId: v.id("materials"),
            quantity: v.number(),
        })),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await requireAuth(ctx);

        await ctx.db.insert("material_requests", {
            projectId: args.projectId,
            unitId: args.unitId,
            requestedBy: userId,
            status: "PENDING",
            items: args.items,
            notes: args.notes,
            createdAt: Date.now(),
        });
    },
});

export const processRequest = mutation({
    args: {
        requestId: v.id("material_requests"),
        action: v.union(
            v.literal("APPROVE"),
            v.literal("REJECT"),
            v.literal("FULFILL")
        ),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireRole(ctx, ["admin", "stock"]);

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");

        let newStatus: "APPROVED" | "REJECTED" | "FULFILLED" = request.status as "APPROVED" | "REJECTED" | "FULFILLED";

        if (args.action === "APPROVE") {
            newStatus = "APPROVED";
        } else if (args.action === "REJECT") {
            newStatus = "REJECTED";
        } else if (args.action === "FULFILL") {
            newStatus = "FULFILLED";
            for (const item of request.items) {
                const material = await ctx.db.get(item.materialId);
                if (material) {
                    const newStock = Math.max(0, material.currentStock - item.quantity);
                    await ctx.db.patch(item.materialId, {
                        currentStock: newStock,
                        lastUpdated: Date.now(),
                    });
                }
            }
        }

        const userId = await requireAuth(ctx);
        await ctx.db.patch(args.requestId, {
            status: newStatus,
            handledBy: userId,
            handledAt: Date.now(),
            notes: args.notes || request.notes,
        });
    },
});

// === MATERIAL CRUD ===

export const addMaterial = mutation({
    args: {
        name: v.string(),
        unit: v.string(),
        currentStock: v.number(),
        minimumStock: v.optional(v.number()),
        pricePerUnit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireRole(ctx, ["admin", "stock"]);

        const existing = await ctx.db
            .query("materials")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();

        if (existing) {
            throw new Error("Material with this name already exists");
        }

        return await ctx.db.insert("materials", {
            name: args.name,
            unit: args.unit,
            currentStock: args.currentStock,
            minimumStock: args.minimumStock,
            pricePerUnit: args.pricePerUnit,
            lastUpdated: Date.now(),
        });
    },
});

export const updateMaterial = mutation({
    args: {
        materialId: v.id("materials"),
        name: v.optional(v.string()),
        unit: v.optional(v.string()),
        currentStock: v.optional(v.number()),
        minimumStock: v.optional(v.number()),
        pricePerUnit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireRole(ctx, ["admin", "stock"]);

        const material = await ctx.db.get(args.materialId);
        if (!material) throw new Error("Material not found");

        const updates: {
            lastUpdated: number;
            name?: string;
            unit?: string;
            currentStock?: number;
            minimumStock?: number;
            pricePerUnit?: number;
        } = { lastUpdated: Date.now() };

        if (args.name !== undefined) updates.name = args.name;
        if (args.unit !== undefined) updates.unit = args.unit;
        if (args.currentStock !== undefined) updates.currentStock = args.currentStock;
        if (args.minimumStock !== undefined) updates.minimumStock = args.minimumStock;
        if (args.pricePerUnit !== undefined) updates.pricePerUnit = args.pricePerUnit;

        await ctx.db.patch(args.materialId, updates);
    },
});

export const deleteMaterial = mutation({
    args: {
        materialId: v.id("materials"),
    },
    handler: async (ctx, args) => {
        await requireRole(ctx, ["admin", "stock"]);

        const material = await ctx.db.get(args.materialId);
        if (!material) throw new Error("Material not found");

        const pendingRequests = await ctx.db
            .query("material_requests")
            .withIndex("by_status", (q) => q.eq("status", "PENDING"))
            .collect();

        const isReferenced = pendingRequests.some((req) =>
            req.items.some((item) => item.materialId === args.materialId)
        );

        if (isReferenced) {
            throw new Error("Cannot delete material with pending requests");
        }

        await ctx.db.delete(args.materialId);
    },
});

export const adjustStock = mutation({
    args: {
        materialId: v.id("materials"),
        adjustment: v.number(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireRole(ctx, ["admin", "stock"]);

        const material = await ctx.db.get(args.materialId);
        if (!material) throw new Error("Material not found");

        const newStock = Math.max(0, material.currentStock + args.adjustment);

        await ctx.db.patch(args.materialId, {
            currentStock: newStock,
            lastUpdated: Date.now(),
        });
    },
});

// === STOCK STATS ===

export const getStockStats = query({
    args: {},
    handler: async (ctx) => {
        await requireAuth(ctx);

        const materials = await ctx.db.query("materials").collect();
        const requests = await ctx.db.query("material_requests").collect();

        const lowStockItems = materials.filter(
            (m) => m.minimumStock && m.currentStock <= m.minimumStock
        );

        const pendingRequests = requests.filter((r) => r.status === "PENDING");
        const fulfilledRequests = requests.filter((r) => r.status === "FULFILLED");

        const totalValue = materials.reduce(
            (sum, m) => sum + (m.currentStock * (m.pricePerUnit || 0)),
            0
        );

        return {
            totalMaterials: materials.length,
            lowStockCount: lowStockItems.length,
            lowStockItems,
            pendingRequestsCount: pendingRequests.length,
            fulfilledRequestsCount: fulfilledRequests.length,
            totalInventoryValue: totalValue,
        };
    },
});
