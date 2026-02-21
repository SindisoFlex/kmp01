import { jsPDF } from "jspdf";
import type { InvoiceWithBookingAndUser } from "@/types/invoice";
import { formatCurrency, formatDateTime } from "@/utils/formatting";

/**
 * Generate and download a branded PDF invoice.
 */
export const generateInvoicePdf = (invoice: InvoiceWithBookingAndUser): void => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // ── Brand header ──────────────────────────────────────────────────
    doc.setFillColor(17, 24, 39); // slate-900
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Kasilam Media Production", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text("Professional Photography · Videography · Digital Services", margin, 27);
    doc.text("info@kasilammedia.co.za | www.kasilammedia.co.za", margin, 33);

    y = 52;

    // ── Invoice title ─────────────────────────────────────────────────
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("INVOICE", margin, y);

    // Invoice number (right-aligned)
    doc.setFontSize(12);
    doc.text(invoice.invoice_number, pageWidth - margin, y, { align: "right" });
    y += 12;

    // ── Status badge ──────────────────────────────────────────────────
    const isPaid = invoice.status === "paid";
    doc.setFillColor(isPaid ? 34 : 234, isPaid ? 197 : 179, isPaid ? 94 : 8);
    doc.roundedRect(margin, y - 5, 28, 8, 2, 2, "F");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(isPaid ? "PAID" : "PENDING", margin + 14, y, { align: "center" });
    y += 12;

    // ── Date info ─────────────────────────────────────────────────────
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const dateRows = [
        ["Issued:", formatDateTime(invoice.issued_at)],
        ["Paid:", invoice.paid_at ? formatDateTime(invoice.paid_at) : "—"],
        ["Generated:", new Date().toLocaleDateString("en-ZA")],
    ];

    dateRows.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, margin + 30, y);
        y += 6;
    });

    y += 6;

    // ── Billed To ─────────────────────────────────────────────────────
    drawSectionHeader(doc, "Billed To", margin, y, contentWidth);
    y += 8;

    const clientRows = [
        ["Name:", invoice.userProfile?.name || "N/A"],
        ["Email:", invoice.userProfile?.email || "N/A"],
        ["Phone:", invoice.userProfile?.phone || "N/A"],
    ];

    doc.setFontSize(10);
    clientRows.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text(label, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, margin + 24, y);
        y += 6;
    });

    y += 6;

    // ── Booking Details ───────────────────────────────────────────────
    drawSectionHeader(doc, "Booking Details", margin, y, contentWidth);
    y += 8;

    const booking = invoice.booking;
    const bookingRows = [
        ["Service:", booking?.type || "N/A"],
        ["Category:", booking?.category || "N/A"],
        ["Date:", booking?.date_time ? formatDateTime(booking.date_time) : "N/A"],
        ["Location:", booking?.location || "N/A"],
    ];

    doc.setFontSize(10);
    bookingRows.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text(label, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(value), margin + 30, y);
        y += 6;
    });

    y += 10;

    // ── Amount box ────────────────────────────────────────────────────
    doc.setFillColor(243, 244, 246); // gray-100
    doc.roundedRect(margin, y - 5, contentWidth, 22, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("Total Amount Due", margin + 6, y + 4);

    doc.setFontSize(16);
    doc.text(
        formatCurrency(Number(invoice.amount) || 0, invoice.currency || "ZAR"),
        pageWidth - margin - 6,
        y + 5,
        { align: "right" }
    );
    y += 30;

    // ── Footer ────────────────────────────────────────────────────────
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("This invoice was generated electronically and is valid without a signature.", margin, footerY);
    doc.text(`Ref: ${invoice.booking_id}`, pageWidth - margin, footerY, { align: "right" });

    // ── Save ──────────────────────────────────────────────────────────
    doc.save(`${invoice.invoice_number}.pdf`);
};

// ── helpers ───────────────────────────────────────────────────────────
function drawSectionHeader(doc: jsPDF, title: string, x: number, y: number, width: number) {
    doc.setFillColor(17, 24, 39);
    doc.rect(x, y - 4, width, 0.7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(title, x, y + 2);
}
