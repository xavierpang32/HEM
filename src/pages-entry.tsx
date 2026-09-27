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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.getRegistrations().then(async (regs) => {
      await Promise.all(
        regs
          .filter((reg) => !reg.active?.scriptURL.endsWith("/service-worker.js"))
          .map((reg) => reg.unregister()),
      );
      await navigator.serviceWorker.register("/HEM/app/service-worker.js").catch(() => undefined);
    });
  });
}
