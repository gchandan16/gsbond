"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

const STATUS_OPTIONS = ["Hot-lead", "Cold-lead", "Approved", "Cancelled", "Initiated"];
const JOB_STATUS_OPTIONS = ["Assigned", "Completed", "Pending"];

const ALL_SERVICES = [
  { id: 1, name: "Deep Cleaning", price: 1200, unit: "session" },
  { id: 2, name: "HVAC Servicing", price: 800, unit: "unit" },
  { id: 3, name: "Window Polishing", price: 600, unit: "panel" },
  { id: 4, name: "Pest Control", price: 450, unit: "visit" },
  { id: 5, name: "Carpet Steam Clean", price: 350, unit: "room" },
  { id: 6, name: "Facade Wash", price: 1800, unit: "floor" },
];

const fmt = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── StatusBadge ───────────────────────────────────────────────────────────────
function StatusBadge({ label }) {

  const colorMap = {
    "Hot-lead": "bg-danger bg-opacity-10 text-danger",
    "Cold-lead": "bg-primary bg-opacity-10 text-primary",
    "Approved": "bg-success bg-opacity-10 text-success",
    "Cancelled": "bg-warning bg-opacity-10 text-warning",
    "Initiated": "bg-info bg-opacity-10 text-info",
    "Completed": "bg-success bg-opacity-10 text-success",
    "Pending": "bg-warning bg-opacity-10 text-warning",
    "Assigned": "bg-primary bg-opacity-10 text-primary",
  };
  const cls = colorMap[label] || "bg-secondary bg-opacity-10 text-secondary";
  return (
    <span className={`badge rounded-pill px-3 py-2 fw-semibold ${cls}`} style={{ fontSize: 12 }}>
      ● {label}
    </span>
  );
}


const formatJobDate = (dateString) => {
    if (!dateString) return "Date unavailable";

    const [month, day, year] = dateString.split("/");

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};
// ── SectionTitle ──────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-3">
      <div className="bg-primary rounded-2 flex-shrink-0" style={{ width: 4, height: 18 }} />
      <span className="text-uppercase fw-bold text-dark small" style={{ letterSpacing: "0.07em" }}>
        {children}
      </span>
    </div>
  );
}

// ── FieldLabel ────────────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <label className="form-label text-uppercase fw-semibold text-secondary mb-1" style={{ fontSize: 10, letterSpacing: "0.06em" }}>
      {children}
    </label>
  );
}

