// ============================================
// TIME DURATIONS (in milliseconds)
// ============================================

/** 24-hour reservation hold for units */
export const RESERVATION_DURATION_MS = 24 * 60 * 60 * 1000;

/** 7-day grace period after milestone completion */
export const MILESTONE_GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

/** 30-day interval between installments */
export const INSTALLMENT_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

/** One year placeholder for construction-linked installments */
export const FAR_FUTURE_PLACEHOLDER_MS = 365 * 24 * 60 * 60 * 1000;

/** 30 days window for "recent" stats */
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// ============================================
// LIMITS
// ============================================

/** Maximum notifications kept in local state */
export const MAX_LOCAL_NOTIFICATIONS = 50;

/** Default pagination page size */
export const DEFAULT_PAGE_SIZE = 25;

// ============================================
// VALID ROLES (for runtime validation)
// ============================================

export const VALID_SYSTEM_ROLES = [
    "admin",
    "acting_manager",
    "lead",
    "engineer",
    "finance",
    "stock",
    "sales_agent",
    "broker",
    "guest",
] as const;

export type SystemRole = (typeof VALID_SYSTEM_ROLES)[number];

// ============================================
// MANAGEMENT ROLES (can edit tasks, manage teams)
// ============================================

export const MANAGEMENT_ROLES: SystemRole[] = ["admin", "acting_manager", "lead"];
