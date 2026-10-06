"use client";
import axios from "axios";
// ✅ CLIENT COMPONENT (CSR)
// Receives `services` and `config` as props from the SSR page.
// All interactivity (add/remove service rows, live totals, form state) lives here.

import { useState, useMemo, useEffect } from "react";

// ── helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n);

function SectionCard({ icon, title, subtitle, children }) {
    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom border-primary border-opacity-25 rounded-top-4 px-4 py-3 d-flex align-items-center gap-3">
                <div
                    className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3 flex-shrink-0"
                    style={{ width: 40, height: 40, fontSize: 18 }}
                >
                    {icon}
                </div>
                <div>
                    <h6 className="mb-0 fw-bold text-dark">{title}</h6>
                    {subtitle && <p className="mb-0 text-secondary small">{subtitle}</p>}
                </div>
            </div>
            <div className="card-body px-4 py-4">{children}</div>
        </div>
    );
}

function FormField({ label, required, children, hint }) {
    return (
        <div className="mb-3">
            <label className="form-label fw-semibold text-dark small mb-1">
                {label}
                {required && <span className="text-danger ms-1">*</span>}
            </label>
            {children}
            {hint && <div className="form-text text-secondary">{hint}</div>}
        </div>
    );
}

// ── main component ───────────────────────────────────────────────────────────
export default function QuoteForm({ services, config, leads }) {


const externalData =leads?.externalData || {};
const customerDetails =externalData.customerDetails || {};
const bondCleaningDetails =externalData.bondCleaningDetails || {};
    // ── Client Info ──
    const [client, setClient] = useState({
            name: customerDetails.name || "",
            email: customerDetails.email || "",
            mobile: customerDetails.phone || "",
            address: bondCleaningDetails.stateRegion || "",
            zip: bondCleaningDetails.postcode || "",
            otherDetails: customerDetails.message || "",
            advanceAmount: "",
            suburbs: bondCleaningDetails.suburb || "",
            quotationType: "",
            cleaningType: "",

    });



    const [downloading, setDownloading] = useState(null);
    const [gstEnabled, setGstEnabled] = useState(true);

    // ── Selected service rows: { serviceId, qty, quotedPrice } ──
    const [rows, setRows] = useState([
        {
            id: Date.now(),
            serviceId: "", qty: 1,
            quotedPrice: "",
            name: "",
            base: "",
            price: "",
            gst: "",
            description: "",
            categoryId: "",
            category: "",
            note: ""
        }]);

    // ── Quote config ──
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState("");
    const [submitted, setSubmitted] = useState(false);



    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        setToken(storedToken);
    }, []);



    // ── Derived totals ───────────────────────────────────────────────────────
    const { lineItems, subtotal, discountAmt, taxAmt, total } = useMemo(() => {
        const lineItems = rows
            .filter((r) => r.serviceId)
            .map((r) => {
                const svc = services.find((s) => s.id === Number(r.serviceId));
                const calculated = svc ? svc.unitPrice * r.qty : 0;
                const quoted = r.quotedPrice !== "" ? parseFloat(r.quotedPrice) || 0 : calculated;
                return { ...r, svc, calculated, quoted };
            });

            const subtotal = lineItems.reduce((s, l) => s + l.quoted, 0);

            const discountAmt = (subtotal * discount) / 100;

            const effectiveTaxRate = gstEnabled ? Number(config.taxRate): 0;

            const taxableAmount = subtotal - discountAmt;

            const taxAmt =(taxableAmount * effectiveTaxRate) / 100;

            const total =taxableAmount + taxAmt;

            return {lineItems,subtotal, discountAmt,taxAmt,total };

            }, [rows, discount, services, config, gstEnabled]);

    // ── Row helpers ──────────────────────────────────────────────────────────
    function addRow() {
        setRows((prev) => [...prev, { id: Date.now(), serviceId: "", qty: 1, quotedPrice: "", name: "", base: "", price: "", gst: "", description: "", categoryId: "", category: "" }]);
    }

    function removeRow(id) {
        setRows((prev) => prev.filter((r) => r.id !== id));
    }

    function updateRow(id, field, value) {
        setRows((prev) =>
            prev.map((r) => {
                if (r.id !== id) return r;
                const updated = { ...r, [field]: value };
                // Auto-fill quotedPrice from unit price when service changes
                if (field === "serviceId") {
                    const svc = services.find((s) => s.id === Number(value));
                    updated.quotedPrice = svc ? String(svc.unitPrice * updated.qty) : "";
                    updated.name = svc.name;
                    updated.gst = svc.gst;
                    updated.base = svc.base;
                    updated.price = svc.unitPrice;
                    updated.description = svc.description;
                    updated.categoryId = svc.categoryId;
                    updated.category = svc.category;
                }
                if (field === "qty" && r.serviceId) {
                    const svc = services.find((s) => s.id === Number(r.serviceId));
                    if (svc && r.quotedPrice === String(svc.unitPrice * r.qty)) {
                        updated.quotedPrice = String(svc.unitPrice * value);
                    }
                }
                return updated;
            })
        );
    }

   function calcTotals(quote) {
    const services = Array.isArray(quote?.services)
        ? quote.services
        : [];

    // Subtotal
    const subtotal = services.reduce(
        (sum, s) => sum + Number(s.quotedPrice || 0),
        0
    );

    // GST is already stored per service
    const gstAmount = services.reduce(
        (sum, s) => sum + Number(s.gst || 0),
        0
    );

    // GST rate comes from .env when GST amount is available
    const gstRate =
        gstAmount > 0
            ? Number(process.env.NEXT_PUBLIC_GST_RATE || 0)
            : 0;

    // Final total
    const total = subtotal + gstAmount;

    return {
        subtotal,
        gstRate,
        gstAmount,
        total
    };
}

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function ensureJsPDF() {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
    }

    async function generateInvoicePDF(quote) {
        await ensureJsPDF();

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        const DARK = [45, 45, 45];
        const MUTED = [120, 120, 120];
        const BLACK = [0, 0, 0];
        const WHITE = [255, 255, 255];
        const HEADER_BG = [55, 55, 55];   // dark grey table header (matches receipt)
        const LIGHT_GREY = [245, 245, 245];
        const BLUE = [0, 150, 210];  // GS Bond blue accent

        const pageW = doc.internal.pageSize.getWidth();   // 210mm
        const pageH = doc.internal.pageSize.getHeight();  // 297mm
        const L = 14;   // left margin
        const R = pageW - 14; // right margin

       const { subtotal,gstRate, gstAmount,total} = calcTotals(quote);
        // ── TOP: Company name + logo area (left) ──────────────────────────
        let y = 14;

        const loadImage = (url) => new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext("2d").drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
        const logoBase64 = await loadImage("/logo/logo.png");
        if (logoBase64) {
            const imgX = L;
            const imgY = 6;
            const imgWidth = 20;
            const imgHeight = 20;

            doc.addImage(logoBase64, "PNG", imgX, imgY, imgWidth, imgHeight);

            // Calculate vertical center of image
            const centerY = imgY + imgHeight / 2;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...BLACK);

            // Adjust text Y slightly because text baseline differs
            doc.text("GS Bond Cleaning", imgX + imgWidth + 4, centerY + 2);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...MUTED);
            doc.text("ABN : 98638640230", L + 24, 22);
        }

        // ── TOP RIGHT: "Receipt" heading + invoice number ─────────────────
        doc.setFont("helvetica", "normal");
        doc.setFontSize(22);
        doc.setTextColor(...DARK);
        doc.text("Estimated Quote", R, y, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...MUTED);
        doc.text(`# ${quote.invoiceNo || quote.id}`, R, y + 8, { align: "right" });

        // ── HORIZONTAL DIVIDER ────────────────────────────────────────────
        y = 30;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        // doc.line(L, y, R, y);

        // ── BILL TO (left) + Date/Balance (right) ────────────────────────
        y += 8;

        // Left: Receipt To
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text("Receipt To:", L, y);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...BLACK);
        doc.text(quote.clientName, L, y + 6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        const addrLines = doc.splitTextToSize(quote.address + ", " + quote.zip, 70);
        doc.text(addrLines, L, y + 12);

        // Right: Date / Due Date / Balance Due box
        const boxX = pageW - 90;
        const boxW = 76;

        // Date row
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        doc.text("Date:", boxX, y + 2);
        doc.setTextColor(...DARK);
        doc.text(new Date().toLocaleDateString("en-AU", { month: "short", day: "2-digit", year: "numeric" }), R, y + 2, { align: "right" });

        // Due Date row
        doc.setTextColor(...MUTED);
        doc.text("Due Date:", boxX, y + 9);
        doc.setTextColor(...DARK);
        doc.text(new Date().toLocaleDateString("en-AU", { month: "short", day: "2-digit", year: "numeric" }), R, y + 9, { align: "right" });

        // Balance Due highlighted box
        // doc.setFillColor(235, 235, 235);
        // doc.roundedRect(boxX - 2, y + 13, boxW + 2, 10, 1, 1, "F");
        // doc.setFont("helvetica", "bold");
        // doc.setFontSize(9);
        // doc.setTextColor(...DARK);
        // doc.text("Advance amount:", boxX + 2, y + 19.5);
        // doc.text(`$${Number(client.advanceAmount).toFixed(2)}`, R, y + 19.5, { align: "right" });

        // ── SERVICES TABLE ────────────────────────────────────────────────
        y += 40;

        doc.autoTable({
            startY: y,
            head: [["Item", "Rate", "Amount"]],
            body: quote.services.map((s) => [
                `${s.name}\n ${s.note || ""}`,
                // s.qty || 1,
                `A$${Number(s.price).toFixed(2)}`,
                `A$${(Number(s.quotedPrice) * (1)).toFixed(2)}`,
            ]),
            // theme: "grid",
            headStyles: {
                fillColor: HEADER_BG,
                textColor: WHITE,
                fontStyle: "bold",
                fontSize: 9,
                halign: "left",
            },
            bodyStyles: {
                fontSize: 9,
                textColor: DARK,
                minCellHeight: 10,
            },
            columnStyles: {
                0: { cellWidth: "auto" },
                1: { halign: "center", cellWidth: 25 },
                2: { halign: "right", cellWidth: 30 },
                3: { halign: "right", cellWidth: 30 },
            },
            alternateRowStyles: { fillColor: WHITE },
            margin: { left: L, right: L },
        });

        // ── TOTALS (right aligned, below table) ──────────────────────────

                let ty = doc.lastAutoTable.finalY + 6;

                // Subtotal
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(...MUTED);

                doc.text("Subtotal:", R - 40, ty);

                doc.setTextColor(...DARK);

                doc.text(
                    `A$${Number(subtotal).toFixed(2)}`,
                    R,
                    ty,
                    { align: "right" }
                );


                // GST
                ty += 7;

                doc.setTextColor(...MUTED);

                doc.text(
                    `GST (${Number(gstRate).toFixed(2)}%):`,
                    R - 40,
                    ty
                );

                doc.setTextColor(...DARK);

                doc.text(
                    `A$${Number(gstAmount).toFixed(2)}`,
                    R,
                    ty,
                    { align: "right" }
                );


                // Total
                ty += 8;

                doc.setFont("helvetica", "bold");
                doc.setTextColor(...DARK);

                doc.text(
                    "Total:",
                    R - 40,
                    ty
                );

                doc.text(
                    `A$${Number(total).toFixed(2)}`,
                    R,
                    ty,
                    { align: "right" }
                );

        // ty += 7;
        // doc.setTextColor(...MUTED);
        // doc.text("Amount Paid:", R - 40, ty);
        // doc.setTextColor(...DARK);
        // doc.text(`A$${Number(total).toFixed(2)}`, R, ty, { align: "right" });

        // ── FOOTER ───────────────────────────────────────────────────────
        // Divider before footer
        ty += 16;
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        // doc.line(L, ty, R, ty);
        ty += 8;

        // Company footer info
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        doc.text("GS Bond Cleaning", L, ty);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...MUTED);
        doc.text("P : 08 8444 0442", L, ty + 6);
        doc.text("E : admin@gsbondcleaning.com.au", L, ty + 12);
        doc.text("W : www.gsbondcleaning.com.au", L, ty + 18);

        ty += 28;
        doc.setTextColor(...DARK);
        doc.setFontSize(8.5);
        doc.text("Click the below link for inclusions of our service :", L, ty);
        doc.setTextColor(...BLUE);
        doc.text("https://www.gsbondcleaning.com.au/inclusions-and-exclusions/", L, ty + 6);

        ty += 14;
        doc.setTextColor(...DARK);
        doc.text("Terms & Conditions :", L, ty);
        doc.setTextColor(...BLUE);
        doc.text("https://www.gsbondcleaning.com.au/terms-conditions/", L, ty + 6);

        ty += 14;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        doc.text("Bank Details :", L, ty);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...MUTED);
        doc.text("GS Bond Cleaning pty Ltd.", L, ty + 6);
        doc.text("BSB : 085005", L, ty + 12);
        doc.text("AC : 310448994", L, ty + 18);

        // ── SAVE ─────────────────────────────────────────────────────────
        doc.save(`Receipt_${quote.invoiceNo || quote.id}_${quote.clientName.replace(/\s+/g, "_")}.pdf`);
    }

    async function handleDownload() {
        const quote = buildQuoteFromState();
        setDownloading(quote.id);
        try {
            // console.log("quote", quote);
            await generateInvoicePDF(quote);
            // showToast(`✅ Invoice ${quote.invoiceNo} downloaded!`);
        } catch (e) {
            // showToast("❌ Failed to generate PDF. Please try again.");
        } finally {
            setDownloading(null);
        }
    }


    function buildQuoteFromState() {
                const services = rows
                    .filter((r) => r.serviceId || r.name)
                    .map((r) => {
                        const quotedPrice =
                            parseFloat(
                                r.quotedPrice || r.price || r.base
                            ) || 0;

                        const gst =
                            gstEnabled
                                ? (quotedPrice * Number(config.taxRate)) / 100
                                : 0;

                        return {
                            name: r.name || r.serviceId,
                            note: r.note || 1,
                            price: parseFloat(r.price || r.base) || 0,
                            quotedPrice,
                            gst: gst.toFixed(2),
                        };
                    });

                const subtotal = services.reduce(
                    (sum, s) => sum + Number(s.quotedPrice || 0),
                    0
                );

                const gstAmount = services.reduce(
                    (sum, s) => sum + Number(s.gst || 0),
                    0
                );

                const total = subtotal + gstAmount;

                return {
                    id: `${Date.now()}`,
                    invoiceNo: `${Date.now()}`,
                    clientName: client.name,
                    address: client.address,
                    zip: client.zip,
                    advanceAmount: client.advanceAmount,

                    services,

                    subtotal,
                    gstAmount,
                    gstRate: gstEnabled
                        ? Number(config.taxRate)
                        : 0,

                    total: total.toFixed(2),
                };
            }



    async function sendEmail() {
        const quote = buildQuoteFromState();
        // console.log("quote", quote);
        setDownloading(quote.id);
        await handleDownload();

        try {
            // Create services table (HTML)
            const servicesHTML = rows.map((row, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>
                    ${row.name}<br>
                    <span style="font-size: 0.8em; color: gray;">${row.note || ''}</span>
                </td>
                <td>${row.description || "-"}</td>
                <td>$${row.quotedPrice}</td>
            </tr>
            `).join("");

            const emailHTML = `
      <h2>Quotation from GS Bond Cleaning</h2>

      <p><strong>Client Details:</strong></p>
      <p>
        Name: ${client.name} <br/>
        Email: ${client.email} <br/>
        Mobile: ${client.mobile} <br/>
        Address: ${client.address} - ${client.zip} <br/>
        Advance Payment: ${client.advanceAmount} <br/>
        Total: ${quote.total} 
      </p>

      <h3>Services:</h3>
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>#</th>
            <th>Service</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${servicesHTML}
        </tbody>
      </table>

      <p><strong>Other Details:</strong> ${client.otherDetails || "-"}</p>

      <br/>
      <p>Regards,<br/>GS Bond Cleaning</p>
    `;

            // Send to backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/send-mail`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    to: client.email,
                    subject: "Quotation from GS Bond Cleaning",
                    html: emailHTML,
                }),
            });

            const data = await res.json();

            if (data.success) {
                alert("Email sent successfully ✅");
            } else {
                alert("Failed to send email ❌");
            }

        } catch (error) {
            console.error(error);
            alert("Error sending email ❌");
        }
    }

    // ── Submit ───────────────────────────────────────────────────────────────
   async function handleSubmit(e) {
    e.preventDefault();

    console.log("client-details", client);
    console.log("services-details", rows);
    // Calculate GST amount for each service row
    const servicesWithGST = rows.map((row) => {
        const quotedPrice =
            parseFloat(row.quotedPrice || row.price || row.base) || 0;

        const gstValue = gstEnabled
            ? (quotedPrice * Number(config.taxRate)) / 100
            : 0;

        return {
            ...row,
            gst: gstValue.toFixed(2),
        };
    });

    console.log("services-with-gst", servicesWithGST);

    const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/externalquote`,
        {
            leadId: leads.id,
            name: client.name,
            email: client.email,
            phone: client.mobile,
            address: client.address,
            zip: client.zip,

            // ✅ Save calculated GST amount
            services: servicesWithGST,

            otherDetails: client.otherDetails,
            advanceAmount: client.advanceAmount,
            suburbs: client.suburbs,
            quotationType: client.quotationType,
            cleaningType: client.cleaningType,
            source: "EXTERNAL",
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    setSubmitted(true);
}

    // ── Success screen ────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="card border-0 shadow-sm rounded-4 text-center py-5 px-4">
                <div className="mb-3" style={{ fontSize: 56 }}>🎉</div>
                <h3 className="fw-bold text-dark mb-2">Quote Created!</h3>
                <p className="text-secondary mb-4">
                    Quote for <strong>{client.name}</strong> has been saved successfully.
                </p>
                <div className="d-flex justify-content-center gap-3">
                    <button
                        className="btn btn-primary rounded-3 px-4"
                        onClick={() => {
                            setSubmitted(false); setRows([{ id: Date.now(), serviceId: "", qty: 1, quotedPrice: "", name: "", base: "", price: "", gst: "", description: "", categoryId: "", category: "" }]);
                            setClient({ name: "", email: "", mobile: "", address: "", zip: "", otherDetails: "" });
                        }}
                    >
                        Create Another
                    </button>
                    <a href="/dashboard/quote/all-quotes" className="btn btn-outline-primary rounded-3 px-4">
                        View Quotes
                    </a>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate>

            {/* ── 1. Client Information ── */}
            <SectionCard icon="👤" title="External Client Information" subtitle="Basic contact details of the client">
                <div className="row g-3">

                    <div className="col-md-6">
                        <FormField label="Full Name" required>
                            <input
                                type="text"
                                className="form-control rounded-3"
                                placeholder="e.g. Rajesh Kumar"
                                value={client.name}
                                onChange={(e) => setClient({ ...client, name: e.target.value })}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="col-md-6">
                        <FormField label="Email Address" required>
                            <input
                                type="email"
                                className="form-control rounded-3"
                                placeholder="e.g. rajesh@company.com"
                                value={client.email}
                                onChange={(e) => setClient({ ...client, email: e.target.value })}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="col-md-4">
                        <FormField label="Mobile Number" required>
                            <div className="input-group">
                                <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 rounded-start-3 fw-semibold">
                                    +61
                                </span>
                                <input
                                    type="tel"
                                    className="form-control border-start-0 rounded-end-3"
                                    placeholder="98765 43210"
                                    maxLength={10}
                                    value={client.mobile}
                                    onChange={(e) => setClient({ ...client, mobile: e.target.value })}
                                    required
                                />
                            </div>
                        </FormField>
                    </div>

                    <div className="col-md-5">
                        <FormField label="Address" required>
                            <input
                                type="text"
                                className="form-control rounded-3"
                                placeholder="Street, City, State"
                                value={client.address}
                                onChange={(e) => setClient({ ...client, address: e.target.value })}
                                
                            />
                        </FormField>
                    </div>

                    <div className="col-md-5">
                        <FormField label="Suburb" required>
                            <input
                                type="text"
                                className="form-control rounded-3"
                                placeholder="suburb"
                                value={client.suburbs}
                                onChange={(e) => setClient({ ...client, suburbs: e.target.value })}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="col-md-3">
                        <FormField label="PostCode" required>
                            <input
                                type="text"
                                className="form-control rounded-3"
                                placeholder="e.g. 110001"
                                maxLength={6}
                                value={client.zip ?? ""}
                                onChange={(e) => setClient({ ...client, zip: e.target.value })}
                                required
                            />
                        </FormField>
                    </div>

                    <div className="col-12">
                        <FormField label="Other Details" hint="Any additional notes about the client or project scope.">
                            <textarea
                                className="form-control rounded-3"
                                rows={3}
                                placeholder="GST number, company name, special instructions…"
                                value={client.otherDetails}
                                onChange={(e) => setClient({ ...client, otherDetails: e.target.value })}
                            />
                        </FormField>
                    </div>


                    <div className="col-md-3">
                        <FormField label="Advance Amount" >
                            <input
                                type="number"
                                className="form-control rounded-3"
                                placeholder="$0.00"
                                value={client.advanceAmount}
                                onChange={(e) => setClient({ ...client, advanceAmount: e.target.value })}
                            />
                        </FormField>
                        
                    </div>
                             <div className="col-md-3">
                                    <FormField label="Service Type">
                                        <select
                                            className="form-select rounded-3 form-select-sm"
                                            value={client.quotationType || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;

                                                setClient({
                                                    ...client,
                                                    quotationType: value,
                                                    // Reset cleaning type when service type changes
                                                    cleaningType: ""
                                                });
                                            }}
                                        >
                                            <option value="">— Select Type —</option>
                                            <option value="OnceOff">Once-Off</option>
                                            <option value="Recurring">Recurring</option>
                                        </select>
                                    </FormField>
                </div>


                    <div className="col-md-3">
                        <FormField label="Cleaning Type">
                            <select
                                className="form-select rounded-3 form-select-sm"
                                value={client.cleaningType || ""}
                                onChange={(e) =>
                                    setClient({
                                        ...client,
                                        cleaningType: e.target.value
                                    })
                                }
                                disabled={!client.quotationType}
                            >
                                <option value="">— Select Type —</option>

                                {client.quotationType === "OnceOff" && (
                                    <option value="One-Time">
                                        One-Time
                                    </option>
                                )}

                                {client.quotationType === "Recurring" && (
                                    <>
                                        <option value="Daily">
                                            Daily
                                        </option>

                                        <option value="Weekly">
                                            Weekly
                                        </option>

                                        <option value="FortNightly">
                                            FortNightly
                                        </option>

                                        <option value="Monthly">
                                            Monthly
                                        </option>
                                    </>
                                )}
                            </select>
                        </FormField>
                    </div>
                </div>
            </SectionCard>

            {/* ── 2. Services ── */}
            <SectionCard icon="🛠️" title="Services" subtitle="Add services — calculated amount is auto-filled, quoted amount is editable">

                {/* Table header — hidden on mobile */}
                <div className="d-none d-md-block mb-2">
                    <div className="row g-2 px-2">
                        <div className="col-md-4"><span className="text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.06em" }}>Service</span></div>
                        {/* <div className="col-md-2 text-center"><span className="text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.06em" }}>Qty</span></div> */}
                        <div className="col-md-2 text-end"><span className="text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.06em" }}>Unit Price</span></div>
                        <div className="col-md-2 text-end"><span className="text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.06em" }}>Calculated</span></div>
                        <div className="col-md-2 text-end pe-4"><span className="text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: "0.06em" }}>Quoted $</span></div>
                    </div>
                    <hr className="text-primary opacity-25 my-2" />
                </div>

                {/* Service rows */}
                <div className="d-flex flex-column gap-3 mb-3">
                    {rows.map((row, idx) => {
                        const svc = services.find((s) => s.id === Number(row.serviceId));
                        const calculated = svc ? svc.unitPrice * row.qty : 0;

                        return (
                            <div key={row.id} className="card border border-primary border-opacity-25 rounded-3 px-3 py-3 bg-white">
                                <div className="row g-2 align-items-center">

                                    {/* Row number badge */}
                                    <div className="col-auto d-flex align-items-center">
                                        <span
                                            className="badge bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                            style={{ width: 28, height: 28, fontSize: 12 }}
                                        >
                                            {idx + 1}
                                        </span>
                                    </div>

                                    {/* Service select */}
                                    <div className="col-12 col-md" >
                                        <select
                                            className="form-select rounded-3 form-select-sm"
                                            value={row.serviceId}
                                            onChange={(e) => updateRow(row.id, "serviceId", e.target.value)}
                                            required
                                        >
                                            <option value="">— Select Service —</option>
                                            {services.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} 
                                                </option>
                                            ))}
                                        </select>

                                        <div className="mb-2 d-flex ">
                                            {/* <span className="form-label small mb-1 mt-1">Note</span> */}
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-3"
                                                placeholder="Enter note"
                                                value={row.note}
                                                onChange={(e) => updateRow(row.id, "note", e.target.value ?? "")}
                                            />
                                        </div>
                                    </div>

                                    {/* Qty */}
                                    {/* <div className="col-4 col-md-auto" style={{ minWidth: 90 }}>
                                        <div className="input-group input-group-sm">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary px-2"
                                                onClick={() => updateRow(row.id, "qty", Math.max(1, row.qty - 1))}
                                            >−</button>
                                            <input
                                                type="number"
                                                className="form-control text-center"
                                                min={1}
                                                value={row.qty}
                                                onChange={(e) => updateRow(row.id, "qty", Math.max(1, parseInt(e.target.value) || 1))}
                                                style={{ width: 46 }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary px-2"
                                                onClick={() => updateRow(row.id, "qty", row.qty + 1)}
                                            >+</button>
                                        </div>
                                    </div> */}

                                    {/* Unit price (read-only) */}
                                    <div className="col-4 col-md-auto text-end" style={{ minWidth: 100 }}>
                                        <span className="badge bg-light text-secondary border rounded-3 px-3 py-2 font-monospace small">
                                            {svc ? fmt(svc.unitPrice) : "—"}
                                        </span>
                                    </div>

                                    {/* Calculated amount (read-only) */}
                                    <div className="col-4 col-md-auto text-end" style={{ minWidth: 110 }}>
                                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-3 px-3 py-2 font-monospace small">
                                            {svc ? fmt(calculated) : "—"}
                                        </span>
                                    </div>

                                    {/* Quoted amount (editable) */}
                                    <div className="col-8 col-md-auto" style={{ minWidth: 130 }}>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-primary bg-opacity-10 text-primary border-end-0 fw-bold">$</span>
                                            <input
                                                type="number"
                                                className="form-control border-start-0 text-end font-monospace"
                                                placeholder="0.00"
                                                min={0}
                                                step="0.01"
                                                value={row.quotedPrice}
                                                onChange={(e) => updateRow(row.id, "quotedPrice", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Remove */}
                                    <div className="col-auto">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger rounded-3"
                                            disabled={rows.length === 1}
                                            onClick={() => removeRow(row.id)}
                                            title="Remove row"
                                        >
                                            🗑
                                        </button>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add service button */}
                <button
                    type="button"
                    className="btn btn-outline-primary rounded-3 w-100"
                    onClick={addRow}
                >
                    + Add Another Service
                </button>

            </SectionCard>

            {/* ── 3. Summary & Totals ── */}
            <SectionCard icon="🧾" title="Quote Summary" subtitle="Review totals before generating the quote">
                <div className="row g-4">

                    {/* Left — notes + discount */}
                    <div className="col-md-6">
                        {/* <FormField label="Discount">
                            <div className="d-flex flex-wrap gap-2">
                                {config.discountOptions.map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDiscount(d)}
                                        className={`btn btn-sm rounded-pill px-3 ${discount === d ? "btn-primary" : "btn-outline-primary"}`}
                                    >
                                        {d === 0 ? "None" : `${d}%`}
                                    </button>
                                ))}
                            </div>
                        </FormField> */}

                        {/* <FormField label="Internal Notes" hint="Not visible to the client.">
                            <textarea
                                className="form-control rounded-3"
                                rows={3}
                                placeholder="Remarks, follow-up date, source of lead…"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </FormField> */}
                    </div>

                    {/* Right — amount breakdown */}
<div className="col-md-6">
    <div className="card border-0 bg-primary bg-opacity-10 rounded-4 p-4">

        {lineItems.length === 0 ? (
            <p className="text-secondary small text-center mb-0">
                Add services to see totals.
            </p>
        ) : (
            <>

                {/* Hide individual products */}

                <div className="d-flex flex-column gap-2">

                    {/* Subtotal */}
                    <div className="d-flex justify-content-between small text-dark">
                        <span>Subtotal</span>

                        <span className="font-monospace fw-semibold">
                            {fmt(subtotal)}
                        </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center small text-secondary">
                    <div className="d-flex align-items-center gap-2">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="gstEnabled"
                            checked={gstEnabled}
                            onChange={(e) => setGstEnabled(e.target.checked)}
                        />

                        <label
                            htmlFor="gstEnabled"
                            className="mb-0"
                            style={{ cursor: "pointer" }}
                        >
                            GST ({config.taxRate}%)
                        </label>
                    </div>

                    <span className="font-monospace">
                        {gstEnabled ? `+ ${fmt(taxAmt)}` : fmt(0)}
                    </span>
                </div>
                    <hr className="text-primary opacity-25 my-1" />

                    {/* Total */}
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-dark fs-6">
                            Total Quoted
                        </span>

                        <span className="fw-bold text-primary fs-5 font-monospace">
                            {fmt(total)}
                        </span>
                    </div>

                </div>

            </>
        )}

    </div>
</div>

                </div>
            </SectionCard>

            {/* ── Actions ── */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-4">
                <button type="button" className="btn btn-outline-secondary rounded-3 px-4">
                    ← Back
                </button>
                <div className="d-flex gap-2">
                    {/* <button type="button" className="btn btn-outline-primary rounded-3 px-4" onClick={() => sendEmail()}>
                        💾 Send Email
                    </button> */}
                    <button
                        type="submit"
                        className="btn btn-primary rounded-3 px-5 fw-semibold"
                        disabled={lineItems.length === 0 || !client.name || !client.email}
                    >
                        ✅ Save Quote
                    </button>
                </div>
            </div>

        </form>
    );
}