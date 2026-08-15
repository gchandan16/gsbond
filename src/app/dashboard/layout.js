// app/dashboard/layout.js
"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const sidebarRef = useRef();
  const [permissions, setPermissions] = useState({});

  // ✅ Hydration fix
  const [mounted, setMounted] = useState(false);

  const handleMenuToggle = () => {
    sidebarRef.current?.toggleMobile();
  };

  useEffect(() => {
    // Check if user is authenticated (example with localStorage token)
    const token = localStorage.getItem("authToken");
    if (!token) {
      // router.replace("/login"); // redirect to login page
    }
    try {
      const stored = localStorage.getItem("permissions");
      setPermissions(stored ? JSON.parse(stored) : {});
    } catch {
      setPermissions({});
    }
  }, [router]);

  // ✅ Flutter push notification handler

  useEffect(() => {
    const handler = (event) => {
      const data = event.detail;
      console.log("📲 Flutter push received:", data);

      // if (data.type === "order") {
      //   router.push(/orders/${ data.orderId });
      // }
    };

    window.addEventListener("flutterPush", handler);

    return () => {
      window.removeEventListener("flutterPush", handler);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>

      <Sidebar ref={sidebarRef} permissions={permissions} />

      <div className="d-flex flex-column flex-grow-1" style={{ height: "100vh", overflow: "hidden" }}>

        <Header onMenuToggle={handleMenuToggle} />

        <main className="flex-grow-1" style={{ overflowY: "auto" }}>
          {children}
        </main>

        <Footer />
      </div>

    </div>
  );
}