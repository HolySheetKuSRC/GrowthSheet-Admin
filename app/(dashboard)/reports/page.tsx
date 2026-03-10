"use client";

import { useEffect, useState } from "react";
import {
    sheetReportService,
    SheetReportResponse,
} from "@/services/sheetReportService";

export default function ReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("PENDING");

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [sheetHistoryOpen, setSheetHistoryOpen] = useState(false);

    const [selectedReport, setSelectedReport] =
        useState<SheetReportResponse | null>(null);

    const [sheetReports, setSheetReports] = useState<SheetReportResponse[]>([]);

    const [adminNote, setAdminNote] = useState("");
    const [actionType, setActionType] = useState<"DISMISS" | "SUSPEND">(
        "SUSPEND"
    );

    const [submitting, setSubmitting] = useState(false);

    const reports: SheetReportResponse[] = data?.content || [];

    const statusColor: any = {
        PENDING: "bg-yellow-100 text-yellow-700",
        REVIEWED: "bg-red-100 text-red-700",
        DISMISSED: "bg-gray-100 text-gray-700",
    };

    const fetchReports = async (status = statusFilter) => {
        setLoading(true);
        try {
            const res = await sheetReportService.getReports(status, 0, 50);
            setData(res);
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const openReviewModal = (report: SheetReportResponse) => {
        setSelectedReport(report);
        setAdminNote("");
        setActionType("SUSPEND");
        setReviewModalOpen(true);
    };

    const openPdf = (report: SheetReportResponse) => {
        setSelectedReport(report);
        setPdfModalOpen(true);
    };

    const openSheetReports = async (sheetId: string) => {
        try {
            const res = await sheetReportService.getReportsBySheet(sheetId);
            setSheetReports(res.content || []);
            setSheetHistoryOpen(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReviewSubmit = async () => {
        if (!selectedReport) return;

        if (actionType === "DISMISS" && !adminNote.trim()) {
            alert("กรุณาระบุหมายเหตุ");
            return;
        }

        try {
            setSubmitting(true);

            await sheetReportService.reviewReport(selectedReport.id, {
                status: actionType === "SUSPEND" ? "REVIEWED" : "DISMISSED",
                adminNote: adminNote.trim(),
                suspendSheet: actionType === "SUSPEND",
            });

            alert("ตรวจสอบสำเร็จ");

            setReviewModalOpen(false);
            setSelectedReport(null);

            fetchReports();
        } catch (err: any) {
            alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 p-4">

            {/* HEADER */}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Sheet Reports</h1>
                    <p className="text-gray-500">ตรวจสอบชีทที่ถูก Report</p>
                </div>

                <div className="flex gap-4">

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            fetchReports(e.target.value);
                        }}
                        className="border px-3 py-2 rounded-lg"
                    >
                        <option value="">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="DISMISSED">Dismissed</option>
                    </select>

                    <div className="bg-white px-4 py-2 rounded-xl border">
                        Pending : {data?.totalElements || 0}
                    </div>

                </div>
            </div>

            {/* TABLE */}

            <div className="bg-white rounded-2xl shadow border overflow-hidden">

                <table className="w-full text-left">

                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4">Sheet</th>
                            <th className="px-6 py-4">Reporter</th>
                            <th className="px-6 py-4">Reason</th>
                            <th className="px-6 py-4">File</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {loading && (
                            <tr>
                                <td colSpan={6} className="p-10 text-center">
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {!loading && reports.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-10 text-center">
                                    ไม่มีรายการ
                                </td>
                            </tr>
                        )}

                        {reports.map((report) => (

                            <tr key={report.id} className="border-t hover:bg-gray-50">

                                {/* SHEET */}

                                <td className="px-6 py-4">

                                    <div className="flex flex-col">

                                        <span className="font-semibold">
                                            {report.sheetId?.substring(0, 8)}
                                        </span>

                                        <button
                                            onClick={() =>
                                                navigator.clipboard.writeText(report.sheetId)
                                            }
                                            className="text-xs text-blue-500"
                                        >
                                            Copy ID
                                        </button>

                                        <button
                                            onClick={() => openSheetReports(report.sheetId)}
                                            className="text-xs text-purple-600"
                                        >
                                            ดู reports ทั้งหมด
                                        </button>

                                    </div>

                                </td>

                                {/* REPORTER */}

                                <td className="px-6 py-4">
                                    {report.reporterId?.substring(0, 8) || "-"}
                                </td>

                                {/* REASON */}

                                <td className="px-6 py-4 max-w-xs break-words">
                                    {report.reason}
                                </td>

                                {/* FILE */}

                                <td className="px-6 py-4">

                                    {report.fileUrl && (

                                        <button
                                            onClick={() => openPdf(report)}
                                            className="text-blue-600"
                                        >
                                            ดู PDF
                                        </button>

                                    )}

                                </td>

                                {/* STATUS */}

                                <td className="px-6 py-4">

                                    <span
                                        className={`px-2 py-1 text-xs rounded ${statusColor[report.status]}`}
                                    >
                                        {report.status}
                                    </span>

                                </td>

                                {/* ACTION */}

                                <td className="px-6 py-4 text-center">

                                    {report.status === "PENDING" && (

                                        <button
                                            onClick={() => openReviewModal(report)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg"
                                        >
                                            REVIEW
                                        </button>

                                    )}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* REVIEW MODAL */}

            {reviewModalOpen && selectedReport && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

                    <div className="bg-white p-6 rounded-xl w-[500px]">

                        <h2 className="text-xl font-bold mb-4">Review Report</h2>

                        <p className="mb-4">{selectedReport.reason}</p>

                        <div className="space-y-3">

                            <label className="flex gap-2">
                                <input
                                    type="radio"
                                    checked={actionType === "SUSPEND"}
                                    onChange={() => setActionType("SUSPEND")}
                                />
                                Suspend Sheet
                            </label>

                            <label className="flex gap-2">
                                <input
                                    type="radio"
                                    checked={actionType === "DISMISS"}
                                    onChange={() => setActionType("DISMISS")}
                                />
                                Dismiss
                            </label>

                        </div>

                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Admin note"
                            className="border w-full mt-4 p-2 rounded"
                        />

                        <div className="flex justify-end gap-3 mt-6">

                            <button
                                onClick={() => setReviewModalOpen(false)}
                                className="border px-4 py-2 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleReviewSubmit}
                                disabled={submitting}
                                className="bg-black text-white px-4 py-2 rounded"
                            >
                                {submitting ? "Saving..." : "Confirm"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {pdfModalOpen && selectedReport && (
                <div className="fixed inset-0  bg-black/70 flex items-center justify-center z-50">

                    <div className="bg-white w-[1100px] max-w-[92vw] h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">

                        {/* HEADER */}
                        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">

                            <div className="font-semibold">
                                PDF Preview
                            </div>

                            <button
                                onClick={() => setPdfModalOpen(false)}
                                className="text-gray-500 hover:text-black"
                            >
                                Close
                            </button>

                        </div>

                        {/* PDF VIEWER */}
                        <div className="flex-1">

                            <iframe
                                src={selectedReport.fileUrl}
                                className="w-full h-full border-0"
                            />

                        </div>

                    </div>

                </div>
            )}

            {/* SHEET REPORT HISTORY */}

            {sheetHistoryOpen && (

                <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

                    <div className="bg-white w-[700px] p-6 rounded-xl">

                        <h2 className="text-xl font-bold mb-4">
                            Reports ของ Sheet นี้
                        </h2>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto">

                            {sheetReports.map((r) => (

                                <div
                                    key={r.id}
                                    className="border rounded-lg p-3"
                                >

                                    <div className="text-sm font-semibold">
                                        Reporter : {r.reporterId?.substring(0, 8)}
                                    </div>

                                    <div className="text-sm">
                                        Reason : {r.reason}
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        {new Date(r.createdAt).toLocaleString()}
                                    </div>

                                    {r.adminId && (
                                        <div className="text-xs text-red-500 mt-1">
                                            Reviewed by Admin : {r.adminId.substring(0, 8)}
                                        </div>
                                    )}

                                </div>

                            ))}

                        </div>

                        <div className="flex justify-end mt-4">

                            <button
                                onClick={() => setSheetHistoryOpen(false)}
                                className="border px-4 py-2 rounded"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}