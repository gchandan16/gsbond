"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CHILD_PERM_MAP = {
    "/dashboard/user": { module: "user", action: "view" },
    "/dashboard/rights": { module: "permissions", action: "view" },
    "/dashboard/quote/create": { module: "quote", action: "create" },
    "/dashboard/quote/all-quotes": { module: "quote", action: "view" },
    "/dashboard/quote/call-scheduled": { module: "quote", action: "view" },
    "/dashboard/client": { module: "quote", action: "view" },
    "/dashboard/quote/invoice": { module: "quote", action: "view" },
    "/dashboard/quote/all-jobs": { module: "quote", action: "view" },
    "/dashboard/quote/pending-jobs": { module: "quote", action: "view" },
    "/dashboard/quote/reclean-jobs": { module: "quote", action: "view" },
    "/dashboard/quote/jobs": { module: "assignedQuote", action: "view" },
    "/dashboard/quote/completed-jobs": { module: "assignedQuote", action: "view" },
    "/dashboard/quote/rejected-jobs": { module: "assignedQuote", action: "view" },
    "/dashboard/services/category/create": { module: "category", action: "create" },
    "/dashboard/services/category/all-category": { module: "category", action: "view" },
    "/dashboard/services/service/create": { module: "products", action: "create" },
    "/dashboard/services/service/all-service": { module: "products", action: "view" },
     "/dashboard/leads/externalleads": { module: "leads",action: "view"}
   
};

const menuItems = [
    {
        id: "admin",
        label: "Admin",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        children: [
            { label: "User", href: "/dashboard/user" },
            { label: "Rights", href: "/dashboard/rights" },
            { label: "Clients", href: "/dashboard/client" },
        ],
    },
    {
        id: "quote",
        label: "Manage Quotes",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        children: [
            { label: "Create Quote", href: "/dashboard/quote/create" },
            { label: "All Quotes", href: "/dashboard/quote/all-quotes" },
            { label: "Scheduled Calls", href: "/dashboard/quote/call-scheduled" },
        ],
    },
    {
        id: "invoice",
        label: "Manage Invoicing",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M14 2H7a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2V8z" />
                <polyline points="14 2 14 8 20 8" />

                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="15" x2="13" y2="15" />

                <path d="M8 9h6M8 9c2 0 3 1 3 2s-1 2-3 2h3" />
            </svg>
        ),
        children: [
            { label: "Invoices", href: "/dashboard/quote/invoice" },
        ],
    },
    {
        id: "assignedQuote",
        label: "Manage Jobs",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
        ),
        children: [
            { label: "All Jobs", href: "/dashboard/quote/all-jobs" }, // for admin
            { label: "Pending Jobs", href: "/dashboard/quote/pending-jobs" }, // for admin
            { label: "Reclean Jobs", href: "/dashboard/quote/reclean-jobs" }, // for admin
            { label: "Jobs In Queue", href: "/dashboard/quote/assigned-jobs" }, // for operator and admin
            { label: "My Jobs", href: "/dashboard/quote/jobs" }, // for operator and admin
            { label: "Declined Jobs", href: "/dashboard/quote/rejected-jobs" }, // for operator and admin
            { label: "Completed Jobs", href: "/dashboard/quote/completed-jobs" }, // for operator and admin
        ],
    },
    {
        id: "services",
        label: "Manage Services",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93A10 10 0 0 1 21 12" /><path d="M4.93 4.93A10 10 0 0 0 3 12a9 9 0 0 0 9 9" />
            </svg>
        ),
        children: [
            { label: "Create Category", href: "/dashboard/services/category/create" },
            { label: "View Category", href: "/dashboard/services/category/all-category" },
            { label: "Add Services", href: "/dashboard/services/service/create" },
            { label: "View Services", href: "/dashboard/services/service/all-service" },
        ],
    },

       {
        id: "leads",
        label: "Web Site Leads",
        icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93A10 10 0 0 1 21 12" /><path d="M4.93 4.93A10 10 0 0 0 3 12a9 9 0 0 0 9 9" />
            </svg>
        ),
        children: [
          
            { label: "External Leads ", href: "/dashboard/leads/externalleads" },
        ],
    },
];

