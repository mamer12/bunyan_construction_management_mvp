---
description: Create a UI component (primitive)
---

# Add Component Workflow

To create reusable visual building blocks:

1. **Scope Component boundaries**:
   - Place in `src/components/ui/`.
   - Maintain isolated state where appropriate, avoiding deep cascading impacts on views.

2. **Template with standard interfaces**:
   - Declare TypeScript structures with clean primitives.
   - Use absolute Tailwind assignments leveraging dynamic rendering templates with `cn()`.

3. **Compose responsive fallback trees**:
   - Incorporate animations with Framer Motion (`framer-motion`).
   - Guard against empty or broken inputs proactively.
