import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applyAppearance, loadAppearance, resolveAppearance } from "./app/appearance";

// Vor dem ersten Zeichnen, sonst blitzt kurz die falsche Darstellung auf.
applyAppearance(resolveAppearance(loadAppearance()));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
