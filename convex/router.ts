import { httpRouter } from "convex/server";

const http = httpRouter();

// Note: Convex HTTP routes work differently from Express
// For PDF generation and public portal, we'll handle these via direct query calls
// from the frontend rather than HTTP endpoints, as Convex queries are more efficient

export default http;
