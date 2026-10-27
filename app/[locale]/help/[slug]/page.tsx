import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { helpRobots } from "@/lib/help/config";

// No article pages exist yet: every slug answers 404.
export function generateStaticParams() {
  return [];
}

export function generateMetadata(): Metadata {
  return { robots: helpRobots() };
}

export default function HelpArticlePage() {
  notFound();
}
