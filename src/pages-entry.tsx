import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WardrobeApp } from "@/components/wardrobe/app";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <WardrobeApp />
    </StrictMode>,
  );
}
