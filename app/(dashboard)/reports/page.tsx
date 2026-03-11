"use client";

import { useEffect, useState } from "react";
import {
  sheetReportService,
  SheetReportResponse,
} from "@/services/sheetReportService";

type StatusFilter = "ALL" | "PENDING" | "REVIEWED" | "DISMISSED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "ทั้งหมด",    value: "ALL" },
  { label: "รอตรวจสอบ", value: "PENDING" },
  { label: "ดำเนินการแล้ว", value: "REVIEWED" },
  { label: "ยกเลิก",    value: "DISMISSED" },
];

const TAB_ACTIVE_COLOR: Record<StatusFilter, string> = {
  ALL:       "bg-gray-800  text-white border-gray-800  shadow-md",
  PENDING:   "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100",
  REVIEWED:  "bg-red-600   text-white border-red-600   shadow-md shadow-red-100",
  DISMISSED: "bg-gray-500  text-white border-gray-500  shadow-md",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "รอตรวจสอบ",     className: "bg-amber-100 text-amber-700 border border-amber-200" },
  REVIEWED:  { label: "ดำเนินการแล้ว", className: "bg-red-100   text-red-700   border border-red-200"   },
  DISMISSED: { label: "ยกเลิก",        className: "bg-gray-100  text-gray-600  border border-gray-200"  },
};

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("PENDING");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const [reviewModalOpen, setReviewModalOpen]       = useState(false);
  const [pdfModalOpen, setPdfModalOpen]             = useState(false);
  const [sheetHistoryOpen, setSheetHistoryOpen]     = useState(false);

  const [selectedReport, setSelectedReport]         = useState<SheetReportResponse | null>(null);
  const [sheetReports, setSheetReports]             = useState<SheetReportResponse[]>([]);

  const [adminNote, setAdminNote]                   = useState("");
  const [actionType, setActionType]                 = useState<"SUSPEND" | "DISMISS">("SUSPEND");
  const [submitting, setSubmitting]                 = useState(false);

  const reports: SheetReportResponse[] = data?.content || [];
  const totalPages  = data?.totalPages  ?? 0;
  const totalItems  = data?.totalElements ?? 0;

  const fetchReports = async (status: StatusFilter, page = 0) => {
    setLoading(true);
    try {
      const statusParam = status !== "ALL" ? status : "";
      const res = await sheetReportService.getReports(statusParam, page, pageSize);
      setData(res);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    fetchReports(activeTab, 0);
  }, [activeTab]);

  useEffect(() => {
    fetchReports(activeTab, currentPage);
  }, [currentPage]);

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
      fetchReports(activeTab, currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("th-TH", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="space-y-6 p-4 md:p-6 relative max-w-[1600px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Sheet Reports</h1>
          <p className="text-gray-500 mt-1 font-medium">ตรวจสอบชีทที่ถูก Report</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
          <span className="text-sm text-gray-500">ทั้งหมด: </span>
          <span className="text-lg font-bold text-amber-500">{totalItems}</span>
        </div>
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              activeTab === tab.value
                ? TAB_ACTIVE_COLOR[tab.value]
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {/* เพิ่ม min-w เพื่อกันการซ้อนกันของข้อมูล */}
          <table className="w-full text-left min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sheet ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ผู้ Report</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">เหตุผล</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">วันที่</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                       <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                       กำลังดึงข้อมูล...
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>ไม่มีรายการ</span>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-gray-900 font-mono text-xs bg-gray-50 px-2 py-1 rounded-md w-fit">
                          {report.sheetId?.substring(0, 10)}...
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                                navigator.clipboard.writeText(report.sheetId);
                                alert("คัดลอก ID แล้ว");
                            }}
                            className="text-[10px] font-bold text-blue-500 hover:underline"
                          >
                            COPY
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => openSheetReports(report.sheetId)}
                            className="text-[10px] font-bold text-purple-600 hover:underline"
                          >
                            ดูประวัติ
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs text-gray-600">
                        {report.reporterId?.substring(0, 10)}...
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-600 max-w-[280px] leading-relaxed break-words">
                        {report.reason}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500 whitespace-nowrap">
                      {report.createdAt ? formatDate(String(report.createdAt)) : "-"}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        STATUS_BADGE[report.status]?.className ?? "bg-gray-100 text-gray-500"
                      }`}>
                        {STATUS_BADGE[report.status]?.label ?? report.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center items-center gap-2">
                        {report.fileUrl && (
                          <button
                            onClick={() => openPdf(report)}
                            className="group flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            PDF
                          </button>
                        )}
                        {report.status === "PENDING" ? (
                          <button
                            onClick={() => openReviewModal(report)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-red-100 transition-all active:scale-95"
                          >
                            REVIEW
                          </button>
                        ) : (
                          report.adminNote && (
                            <span className="text-[10px] text-gray-400 italic bg-gray-50 px-2 py-1 rounded max-w-[120px] truncate" title={report.adminNote}>
                              Note: {report.adminNote}
                            </span>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <p className="text-xs text-gray-500">
              หน้า <span className="font-bold text-gray-900">{currentPage + 1}</span> / {totalPages} 
              <span className="ml-1">({totalItems} รายการ)</span>
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white disabled:opacity-30 transition-all"
              >
                PREV
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter(i => Math.abs(i - currentPage) <= 1)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                        currentPage === p
                          ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                          : "bg-white border border-gray-200 text-gray-500"
                      }`}
                    >
                      {p + 1}
                    </button>
                  ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white disabled:opacity-30 transition-all"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ───────────── MODALS (คงเดิม ปรับสไตล์เล็กน้อย) ───────────── */}
      {/* ... (Review Modal, PDF Modal, History Modal เหมือนเดิมแต่ปรับ padding ให้กระชับ) ... */}
      
      {reviewModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Review Report</h2>
                <p className="text-xs text-gray-400 font-mono">ID: {selectedReport.sheetId}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Reason</p>
              <p className="text-sm text-gray-700 leading-relaxed italic">"{selectedReport.reason}"</p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-bold text-gray-800">เลือกการดำเนินการ:</p>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => setActionType("SUSPEND")} 
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${actionType === "SUSPEND" ? "border-red-500 bg-red-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${actionType === "SUSPEND" ? "text-red-700" : "text-gray-700"}`}>Suspend Sheet</p>
                    <p className="text-[10px] text-gray-500">ปิดการขายและระงับชีท</p>
                  </div>
                  {actionType === "SUSPEND" && <div className="w-2 h-2 rounded-full bg-red-500" />}
                </button>
                <button onClick={() => setActionType("DISMISS")}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${actionType === "DISMISS" ? "border-gray-800 bg-gray-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className="text-left">
                    <p className={`font-bold text-sm ${actionType === "DISMISS" ? "text-gray-900" : "text-gray-700"}`}>Dismiss Report</p>
                    <p className="text-[10px] text-gray-500">ยกเลิกคำร้อง (ชีทปกติ)</p>
                  </div>
                  {actionType === "DISMISS" && <div className="w-2 h-2 rounded-full bg-gray-800" />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-tighter">
                Admin Note {actionType === "DISMISS" && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="ระบุเหตุผลประกอบการตัดสินใจ..."
                rows={3}
                className="w-full border-2 border-gray-100 focus:border-gray-300 rounded-2xl px-4 py-3 text-sm outline-none transition-all resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setReviewModalOpen(false)} disabled={submitting}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50">
                CLOSE
              </button>
              <button onClick={handleReviewSubmit} disabled={submitting}
                className={`flex-[2] py-3 rounded-2xl text-white text-sm font-black shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                  actionType === "SUSPEND" ? "bg-red-600 shadow-red-100" : "bg-gray-900 shadow-gray-200"
                }`}>
                {submitting ? "PROCESSING..." : "CONFIRM ACTION"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF & History Modals keep same logic but with cleaner padding classes */}
      {/* ... */}
      {pdfModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4">
          <div className="bg-white w-[1200px] max-w-full h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <span className="text-sm font-black text-gray-800">PREVIEW: {selectedReport.sheetId}</span>
              <button onClick={() => setPdfModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 px-4 py-1.5 rounded-xl text-xs font-bold transition-all">CLOSE</button>
            </div>
            <iframe src={selectedReport.fileUrl} className="flex-1 w-full" />
          </div>
        </div>
      )}

      {sheetHistoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black">History of Reports</h2>
              <button onClick={() => setSheetHistoryOpen(false)} className="text-gray-400 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {sheetReports.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-mono text-gray-400">ID: {r.id}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${STATUS_BADGE[r.status]?.className}`}>{STATUS_BADGE[r.status]?.label}</span>
                  </div>
                  <p className="text-sm text-gray-800 mb-2 font-medium">"{r.reason}"</p>
                  <p className="text-[10px] text-gray-400">{formatDate(String(r.createdAt))}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}