const Sidebar = forwardRef((props, ref) => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [openSections, setOpenSections] = useState({ admin: true });
    const [visibleMenuItems, setVisibleMenuItems] = useState([]);
    const [user, setUser] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Expose toggle method to parent
    useImperativeHandle(ref, () => ({
        toggleMobile: () => {
            if (isMobile) {
                setMobileOpen(prev => !prev);
            }
        }
    }));

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("permissions");
            const usr = JSON.parse(localStorage.getItem("user"));
            setUser(usr);
            const permissions = stored ? JSON.parse(stored) : {};

            const filtered = menuItems
                .map((item) => ({
                    ...item,
                    children: item.children.filter((child) => {
                        const perm = CHILD_PERM_MAP[child.href];
                        if (!perm) return true;
                        return permissions?.[perm.module]?.[perm.action] === true;
                    }),
                }))
                .filter((item) => item.children.length > 0);

            setVisibleMenuItems(filtered);
        } catch {
            setVisibleMenuItems(menuItems);
        }
    }, []);

    // Accordion behavior - only one section open at a time
    const toggleSection = (id) => {
        if (collapsed) return;
        setOpenSections((prev) => {
            // Close all sections and open only the clicked one
            const newState = {};
            Object.keys(prev).forEach(key => {
                newState[key] = false;
            });
            // Toggle the clicked section
            newState[id] = !prev[id];
            return newState;
        });
    };

    const handleDesktopToggle = () => {
        if (!isMobile) {
            setCollapsed(!collapsed);
        }
    };

    const closeMobileMenu = () => {
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && mobileOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1040 }}
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <div
                className="d-flex flex-column bg-primary text-white border-end border-white border-opacity-25 shadow-sm flex-shrink-0"
                style={{
                    width: isMobile ? 280 : (collapsed ? 80 : 230),
                    height: "100vh",
                    transition: "transform 0.3s ease, width 0.3s ease",
                    overflow: "hidden",
                    position: isMobile ? "fixed" : "relative",
                    top: 0,
                    left: 0,
                    zIndex: 1050,
                    transform: isMobile ? (mobileOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)"
                }}
            >
                {/* Logo + Toggle */}
                <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom border-white border-opacity-25 flex-shrink-0">
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-white text-primary rounded-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                            style={{ width: 36, height: 36, fontSize: 13 }}>
                            <img src="/ic_launcher_logo.png" alt="GS Bond Cleaning Logo" height="36" style={{ "borderRadius": "5px" }} />

                        </div>
                        {!collapsed && (
                            <span className="fw-semibold text-white text-nowrap" style={{ fontSize: 18 }}>GSBC CRM</span>
                        )}
                    </div>
                    {/* Desktop collapse button only */}
                    {!isMobile && (
                        <button
                            className="btn btn-sm btn-outline-light border-opacity-25 p-0 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 28, height: 28 }}
                            onClick={handleDesktopToggle}
                            title={collapsed ? "Expand" : "Collapse"}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}
                </div>



                {/* Nav - Scrollable area */}
                <div
                    className="flex-grow-1 overflow-auto"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(255,255,255,0.3) transparent'
                    }}
                >
                    <ul className="nav flex-column px-2 py-3 gap-1 mb-0">
                        {visibleMenuItems.map((section) => (
                            <li className="nav-item" key={section.id}>
                                {/* Section header */}
                                <div
                                    className="d-flex align-items-center gap-2 px-2 py-2 rounded-2 text-white text-nowrap"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => toggleSection(section.id)}
                                    title={collapsed ? section.label : undefined}>
                                    <span className="text-white opacity-75 flex-shrink-0">{section.icon}</span>
                                    {!collapsed && (
                                        <>
                                            <span className="fw-semibold flex-grow-1 text-white" style={{ fontSize: 16 }}>{section.label}</span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                                className="opacity-50 flex-shrink-0"
                                                style={{ transform: openSections[section.id] ? "rotate(90deg)" : "none", transition: "transform 0.25s" }}>
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </>
                                    )}
                                </div>

                                {/* Submenu */}
                                {!collapsed && openSections[section.id] && (
                                    <ul className="nav flex-column ms-3 mt-1 gap-1">
                                        {section.children.map((child) => {
                                            const isActive = pathname === child.href;
                                            return (
                                                <li className="nav-item" key={child.label}>
                                                    <Link
                                                        href={child.href}
                                                        className={`nav-link d-flex align-items-center gap-2 rounded-2 py-1 px-2 text-nowrap text-decoration-none ${isActive ? "bg-white text-primary fw-semibold" : "text-white opacity-75"
                                                            }`}
                                                        style={{ fontSize: 16 }}
                                                        onClick={closeMobileMenu}
                                                    >
                                                        <span
                                                            className={`rounded-circle flex-shrink-0 ${isActive ? "bg-primary" : "bg-white opacity-50"}`}
                                                            style={{ width: 5, height: 5, display: "inline-block" }}
                                                        />
                                                        {child.label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="d-flex align-items-center gap-2 px-3 py-3 border-top border-white border-opacity-25 flex-shrink-0">
                    <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{ width: 32, height: 32, fontSize: 12 }}>A</div>
                    {!collapsed && (
                        <div className="lh-sm overflow-hidden">
                            <div className="fw-semibold text-white text-nowrap" style={{ fontSize: 13 }}>{user?.role == "operator" ? "Cleaner":"Admin"}</div>
                            <div className="text-white opacity-50 text-nowrap" style={{ fontSize: 11 }}>{user?.email}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom scrollbar styling */}
            <style jsx global>{`
                /* Webkit browsers (Chrome, Safari) */
                .overflow-auto::-webkit-scrollbar {
                    width: 6px;
                }
                .overflow-auto::-webkit-scrollbar-track {
                    background: transparent;
                }
                .overflow-auto::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                   borderRadius: 3px;
                }
                .overflow-auto::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;