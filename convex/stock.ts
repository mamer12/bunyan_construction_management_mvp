import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// === QUERIES ===

export const getInventory = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // In real app, check permission (Admin, Stock, Lead, Engineer can view)
        return await ctx.db.query("materials").collect();
    },
});

export const getMaterialRequests = query({
    args: {
        status: v.optional(v.string()), // "PENDING", etc.
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // TODO: Filter based on role (Engineer sees own, Stock sees all)
        const q = ctx.db.query("material_requests");

        if (args.status) {
            const status = args.status;
            return await q.withIndex("by_status", (q) => q.eq("status", status)).collect();
        }

        return await q.collect();
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
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

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
        action: v.string(), // "APPROVE", "REJECT", "FULFILL"
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");

        // TODO: Verify user role is Stock Manager or Admin

        let newStatus = request.status;

        if (args.action === "APPROVE") newStatus = "APPROVED";
        else if (args.action === "REJECT") newStatus = "REJECTED";
        else if (args.action === "FULFILL") {
            newStatus = "FULFILLED";
            // Deduct from inventory
            for (const item of request.items) {
                const material = await ctx.db.get(item.materialId);
                if (material) {
                    const newStock = Math.max(0, material.currentStock - item.quantity);
                    await ctx.db.patch(item.materialId, {
                        currentStock: newStock,
                        lastUpdated: Date.now()
                    });
                }
            }
        }

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
        unit: v.string(), // "kg", "pcs", "bags", "m", "m2", "m3"
        currentStock: v.number(),
        minimumStock: v.optional(v.number()),
        pricePerUnit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // TODO: Verify user role is Stock Manager or Admin

        // Check if material with same name exists
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
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // TODO: Verify user role is Stock Manager or Admin

        const material = await ctx.db.get(args.materialId);
        if (!material) throw new Error("Material not found");

        // Build update object
        const updates: any = { lastUpdated: Date.now() };
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
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // TODO: Verify user role is Stock Manager or Admin

        const material = await ctx.db.get(args.materialId);
        if (!material) throw new Error("Material not found");

        // Check if material is referenced in any pending requests
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
        adjustment: v.number(), // positive to add, negative to remove
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

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
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

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
