// app/dashboard/page.jsx  (Server Component — no "use client")
import { cookies } from "next/headers";
import Link from "next/link";

// ── Data fetching ────────────────────────────────────────────────────────────
async function getQuotes() {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/quote`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
    });

    // console.log(res)

    if (!res.ok) return [];

    const raw = await res.json();

    return raw.data.map((user) => ({
        id: user?.id,
        clientName: user?.name,
        email: user?.email,
        mobile: user?.phone,
        address: user?.address,
        zip: user?.zip,
        services: user?.services,
        calculatedAmount: parseFloat(user?.calculatedAmount),
        quotedAmount: parseFloat(user?.quotatedAmount),
        status: user?.status,
        jobStatus: user?.jobStatus,
        createdAt: new Date(user?.createdAt).toLocaleDateString("en-AU"),
        scheduledDate: user?.scheduledDate || "",
        assignerName: user?.quoteAssign?.[0]?.user?.name || "",
        assignerEmail: user?.quoteAssign?.[0]?.user?.email || "",
    }));
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function statusBadge(status) {
    const map = {
        approved: "badge bg-success bg-opacity-10 text-success",
        pending: "badge bg-warning bg-opacity-10 text-warning",
        rejected: "badge bg-danger  bg-opacity-10 text-danger",
        "partial-pending": "badge bg-danger  bg-opacity-10 text-danger",
    };
    const key = status?.toLowerCase();
    return <span className={map[key] || map.pending}>{status}</span>;
}

async function deriveStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboard`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) { };

    const raw = await res.json();
    // console.log("raw", raw)
    const upcoming = raw.data?.upcoming || "0";
    const pending = raw.data?.todayPending || "0";
    const complted = raw.data?.todayComplete || "0";
    const monthlyScheduled = raw.data?.monthlyScheduled || "0";
    return [
        {
            label: "Upcoming Jobs",
            value: String(upcoming),
            iconBg: "bg-primary bg-opacity-10 text-primary",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            ),
            link: "/dashboard/quote/assigned-jobs"
        },
        {
            label: "Today`s Pending Job",
            value: String(pending),
            iconBg: "bg-success bg-opacity-10 text-success",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ),
            link: "/dashboard/quote/jobs"
        },
        {
            label: "Today`s Completed Job",
            value: String(complted),
            iconBg: "bg-warning bg-opacity-10 text-warning",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            link: "/dashboard/quote/jobs"
        },
        {
            label: "Monthly Scheduled Jobs",
            value: String(monthlyScheduled),
            iconBg: "bg-info bg-opacity-10 text-info",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
            ),
            link: "/dashboard"
        },
    ];
}

