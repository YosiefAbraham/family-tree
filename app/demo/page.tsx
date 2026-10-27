import type { Metadata } from "next";
import { DemoTree } from "@/components/DemoTree";

export const metadata: Metadata = {
  title: "Sample tree",
  description:
    "Look around a fictional Dynasty family tree. Click people and connections — nothing is saved.",
};

export default function DemoPage() {
  return <DemoTree />;
}
