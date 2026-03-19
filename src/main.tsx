import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { MockDataProvider } from "./mocks/MockDataContext";

// Bypassing Convex for now - using mock data
createRoot(document.getElementById("root")!).render(
  <MockDataProvider>
    <App />
  </MockDataProvider>,
);