function deriveTopServices(quotes) {
    const counts = {};
    quotes.forEach((q) => {
        (q.services || []).forEach((s) => {
            const name = s.name || s.serviceName || "Other";
            counts[name] = (counts[name] || 0) + 1;
        });
    });

    const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    const max = sorted[0]?.[1] || 1;

    return sorted.map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / max) * 100),
    }));
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {

    const cookieStore = await cookies();
    const role = JSON.parse(cookieStore.get("role")?.value);


    const quotes = await getQuotes();
    const stats = await deriveStats();
    // console.log("stats",stats);
    const services = deriveTopServices(quotes);

    const recentQuotes = quotes.slice(0, 5); // latest 5
    const today = new Date().toLocaleDateString("en-AU", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    return (
        <div className="p-4" style={{ background: "#f0f7ff", minHeight: "100%" }}>

            {/* Page title */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h5 className="fw-bold text-dark mb-1" style={{ fontSize: 18 }}>Dashboard Overview</h5>
                    <p className="text-secondary mb-0" style={{ fontSize: 13 }}>{today}</p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="row g-3 mb-4">
                {stats.map((s) => (
                    <div className="col-6 col-md-3" key={s.label}>
                        <Link href={s.link || "#"} className="text-decoration-none">
                            <div className="card border-primary-subtle shadow-sm h-100 hover-shadow">
                                <div className="card-body p-3">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div
                                            className={`rounded-2 d-flex align-items-center justify-content-center ${s.iconBg}`}
                                            style={{ width: 40, height: 40 }}
                                        >
                                            {s.icon}
                                        </div>
                                    </div>

                                    <div className="fw-bold text-dark" style={{ fontSize: 26 }}>
                                        {s.value}
                                    </div>
                                    <div className="text-secondary" style={{ fontSize: 12 }}>
                                        {s.label}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Table + Side */}
            {role == "admin" && (<div className="row g-3">

                {/* Recent Quotes */}
                <div className="col-12 col-lg-8">
                    <div className="card border-primary-subtle shadow-sm">
                        <div className="card-header bg-white border-primary-subtle d-flex align-items-center justify-content-between py-3">
                            <span className="fw-semibold text-dark" style={{ fontSize: 14 }}>Recent Quotes</span>
                            <a href="/dashboard/quote/all-quotes" className="text-primary text-decoration-none" style={{ fontSize: 12 }}>
                                View all →
                            </a>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th className="text-secondary fw-semibold border-0 ps-4" style={{ fontSize: 11 }}>QUOTE ID</th>
                                            <th className="text-secondary fw-semibold border-0" style={{ fontSize: 11 }}>CLIENT</th>
                                            {/* <th className="text-secondary fw-semibold border-0" style={{ fontSize: 11 }}>AMOUNT</th> */}
                                            <th className="text-secondary fw-semibold border-0" style={{ fontSize: 11 }}>STATUS</th>
                                            <th className="text-secondary fw-semibold border-0" style={{ fontSize: 11 }}>DATE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentQuotes.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center text-secondary py-4">
                                                    No quotes found
                                                </td>
                                            </tr>
                                        ) : recentQuotes.map((q) => (
                                            <tr key={q.id}>
                                                <td className="ps-4 text-primary fw-semibold">#{q.id}</td>
                                                <td className="fw-medium text-dark">{q.clientName}</td>

                                                <td>{statusBadge(q.status)}</td>
                                                <td className="text-secondary" style={{ fontSize: 12 }}>{q.createdAt}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="col-12 col-lg-4 d-flex flex-column gap-3">

                    {/* Top Services */}
                    <div className="card border-primary-subtle shadow-sm">
                        <div className="card-header bg-white border-primary-subtle py-3">
                            <span className="fw-semibold text-dark" style={{ fontSize: 14 }}>Top Services</span>
                        </div>
                        <div className="card-body d-flex flex-column gap-3">
                            {services.length === 0 ? (
                                <p className="text-secondary mb-0" style={{ fontSize: 13 }}>No service data yet</p>
                            ) : services.map((s) => (
                                <div key={s.name}>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-dark" style={{ fontSize: 13 }}>{s.name}</span>
                                        <span className="text-secondary" style={{ fontSize: 12 }}>{s.count} jobs</span>
                                    </div>
                                    <div className="progress" style={{ height: 5 }}>
                                        <div className="progress-bar bg-primary" style={{ width: `${s.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Assigned Quotes summary */}
                    {/* <div className="card border-primary-subtle shadow-sm">
                        <div className="card-header bg-white border-primary-subtle py-3">
                            <span className="fw-semibold text-dark" style={{ fontSize: 14 }}>Assigned Quotes</span>
                        </div>
                        <div className="card-body d-flex flex-column gap-3">
                            {quotes.filter((q) => q.assignerName).slice(0, 4).length === 0 ? (
                                <p className="text-secondary mb-0" style={{ fontSize: 13 }}>No assigned quotes</p>
                            ) : quotes.filter((q) => q.assignerName).slice(0, 4).map((q) => (
                                <div key={q.id} className="d-flex align-items-start gap-3">
                                    <span className="rounded-circle flex-shrink-0 mt-1 bg-primary"
                                        style={{ width: 8, height: 8, display: "inline-block" }} />
                                    <div>
                                        <div className="text-dark fw-medium" style={{ fontSize: 12, lineHeight: 1.4 }}>
                                            #{q.id} — {q.clientName}
                                        </div>
                                        <div className="text-secondary" style={{ fontSize: 11, marginTop: 2 }}>
                                            Assigned to {q.assignerName}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}

                </div>
            </div>)}
        </div>
    );
}