import { createFileRoute } from "@tanstack/react-router";
import { WardrobeApp } from "@/components/wardrobe/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <WardrobeApp />;
}
