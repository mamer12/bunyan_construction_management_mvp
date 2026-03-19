---
description: Create a Dashboard View submodule or Dashboard Wrapper
---

# Add View Workflow

To add a new Dashboard view or feature view for a specific module:

1. **Setup File Boundaries**:
   - Component filename should match PascalCase representation (e.g., `MaintenanceView.tsx`).
   - Create a corresponding folder (`src/components/Maintenance/`) if the view expects more than 1 auxiliary element.

2. **Connect Data Requirements**:
   - Query corresponding table/context with `useQuery`.
   - Setup fallback loading components using `motion.div` skeletons or clean spinners.

3. **Incorporate into Routing/Layouts**:
   - Link the item element in the `Sidebar.tsx` file for specific roles mapped using `RoleAccess`.
   - Render it inside the workspace layout of `App.tsx` or dashboards.

4. **Verify Design System**:
   - Verify layout spacing is using proper RTL friendly grids (`md:grid-cols-2`, `gap-x-4`).
