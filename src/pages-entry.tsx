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

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  });
}
