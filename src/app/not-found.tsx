import type { Metadata } from "next";
import NotFoundPage from "@/components/not-found/NotFoundPage";

export const metadata: Metadata = {
  title: "VisualKit: Page not found",
};

export default function NotFound() {
  return <NotFoundPage />;
}
