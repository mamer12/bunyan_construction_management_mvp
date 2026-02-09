/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as deals from "../deals.js";
import type * as engineers from "../engineers.js";
import type * as http from "../http.js";
import type * as installments from "../installments.js";
import type * as leads from "../leads.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_users from "../lib/users.js";
import type * as lib_validators from "../lib/validators.js";
import type * as notifications from "../notifications.js";
import type * as portal from "../portal.js";
import type * as projects from "../projects.js";
import type * as roles from "../roles.js";
import type * as router from "../router.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as stock from "../stock.js";
import type * as tasks from "../tasks.js";
import type * as unitSales from "../unitSales.js";
import type * as units from "../units.js";
import type * as users from "../users.js";
import type * as wallet from "../wallet.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  audit: typeof audit;
  auth: typeof auth;
  deals: typeof deals;
  engineers: typeof engineers;
  http: typeof http;
  installments: typeof installments;
  leads: typeof leads;
  "lib/auth": typeof lib_auth;
  "lib/constants": typeof lib_constants;
  "lib/users": typeof lib_users;
  "lib/validators": typeof lib_validators;
  notifications: typeof notifications;
  portal: typeof portal;
  projects: typeof projects;
  roles: typeof roles;
  router: typeof router;
  seed: typeof seed;
  settings: typeof settings;
  stock: typeof stock;
  tasks: typeof tasks;
  unitSales: typeof unitSales;
  units: typeof units;
  users: typeof users;
  wallet: typeof wallet;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
