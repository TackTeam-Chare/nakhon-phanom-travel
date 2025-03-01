"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";


const Chatbot = dynamic(() => import("@/components/Chatbot/Chatbot"), {
  ssr: false, // Ensure this component is client-side only
});

// Import Layout normally
import Layout from "@/components/layout";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const showChatbot = false;
  // Check if the current path is under the dashboard
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      {isDashboard ? children : <Layout>{children}</Layout>}

      {showChatbot && !isDashboard && <Chatbot />}
    </>
  );
}