// ── InfoCard ──────────────────────────────────────────────────────────────────
function InfoCard({ icon, label, value, mono }) {
  return (
    <div className="d-flex align-items-start gap-3 p-3 bg-white rounded-3 border h-100">
      <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3 flex-shrink-0"
        style={{ width: 36, height: 36, fontSize: 16 }}>
        {icon}
      </div>
      <div className="overflow-hidden">
        <div className="text-uppercase text-secondary fw-semibold mb-1" style={{ fontSize: 10, letterSpacing: "0.06em" }}>{label}</div>
        <div className={`fw-semibold text-dark small ${mono ? "font-monospace" : ""}`} style={{ wordBreak: "break-all" }}>
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

// ── AmountCard ────────────────────────────────────────────────────────────────
function AmountCard({ label, value, accent }) {
  return (
    <div className={`rounded-3 p-3 h-100 ${accent ? "bg-dark" : "bg-white border"}`}>
      <div className={`text-uppercase fw-semibold mb-2 small`}
        style={{ fontSize: 10, letterSpacing: "0.07em", color: accent ? "rgba(255,255,255,0.55)" : "#8c8c8c" }}>
        {label}
      </div>
      <div className={`fw-bold font-monospace ${accent ? "text-white" : "text-dark"}`}
        style={{ fontSize: accent ? 20 : 17 }}>
        ${fmt(value || 0)}
      </div>
    </div>
  );
}



// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuoteDetailPage() {
  const [form, setForm] = useState(null);
  const [services, setServices] = useState(null);
  const [serviceDropOpen, setServiceDropOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [serviceSearch, setServiceSearch] = useState("");
  const [quoteAssigns, setQuoteAssigns] = useState([]);
  const [selectedQuoteAssignId, setSelectedQuoteAssignId] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(false);

  const params = useParams();
  const id = params?.id;

  const getData = async () => {
    try {
      setLoading(true);
      setLoadingJobs(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("response", response);
      if (!response.data.success) throw new Error(response.data.message || "Failed to load quote");
      setForm(response.data.data);
      console.log("QUOTATION TYPE:", response.data.data.quotationType);
      console.log("FULL FORM:", response.data.data);

      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product`,
        {
          header: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log("res", res);
      if (!res.data.success) throw new Error(response.data.message || "Failed to load services");
      setServices(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const getCompletedJobs = async () => {
    try {
        setLoadingJobs(true);

        const token = localStorage.getItem("authToken");

        console.log("Fetching completed jobs for Quote ID:", id);

        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote-assign/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("JOB API STATUS:", response.status);
        console.log("JOB API RESPONSE:", response.data);

        const jobs = response.data?.data;

        console.log("JOBS:", jobs);
        console.log("IS ARRAY:", Array.isArray(jobs));

        if (Array.isArray(jobs)) {
            setQuoteAssigns(jobs);
        } else {
            console.error("Job data is not an array:", jobs);
            setQuoteAssigns([]);
        }

    } catch (error) {
        console.error("FAILED TO LOAD JOBS:", error);
        setQuoteAssigns([]);
    } finally {
        setLoadingJobs(false);
    }
};

  useEffect(() => {
    if (!id) return;
    getData();
  }, [id]);

  useEffect(() => {
    if (id) {
        getCompletedJobs();
    }
}, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const recalc = (services, advance, quotedOverride = null) => {
    const calc = services.reduce((s, sv) => s + (Number(sv?.quotedPrice || sv?.price) || 0) * (sv.qty || 1), 0);
    const quoted = quotedOverride !== null ? quotedOverride : calc;
    return {
      calculatedAmount: calc,
      quotatedAmount: quoted,
      dueAmount: quoted - Number(advance || 0),
    };
  };

  const addService = (svc) => {
    if ((form.services || []).some(s => s.id === svc.id)) return;
    const updated = [...(form.services || []), { ...svc, quotedPrice: svc.price, qty: 1 }];
    setForm(f => ({ ...f, services: updated, ...recalc(updated, f.advanceAmount) }));
    setServiceDropOpen(false);
  };

  const removeService = (idx) => {
    const serviceName = form.services[idx]?.name || "this service";
    const confirmed = window.confirm(`Remove "${serviceName}" from services?`);
    if (!confirmed) return;

    const updated = (form.services || []).filter((_, i) => i !== idx);
    setForm(f => ({ ...f, services: updated, ...recalc(updated, f.advanceAmount) }));
  };

  const handleAdvanceChange = (val) => {
    const advance = parseFloat(val) || 0;
    setForm(f => ({ ...f, advanceAmount: advance, dueAmount: (f.quotatedAmount || 0) - advance }));
  };

  const handleSave = async () => {
    try {
      console.table(form);
      setSaving(true);
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/quote/${id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.data.success) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="text-center text-secondary">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="small fw-semibold mb-0">Loading quote...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="text-center">
        <div className="fs-1 mb-2">⚠️</div>
        <p className="text-danger fw-semibold mb-3">{error}</p>
        <button className="btn btn-outline-danger rounded-3" onClick={getData}>Retry</button>
      </div>
    </div>
  );

  if (!form) return null;

  // build invoice from state
  function buildInvoiceFromState() {
    return {
      id: `${Date.now()}`,
      invoiceNo: `${Date.now()}`,
      clientName: form.name,
      address: form.address,
      zip: form.zip,
      advanceAmount: form.advanceAmount,
      quotatedAmount: form.quotatedAmount,
      dueAmount: form.dueAmount,
      services: form.services
        .filter((r) => r.serviceId || r.name) // skip empty rows
        .map((r) => ({
          name: r.name || r.serviceId,
          note: r.note || 1,
          price: parseFloat(r.price || r.base) || 0,
          quotedPrice: parseFloat(r.quotedPrice || r.price || r.base) || 0,
        })),
      total: form.services.filter((r) => r.serviceId || r.name).reduce((acc, num) => acc + parseFloat(num.quotedPrice || 0), 0).toFixed(2),
    };
  }

  function calcTotals(quote) {
    const total = quote.services.reduce(
      (sum, s) => sum + Number(s.quotedPrice),
      0
    );

    return { total };
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

    const total = (quote.quotatedAmount);

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
    doc.text("Invoice", R, y, { align: "right" });

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
    doc.text(`$${Number(quote.dueAmount || 0).toFixed(2)}`, R, y + 19.5, { align: "right" });

    // ── SERVICES TABLE ────────────────────────────────────────────────
    y += 40;

    doc.autoTable({
      startY: y,
      head: [["Item", "Rate", "Amount"]],
      body: quote.services.map((s) => [
        `${s.name}${s.note ? "\n" + s.note : ""}`,
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

    // Total row
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text("Total:", R - 40, ty);
    doc.setTextColor(...DARK);
    doc.text(`A$${Number(total).toFixed(2)}`, R, ty, { align: "right" });

    ty += 7;
    doc.setTextColor(...MUTED);
    doc.text("Advance Amount:", R - 40, ty);
    doc.setTextColor(...DARK);
    doc.text(`A$${Number(quote.advanceAmount).toFixed(2)}`, R, ty, { align: "right" });

    ty += 7;
    doc.setTextColor(...MUTED);
    doc.text("Due Amount:", R - 40, ty);
    doc.setTextColor(...DARK);
    doc.text(`A$${Number(quote.dueAmount).toFixed(2)}`, R, ty, { align: "right" });

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



    // const blob = doc.output("blob");
    // const url = URL.createObjectURL(blob);

    // const newTab = window.open("", "_blank");

    // if (!newTab) {
    //   alert("Popup blocked! Please allow popups.");
    //   return;
    // }

    // newTab.document.write(`
    // <html>
    // <head>
    //     <title>Invoice Preview</title>
    //     <style>
    //         body { margin:0; font-family:Arial; background:#f4f6f9; }
    //         .topbar {
    //             padding:10px;
    //             background:#fff;
    //             border-bottom:1px solid #ddd;
    //             display:flex;
    //             justify-content:space-between;
    //         }
    //         button {
    //             padding:6px 12px;
    //             border:none;
    //            borderRadius:6px;
    //             cursor:pointer;
    //         }
    //         .download { background:#0d6efd; color:#fff; }
    //         .print { background:#198754; color:#fff; }
    //         iframe { width:100%; height:calc(100vh - 50px); border:none; }
    //     </style>
    // </head>
    // <body>

    //     <div class="topbar">
    //         <div><b>Invoice Preview</b></div>
    //         <div>
    //             <button class="download" onclick="download()">Download</button>
    //             <button class="print" onclick="printPdf()">Print</button>
    //         </div>
    //     </div>

    //     <iframe src="${url}"></iframe>

    //     <script>
    //         function download() {
    //             const a = document.createElement('a');
    //             a.href = "${url}";
    //             a.download = "Invoice.pdf;
    //             a.click();
    //         }
    //         function printPdf() {
    //             document.querySelector('iframe').contentWindow.print();
    //         }
    //     </script>

    // </body>
    // </html>
    // `);

    // ── SAVE ─────────────────────────────────────────────────────────
    doc.save(`Receipt_${quote.id}_${quote.clientName.replace(/\s+/g, "_")}.pdf`);
  }

  const handleInvoiceDownload = async () => {
    try {


      // Recurring quote must have a completed job selected
        if (
          form?.quotationType?.trim()?.toLowerCase() === "recurring" &&
          !selectedQuoteAssignId
        ) {
          alert("Please select a completed job before creating the invoice.");
          return;
        }

        setSaving(true);
        const token = localStorage.getItem("authToken");
            console.log("Creating invoice...");

            const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoice`,
                  { 
                    data: {
                      ...form,
                      quoteAssignId: selectedQuoteAssignId
                        ? Number(selectedQuoteAssignId)
                        : null,
                    },
                  }, // ✅ body
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  } // ✅ config
               );  

          console.log("INVOICE RESPONSE:", response.data);

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Failed to create invoice"
          );
        }

            // Only generate PDF after successful invoice creation
             const quote = buildInvoiceFromState();

             await generateInvoicePDF(quote);

             setSaved(true);

             setTimeout(() => {setSaved(false);}, 2500);

   }
      catch (error) {
      console.error("Invoice creation error:", error);

      console.log( error.response?.data?.message ||error.message || "Failed to create invoice");
    }
    finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}

      <div className="container-lg py-4">

        {/* ── Amount summary ───────────────────────────────────────────────── */}
        <div className="row g-3 mb-4">
          {[
            { label: "Calculated", value: form.calculatedAmount },
            { label: "Quoted", value: form.quotatedAmount },
            { label: "Advance", value: form.advanceAmount },
            { label: "Due Amount", value: form.dueAmount, accent: false },
          ].map(({ label, value, accent }) => (
            <div key={label} className="col-6 col-md-3">
              <AmountCard label={label} value={value} accent={accent} />
            </div>
          ))}
        </div>
{/* ── Job Selection ─────────────────────────────────────── */}
{form?.quotationType?.trim()?.toLowerCase() === "recurring" && (
    <div className="bg-white border rounded-3 p-4 mb-3">
        <SectionTitle>Select Completed Job</SectionTitle>

        <select
    className="form-select form-select-sm rounded-3"
    value={selectedQuoteAssignId}
    onChange={(e) => setSelectedQuoteAssignId(e.target.value)}
    disabled={loadingJobs}
>
    <option value="">
        {loadingJobs ? "Loading completed jobs..." : "Select a completed job"}
    </option>

    {quoteAssigns.map((job) => (
        <option key={job.id} value={job.id}>
            {formatJobDate(job.time)} — Job #{job.id} (Completed)
        </option>
    ))}
</select>
    </div>
)}


        {/* ── Client information ───────────────────────────────────────────── */}
        <div className="bg-white border rounded-3 p-4 mb-3">
          <SectionTitle>Client Information</SectionTitle>
          <div className="row g-3">
            <div className="col-md-6">
              <FieldLabel>Client Name</FieldLabel>
              <input className="form-control form-control-sm rounded-3" value={form.name || ""}
                onChange={e => set("clientName", e.target.value)} placeholder="Full name" />
            </div>
            <div className="col-md-6">
              <FieldLabel>Email Address</FieldLabel>
              <input className="form-control form-control-sm rounded-3" type="email" value={form.email || ""}
                onChange={e => set("email", e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="col-md-4">
              <FieldLabel>Mobile</FieldLabel>
              <input className="form-control form-control-sm rounded-3" value={form.phone || ""}
                onChange={e => set("mobile", e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="col-md-5">
              <FieldLabel>Address</FieldLabel>
              <input className="form-control form-control-sm rounded-3" value={form.address || ""}
                onChange={e => set("address", e.target.value)} placeholder="Street address" />
            </div>
            <div className="col-md-3">
              <FieldLabel>Post Code</FieldLabel>
              <input className="form-control form-control-sm rounded-3" value={form.zip || ""}
                onChange={e => set("zip", e.target.value)} placeholder="00000" />
            </div>
          </div>
        </div>

        {/* ── Assignment & Schedule ────────────────────────────────────────── */}
        {form.assignerName && (<div className="bg-white border rounded-3 p-4 mb-3">
          <SectionTitle>Assignment & Schedule</SectionTitle>
          <div className="row g-3">
            <div className="col-6 col-md-3">
              <InfoCard icon="👤" label="Assignee" value={form.assignerName} />
            </div>
            <div className="col-6 col-md-3">
              <InfoCard icon="📧" label="Assignee Email" value={form.assignerEmail} mono />
            </div>
            <div className="col-6 col-md-3">
              <InfoCard icon="⏱️" label="Time Taken" value={`${((form.totalTimeTaken || 0) / 60).toFixed(2)} hours`} />
            </div>
            <div className="col-6 col-md-3">
              <FieldLabel>Scheduled Date</FieldLabel>
              <input className="form-control form-control-sm rounded-3" type="date"
                value={form.scheduledDate || ""} onChange={e => set("scheduledDate", e.target.value)} />
            </div>
          </div>
        </div>)}

        {/* ── Services ─────────────────────────────────────────────────────── */}
        <div className="bg-white border rounded-3 p-4 mb-3">
          <SectionTitle>Services</SectionTitle>

          <div className="d-flex flex-column gap-2 mb-3">
            {(form.services || []).map((s, i) => (
              <div
                key={i}
                className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 px-2 px-md-3 py-2 rounded-3 border bg-light"
              >
                {/* LEFT */}
                <div className="d-flex align-items-start gap-2 w-100 overflow-hidden">
                  <span
                    className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-2 fw-bold flex-shrink-0 small"
                    style={{ width: 26, height: 26 }}
                  >
                    {i + 1}
                  </span>

                  <div className="flex-grow-1 overflow-hidden">
                    {/* NAME (truncate hard) */}
                    <div className="fw-semibold text-dark small text-truncate">
                      {s.name}
                    </div>

                    {/* NOTE INPUT */}
                    <input
                      className="form-control form-control-sm mt-1"
                      placeholder="Enter note"
                      type="text"
                      value={s.note || ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        setForm((prev) => {
                          const updatedServices = [...(prev.services || [])];
                          updatedServices[i] = {
                            ...updatedServices[i],
                            note: value,
                          };

                          return {
                            ...prev,
                            services: updatedServices,
                          };
                        });
                      }}
                    />
                  </div>
                </div>

                {/* RIGHT */}
                <div className="d-flex align-items-center justify-content-between w-100 w-md-auto gap-2">
                  <div className="text-truncate" style={{ maxWidth: "120px" }}>
                    <input
                      type="number"
                      className="form-control form-control-sm text-end font-monospace"
                      value={s?.quotedPrice || s?.price || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setForm((prev) => {
                          const updatedServices = [...(prev.services || [])];
                          updatedServices[i] = { ...updatedServices[i], quotedPrice: value };
                          return {
                            ...prev,
                            services: updatedServices,
                            ...recalc(updatedServices, prev.advanceAmount), // ✅ recalculate financials
                          };
                        });
                      }}
                    />
                  </div>

                  <button
                    className="btn btn-sm btn-outline-danger rounded-circle p-1 flex-shrink-0"
                    style={{ width: 26, height: 26, fontSize: "12px" }}
                    onClick={() => removeService(i)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add service dropdown */}
          <div className="position-relative">
            <button type="button"
              className="btn btn-outline-primary rounded-3 w-100 fw-semibold"
              style={{ borderStyle: "dashed" }}
              onClick={() => setServiceDropOpen(p => !p)}
            >
              ＋ Add Service
            </button>

            {serviceDropOpen && (
              <>
                <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 40 }}
                  onClick={() => { setServiceDropOpen(false); setServiceSearch(""); }} />

                <div className="position-absolute start-0 end-0 bg-white border rounded-3 shadow"
                  style={{ zIndex: 50, top: "calc(100% + 6px)" }}>

                  {/* Search bar — sticky at top */}
                  <div className="p-2 border-bottom">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0 text-secondary">🔍</span>
                      <input
                        type="text"
                        className="form-control border-start-0 rounded-end-3"
                        placeholder="Search services..."
                        value={serviceSearch}
                        onChange={e => setServiceSearch(e.target.value)}
                        onClick={e => e.stopPropagation()} // prevent backdrop from firing
                        autoFocus
                      />
                      {serviceSearch && (
                        <button className="btn btn-sm btn-outline-secondary border-0" onClick={() => setServiceSearch("")}>✕</button>
                      )}
                    </div>
                  </div>

                  {/* Filtered list */}
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {services
                      .filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                      .map((s) => {
                        const isSelected = (form.services || []).some(fs => fs.id === s.id);
                        return (
                          <div key={s.id}
                            className={`d-flex align-items-center justify-content-between px-3 py-2 ${isSelected ? "bg-light" : ""}`}
                            style={{ cursor: isSelected ? "not-allowed" : "pointer", borderBottom: "1px solid #f0f0f0", opacity: isSelected ? 0.6 : 1 }}
                            onClick={() => !isSelected && addService(s)}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.classList.add("bg-primary", "bg-opacity-10"); }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.classList.remove("bg-primary", "bg-opacity-10"); }}
                          >
                            <div>
                              <div className="fw-semibold text-dark small">{s.name}</div>
                              <div className="text-secondary" style={{ fontSize: 11 }}>per {s.unit}</div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-semibold text-primary font-monospace small">${fmt(s.price)}</span>
                              {isSelected && <span className="text-success fw-bold small">✓</span>}
                            </div>
                          </div>
                        );
                      })}

                    {/* Empty state */}
                    {services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 && (
                      <div className="text-center text-secondary small py-3">No services found</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Financials ───────────────────────────────────────────────────── */}
        <div className="bg-white border rounded-3 p-4 mb-3">
          <SectionTitle>Financials</SectionTitle>
          <div className="row g-3">
            <div className="col-md-6">
              <FieldLabel>Calculated Amount</FieldLabel>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-primary bg-opacity-10 text-primary fw-bold border-end-0">$</span>
                <input className="form-control font-monospace border-start-0 rounded-end-3" type="number" disabled value={form.calculatedAmount || 0} />
              </div>
            </div>
            <div className="col-md-6">
              <FieldLabel>Quoted Amount</FieldLabel>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-primary bg-opacity-10 text-primary fw-bold border-end-0">$</span>
                <input className="form-control font-monospace border-start-0 rounded-end-3" type="number"
                  value={form.quotatedAmount || 0}
                  onChange={e => { const v = parseFloat(e.target.value) || 0; setForm(f => ({ ...f, quotatedAmount: v, dueAmount: v - (f.advanceAmount || 0) })); }} />
              </div>
            </div>
            <div className="col-md-6">
              <FieldLabel>Advance Amount</FieldLabel>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-primary bg-opacity-10 text-primary fw-bold border-end-0">$</span>
                <input className="form-control font-monospace border-start-0 rounded-end-3" type="number"
                  value={form.advanceAmount || 0} onChange={e => handleAdvanceChange(e.target.value)} />
              </div>
            </div>
            <div className="col-md-6">
              <FieldLabel>
                Due Amount{" "}
                <span className="text-success ms-1" style={{ fontSize: 9 }}>● auto</span>
              </FieldLabel>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-success bg-opacity-10 text-success fw-bold border-end-0">$</span>
                <input
                  className={`form-control font-monospace border-start-0 rounded-end-3 ${(form.dueAmount || 0) < 0 ? "text-danger" : ""}`}
                  type="number" disabled value={form.dueAmount || 0} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer actions ────────────────────────────────────────────────── */}
        <div className="d-flex justify-content-end gap-2 pb-4">
          <button className="btn btn-outline-secondary rounded-3 px-4" onClick={() => handleInvoiceDownload()}>Invoice</button>
          <button
            className={`btn rounded-3 px-4 fw-semibold ${saved ? "btn-success" : "btn-dark"}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving...</>
              : saved ? "✓ Saved!" : "Save Changes"
            }
          </button>
        </div>

      </div>
    </div>
  );
}