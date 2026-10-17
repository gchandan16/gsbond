"use client";
// ✅ CLIENT COMPONENT (CSR)
// Receives quotes as props from SSR page.
// Handles invoice PDF generation & download using jsPDF + jspdf-autotable (CDN loaded once).

import { useState, useEffect } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 0,
    }).format(n);

function calcTotals(quote) {
    const total = quote.services.reduce(
        (sum, s) => sum + Number(s.quotedPrice),
        0
    );

    // console.log("totaltotaltotaltotaltotal",total);

    return { total };
}

const STATUS_BADGE = {
    Draft: "badge bg-secondary",
    Sent: "badge bg-primary",
    Approved: "badge bg-success",
    Rejected: "badge bg-danger",
    Pending: "badge bg-warning text-dark",
};

// ── Load jsPDF from CDN once ──────────────────────────────────────────────────
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

// ── PDF Generator ─────────────────────────────────────────────────────────────
async function generateInvoicePDF(quote,documentType = "Receipt",outputMode = "download") {
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

    const { total } = calcTotals(quote);

    const gstTotal = (quote.services || []).reduce(
    (sum, service) => sum + (Number(service.gst) || 0),
    0
    );

    console.log("Invoice GST values:", quote.services?.map(s => ({
    name: s.name,
    gst: s.gst
    })));
    console.log("Invoice GST Total:", gstTotal);

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
    doc.setFontSize(24);
    doc.setTextColor(...DARK);
   // doc.text("Receipt", R, y, { align: "right" });
   doc.text(documentType, R, y, { align: "right" });

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
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(boxX - 2, y + 13, boxW + 2, 10, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text("Balance Due:", boxX + 2, y + 19.5);
    doc.text(`A$${Number(quote.dueAmount).toFixed(2)}`, R, y + 19.5, { align: "right" });

    // ── SERVICES TABLE ────────────────────────────────────────────────
    y += 40;

    doc.autoTable({
        startY: y,
        head: [["Item", "Quantity", "Rate", "Amount"]],
        body: quote.services.map((s) => [
            s.name,
            s.qty || 1,
            `A$${Number(s.price).toFixed(2)}`,
            `A$${(Number(s.quotedPrice || s.price) * (s.qty || 1)).toFixed(2)}`,
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

        // GST Total
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        doc.text("GST Total:", R - 40, ty);

        doc.setTextColor(...DARK);
        doc.text(`A$${gstTotal.toFixed(2)}`, R, ty, {
        align: "right",
        });

        ty += 7;

        // Total
        doc.setTextColor(...MUTED);
        doc.text("Total:", R - 40, ty);
        doc.setTextColor(...DARK);
        doc.text(`A$${Number(quote.quotatedAmount || 0).toFixed(2)}`, R, ty, {
        align: "right",
        });

        ty += 7;

        // Advance Amount
        doc.setTextColor(...MUTED);
        doc.text("Advance amount:", R - 40, ty);
        doc.setTextColor(...DARK);
        doc.text(`A$${Number(quote.advanceAmount || 0).toFixed(2)}`, R, ty, {
        align: "right",
        });

        ty += 7;

        // Due Amount
        doc.setTextColor(...MUTED);
        doc.text("Due Amount:", R - 40, ty);
        doc.setTextColor(...DARK);
        doc.text(`A$${Number(quote.dueAmount || 0).toFixed(2)}`, R, ty, {
        align: "right",
        });


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
    //doc.save(`Receipt_${quote.invoiceNo || quote.id}_${quote.clientName.replace(/\s+/g, "_")}.pdf`);

    const filePrefix = documentType.replace(/\s+/g, "_");

const fileName = `${filePrefix}_${quote.invoiceNo || quote.id}_${(
  quote.clientName || "Customer"
).replace(/\s+/g, "_")}.pdf`;

if (outputMode === "email") {
  return {
    blob: doc.output("blob"),
    fileName,
  };
}

doc.save(fileName);
}


async function generateInvoicePDF2(quote) {
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

    const { total } = calcTotals(quote);
    const gstTotal = (quote.services || []).reduce((sum, service) => sum + Number(service.gst || 0),0);

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
    doc.setFontSize(30);
    doc.setTextColor(...DARK);
    doc.text("Quotation", R, y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text(`# QUO-${Date.now()}`, R, y + 8, { align: "right" });

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
    // doc.text("Balance Due:", boxX + 2, y + 19.5);
    // doc.text(`A$${Number(0).toFixed(2)}`, R, y + 19.5, { align: "right" });

    // ── SERVICES TABLE ────────────────────────────────────────────────
    y += 40;

    doc.autoTable({
        startY: y,
        head: [["Item", "Quantity", "Rate", "Amount"]],
        body: quote.services.map((s) => [
            s.name,
            s.qty || 1,
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

    // GST Total row
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("GST Total:", R - 40, ty);

    doc.setTextColor(...DARK);
    doc.text(`A$${Number(gstTotal).toFixed(2)}`, R, ty, {
        align: "right",
    });

    ty += 7;

    // Existing Total row continues here
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("Total:", R - 40, ty);
    doc.setTextColor(...DARK);
    doc.text(`A$${Number(quote.quotatedAmount || 0).toFixed(2)}`, R, ty, {
    align: "right",
    });


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
    doc.save(`Quotation${quote.invoiceNo || quote.id}_${quote.clientName.replace(/\s+/g, "_")}.pdf`);
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function InvoiceList({ quotes }) {
    const [downloading, setDownloading] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatus] = useState("All");
    const [toast, setToast] = useState(null);

    const [emailQuote, setEmailQuote] = useState(null);
    const [emailTypes, setEmailTypes] = useState(["Invoice"]);

    const ALL_STATUSES = ["All", "Approved",];

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }

    async function handleDownload(quote) {
        setDownloading(quote.id);
        try {
            console.log("quote",quote);
            await generateInvoicePDF(quote);
            showToast(`✅ Invoice ${quote.invoiceNo} downloaded!`);
        } catch (e) {
            showToast("❌ Failed to generate PDF. Please try again.");
        } finally {
            setDownloading(null);
        }
    }

 
async function handleSendEmail(quote, documentTypes) {
  if (!documentTypes.length) {
    showToast("Please select Invoice, Receipt, or Both.");
    return;
  }

  try {
    setDownloading(quote.id);

    const token = localStorage.getItem("authToken");
    const formData = new FormData();

    formData.append("id", String(quote.id));
    formData.append("to", quote.email);

    const subject =
      documentTypes.length === 2
        ? "Invoice and Receipt - GS Bond Cleaning"
        : `${documentTypes[0]} - GS Bond Cleaning`;

    formData.append("subject", subject);
    formData.append(
      "html",
      `<p>Dear ${quote.clientName || "Customer"},</p>
       <p>Please find the selected document(s) attached.</p>
       <p>Thank you for choosing GS Bond Cleaning.</p>
       <p>Kind regards,<br/>GS Bond Cleaning</p>`
    );

    // Generate and attach each selected PDF
    for (const documentType of documentTypes) {
      const pdf = await generateInvoicePDF(
        quote,
        documentType,
        "email"
      );

      if (!pdf?.blob) {
        throw new Error(`Failed to generate ${documentType} PDF.`);
      }

      // Same field name for both files.
      // Backend must support multiple quotePdf files.
      formData.append("quotePdf", pdf.blob, pdf.fileName);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/send-invoice-receipt-mail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

   const responseText = await response.text();

        let data;

        try {
        data = JSON.parse(responseText);
        } catch {
        console.error("Non-JSON API response:", responseText);
        throw new Error(
            `Email API returned an invalid response (HTTP ${response.status}). Check the server logs.`
        );
        }

        if (!response.ok || !data.success) {
        throw new Error(
            data.message || data.error || "Failed to send email."
        );
        }

    showToast(`${subject} email sent successfully!`);
    setEmailQuote(null);
  } catch (error) {
    console.error("Send email error:", error);
    showToast(error.message || "Failed to send email.");
  } finally {
    setDownloading(null);
  }
}


    async function handleDownloadInvoice(quote) {
    setDownloading(quote.id);

    try {
        await generateInvoicePDF(quote, "Invoice");
        showToast(`Invoice ${quote.invoiceNo || quote.id} downloaded successfully!`);
    } catch (error) {
        console.error("Invoice download error:", error);
        showToast("Failed to download invoice. Please try again.");
    } finally {
        setDownloading(null);
    }
    }

    // for the quotation
    async function handleDownload2(quote) {
        setDownloading(quote.id);
        try {
            await generateInvoicePDF2(quote);
            showToast(`✅ Invoice ${quote.invoiceNo} downloaded!`);
        } catch (e) {
            showToast("❌ Failed to generate PDF. Please try again.");
        } finally {
            setDownloading(null);
        }
    }

    const filtered = quotes.filter((q) => {
        const s = search.toLowerCase();
        const matchSearch =
            q.clientName.toLowerCase().includes(s) ||
            q.id.toString().includes(s) ||
            q.email.toLowerCase().includes(s)
        const matchStatus = statusFilter === "All" || q.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // console.log("filteredfiltered",filtered);

    return (
        <>

                {/* Send Email Popup */}
                {emailQuote && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 10000,
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4">
                        <div className="modal-header">
                        <h5 className="modal-title">Send Documents by Email</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setEmailQuote(null)}
                            disabled={downloading === emailQuote.id}
                        />
                        </div>

                        <div className="modal-body">
                        <p>
                            Send documents to{" "}
                            <strong>{emailQuote.clientName}</strong>
                        </p>
                        <p className="text-muted small">{emailQuote.email}</p>

                        {["Invoice", "Receipt"].map((type) => (
                            <div className="form-check mb-3" key={type}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`email-${type}`}
                                checked={emailTypes.includes(type)}
                                onChange={(e) => {
                                setEmailTypes((previous) =>
                                    e.target.checked
                                    ? [...previous, type]
                                    : previous.filter((item) => item !== type)
                                );
                                }}
                                disabled={downloading === emailQuote.id}
                            />
                            <label
                                className="form-check-label"
                                htmlFor={`email-${type}`}
                            >
                                {type} PDF
                            </label>
                            </div>
                        ))}
                        </div>

                        <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => setEmailQuote(null)}
                            disabled={downloading === emailQuote.id}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={
                            downloading === emailQuote.id ||
                            emailTypes.length === 0
                            }
                            onClick={() =>
                            handleSendEmail(emailQuote, emailTypes)
                            }
                        >
                            {downloading === emailQuote.id
                            ? "Sending..."
                            : "Send Email"}
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
                )}



            {/* Toast */}
            {toast && (
                <div
                    className="position-fixed top-0 end-0 m-4 alert alert-primary border-0 shadow rounded-3 px-4 py-3 d-flex align-items-center gap-2"
                    style={{ zIndex: 9999, minWidth: 280 }}
                >
                    {toast}
                </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

                {/* ── Toolbar ── */}
                <div className="card-header bg-white border-bottom border-primary border-opacity-25 px-4 py-3">
                    <div className="row g-2 align-items-center">

                        <div className="col-12 col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-primary">🔍</span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Search client, email, invoice no…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-6">
                            <div className="d-flex flex-wrap gap-2">
                                {ALL_STATUSES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatus(s)}
                                        className={`btn btn-sm rounded-pill px-3 ${statusFilter === s ? "btn-primary" : "btn-outline-primary"}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="col-12 col-md-2 text-md-end">
                            <span className="text-secondary small">{filtered.length} invoice{filtered.length !== 1 ? "s" : ""}</span>
                        </div>

                    </div>
                </div>

                {/* ── Table ── */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-primary">
                            <tr>
                                <th className="ps-4" style={{ width: 44 }}>
                                    <input type="checkbox" className="form-check-input" />
                                </th>
                                <th>Invoice No</th>
                                 <th>Quote ID</th>
                                <th>Client</th>
                                {/* <th className="d-none d-lg-table-cell">Services</th> */}
                                <th className="text-end fw-bold">Total</th>
                                <th className="text-center">Status</th>
                                <th className="d-none d-md-table-cell">Date</th>
                                <th className="text-center" style={{ minWidth: 140 }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={11}>
                                        <div className="text-center py-5 text-secondary">
                                            <div className="mb-2" style={{ fontSize: 40 }}>📄</div>
                                            <p className="fw-semibold mb-0">No invoices found</p>
                                            <p className="small mb-0">Try adjusting your search or filter</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((quote) => {
                                    const { subtotal, discountAmt, taxAmt, total } = calcTotals(quote);
                                    const isLoading = downloading === quote.id;

                                    return (
                                        <tr key={quote.id}>
                                            <td className="ps-4">
                                                <input type="checkbox" className="form-check-input" />
                                            </td>

                                            {/* Invoice No */}
                                            <td>
                                                <div>
                                                    <span className="badge bg-primary bg-opacity-10 text-primary font-monospace px-2 py-2 rounded-3 small fw-semibold d-block mb-1">
                                                        {quote.QuoteId}
                                                    </span>
                                                    {/* <span className="text-secondary" style={{ fontSize: 11 }}>{quote.id}</span> */}
                                                </div>
                                            </td>
                                        {/* Quote ID */}
                                            <td>
                                                <div>
                                                    <span className="badge bg-primary bg-opacity-10 text-primary font-monospace px-2 py-2 rounded-3 small fw-semibold d-block mb-1">
                                                        {quote.id}
                                                    </span>
                                                    {/* <span className="text-secondary" style={{ fontSize: 11 }}>{quote.id}</span> */}
                                                </div>
                                            </td>
                                            {/* Client */}
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {/* <div
                                                        className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fw-bold flex-shrink-0"
                                                        style={{ width: 34, height: 34, fontSize: 12 }}
                                                    >
                                                        {quote.clientName.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                                                    </div> */}
                                                    <div>
                                                        <div className="fw-semibold text-dark small">{quote.clientName}</div>
                                                        <div className="text-secondary font-monospace" style={{ fontSize: 11 }}>{quote.email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Services summary */}
                                            {/* <td className="d-none d-lg-table-cell">
                                                <div className="d-flex flex-column gap-1">
                                                    {quote.services.map((s, i) => (
                                                        <span key={i} className="text-secondary small">
                                                            {s.name}
                                                            <span className="text-muted ms-1">× {s.qty} {s.unit}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </td> */}

                                            {/* Total */}
                                            <td className="text-end">
                                                <span className="fw-bold text-primary font-monospace">{quote.quotatedAmount}</span>
                                            </td>

                                            {/* Status */}
                                            <td className="text-center">
                                                <span className={`${STATUS_BADGE[quote.status] ?? "badge bg-secondary"} rounded-pill px-3 py-2`}>
                                                    {quote.status}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="d-none d-md-table-cell">
                                                <span className="text-secondary small">{quote.createdAt}</span>
                                            </td>

                                            {/* ── Download Invoice Button ── */}
                                           
                                                {/* Action Buttons */}
                                                <td>
                                                <div className="d-flex align-items-center justify-content-center gap-2 flex-nowrap">

                                                    {/* Download Receipt */}
                                                    <button
                                                    type="button"
                                                    className="btn btn-outline-success btn-sm text-nowrap"
                                                    onClick={() => handleDownload(quote)}
                                                    disabled={downloading === quote.id}
                                                    title="Download Receipt PDF"
                                                    >
                                                    <i className="bi bi-receipt me-1"></i>
                                                    Receipt
                                                    </button>

                                                    {/* Download Invoice */}
                                                    <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm text-nowrap"
                                                    onClick={() => handleDownloadInvoice(quote)}
                                                    disabled={downloading === quote.id}
                                                    title="Download Invoice PDF"
                                                    >
                                                    <i className="bi bi-file-earmark-pdf me-1"></i>
                                                    Invoice
                                                    </button>

                                                    {/* Send Receipt Email */}
                                                    <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm text-nowrap"
                                                    onClick={() => {
                                                    setEmailQuote(quote);
                                                    setEmailTypes(["Invoice"]);
                                                    }}
                                                    title="Choose Invoice or Receipt to email"
                                                    >
                                                    <i className="bi bi-envelope me-1"></i>
                                                    Send Email
                                                    </button>

                                                </div>

                                                  
                                                  
                                                    {/* <button
                                                    className="btn btn-primary btn-sm rounded-3 px-3 d-flex align-items-center gap-2 mx-auto"
                                                    onClick={() => handleDownload2(quote)}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm" role="status" />
                                                            <span>Generating…</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>⬇️</span>
                                                            <span>Quotation PDF</span>
                                                        </>
                                                    )}
                                                </button> */}
                                            
                                            </td>

                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Footer summary ── */}
                {/* <div className="card-footer bg-white border-top border-primary border-opacity-25 px-4 py-3 d-flex flex-wrap gap-3 justify-content-between align-items-center">
                    <div className="d-flex gap-4">
                        <div>
                            <span className="text-secondary small d-block">Total Invoices</span>
                            <span className="fw-bold text-dark">{filtered.length}</span>
                        </div>
                        <div>
                            <span className="text-secondary small d-block">Total Value</span>
                            <span className="fw-bold text-primary font-monospace">
                                {fmt(filtered.reduce((s, q) => s + calcTotals(q).total, 0))}
                            </span>
                        </div>
                        <div>
                            <span className="text-secondary small d-block">Total GST</span>
                            <span className="fw-bold text-dark font-monospace">
                                {fmt(filtered.reduce((s, q) => s + calcTotals(q).taxAmt, 0))}
                            </span>
                        </div>
                    </div>
                    <button
                        className="btn btn-outline-primary rounded-3 px-4 d-flex align-items-center gap-2"
                        onClick={() => filtered.forEach((q, i) => setTimeout(() => handleDownload(q), i * 800))}
                    >
                        ⬇️ Download All PDFs
                    </button>
                </div> */}

            </div>
        </>
    );
}