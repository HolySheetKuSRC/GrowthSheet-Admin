"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "รออนุมัติ", value: "PENDING" },
  { label: "อนุมัติแล้ว", value: "APPROVED" },
  { label: "ปฏิเสธแล้ว", value: "REJECTED" },
];

const TAB_ACTIVE_COLOR: Record<StatusFilter, string> = {
  ALL: "bg-gray-800  text-white border-gray-800  shadow-md",
  PENDING: "bg-blue-600  text-white border-blue-600  shadow-md shadow-blue-100",
  APPROVED: "bg-green-600 text-white border-green-600 shadow-md shadow-green-100",
  REJECTED: "bg-red-500   text-white border-red-500   shadow-md shadow-red-100",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รออนุมัติ", className: "bg-amber-100 text-amber-700 border border-amber-200" },
  APPROVED: { label: "อนุมัติแล้ว", className: "bg-green-100 text-green-700 border border-green-200" },
  REJECTED: { label: "ปฏิเสธแล้ว", className: "bg-red-100   text-red-600   border border-red-200" },
};

export default function SheetsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("PENDING");
  const [currentPage, setCurrentPage] = useState(0);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [sheetDetail, setSheetDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [rejectComment, setRejectComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const fetchSheets = async (status: StatusFilter, page: number) => {
    setLoading(true);
    try {
      const statusParam = status !== "ALL" ? `&status=${status}` : "";
      const res = await api.get(
        `/admin/sheets-applications/list?page=${page}&size=10&sort=latest${statusParam}`
      );
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
    fetchSheets(activeTab, 0);
  }, [activeTab]);

  useEffect(() => {
    fetchSheets(activeTab, currentPage);
  }, [currentPage]);

  const openDetailModal = async (sheetId: string) => {
    setSelectedSheetId(sheetId);
    setDetailModalOpen(true);
    setLoadingDetail(true);
    setSheetDetail(null);
    try {
      const res = await api.get(`/admin/sheets-applications/${sheetId}`);
      setSheetDetail(res.data);
    } catch (err) {
      console.error("Fetch Detail Error:", err);
      alert("ไม่สามารถดึงข้อมูลรายละเอียดได้");
    } finally {
      setLoadingDetail(false);
    }
  };

  const openApproveModal = () => setApproveModalOpen(true);
  const openRejectModal = () => { setRejectComment(""); setRejectModalOpen(true); };

  const handleApproveSubmit = async () => {
    if (!selectedSheetId) return;
    try {
      setSubmitting(true);
      await api.patch(`/admin/sheets-applications/${selectedSheetId}/approve`);
      alert("อนุมัติสำเร็จ!");
      setApproveModalOpen(false);
      setDetailModalOpen(false);
      setSelectedSheetId(null);
      fetchSheets(activeTab, currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedSheetId || !rejectComment.trim()) return;
    try {
      setSubmitting(true);
      await api.patch(`/admin/sheets-applications/${selectedSheetId}/reject`, {
        comment: rejectComment.trim(),
      });
      alert("ปฏิเสธสำเร็จ!");
      setRejectModalOpen(false);
      setDetailModalOpen(false);
      setSelectedSheetId(null);
      setRejectComment("");
      fetchSheets(activeTab, currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const sheets = data?.content || [];
  const totalPages = data?.totalPages ?? 0;
  const totalItems = data?.totalElements ?? 0;

  return (
    <div className="space-y-8 p-2 relative">

      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sheet Approvals</h1>
          <p className="text-gray-500 mt-1 font-medium">ตรวจสอบและอนุมัติชีทสรุปที่รอการพิจารณา</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm text-gray-500">รายการ: </span>
          <span className="text-lg font-bold text-blue-600">{totalItems}</span>
        </div>
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border ${activeTab === tab.value
              ? TAB_ACTIVE_COLOR[tab.value]
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white shadow-xl shadow-gray-100/50 rounded-3xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">ข้อมูลชีท</th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">ผู้ขาย / ราคา</th>
                {activeTab === "ALL" && (
                  <th className="px-8 py-5 text-sm font-semibold text-gray-600">สถานะ</th>
                )}
                <th className="px-8 py-5 text-sm font-semibold text-gray-600 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === "ALL" ? 4 : 3} className="px-8 py-20 text-center text-gray-400">
                    กำลังดึงข้อมูล...
                  </td>
                </tr>
              ) : sheets.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "ALL" ? 4 : 3} className="px-8 py-20 text-center">
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
                sheets.map((sheet: any) => (
                  <tr key={sheet.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {sheet.thumbnailUrl || sheet.imageUrl || sheet.image ? (
                          <img
                            src={sheet.thumbnailUrl || sheet.imageUrl || sheet.image}
                            alt={sheet.title}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            {/* SVG Icon เดิม */}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-base text-gray-900 line-clamp-1">{sheet.title}</span>
                          <span className="text-xs text-gray-400 mt-0.5">ID: {sheet.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">{sheet.seller?.name || "-"}</span>
                        <span className="text-blue-500 font-semibold text-sm">฿{Number(sheet.price).toFixed(2)}</span>
                      </div>
                    </td>
                    {activeTab === "ALL" && (
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[sheet.status]?.className ?? "bg-gray-100 text-gray-500"
                          }`}>
                          {STATUS_BADGE[sheet.status]?.label ?? sheet.status}
                        </span>
                      </td>
                    )}
                    <td className="px-8 py-6 text-center">
                      <button onClick={() => openDetailModal(sheet.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
                        VIEW DETAIL
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              หน้า {currentPage + 1} จาก {totalPages} ({totalItems} รายการ)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← ก่อนหน้า
              </button>

              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(i => Math.abs(i - currentPage) <= 2)
                .map(i => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${i === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ───────────── DETAIL MODAL ───────────── */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">รายละเอียดชีท</h2>
                {sheetDetail && (
                  <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-bold ${STATUS_BADGE[sheetDetail.status]?.className ?? "bg-gray-100 text-gray-500"
                    }`}>
                    {STATUS_BADGE[sheetDetail.status]?.label ?? sheetDetail.status}
                  </span>
                )}
              </div>
              <button onClick={() => setDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetail ? (
                <div className="flex justify-center py-20 text-gray-500">กำลังดึงข้อมูลรายละเอียด...</div>
              ) : sheetDetail ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 mb-1">ชื่อชีท</p>
                      <p className="font-semibold text-lg text-gray-900">{sheetDetail.title}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">เผยแพร่</p>
                      <p className="font-semibold text-gray-800">
                        {sheetDetail.isPublished ? "✅ เผยแพร่แล้ว" : "⏳ ยังไม่เผยแพร่"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Sheet ID</p>
                      <p className="font-mono text-sm text-gray-700">{selectedSheetId?.substring(0, 8)}...</p>
                    </div>
                  </div>

                  {sheetDetail.description && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-400 rounded-full inline-block" />
                        คำอธิบาย
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{sheetDetail.description}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
                      ข้อมูลผู้ขาย
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">ชื่อผู้ขาย</p>
                        <p className="font-semibold text-gray-800">{sheetDetail.seller?.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Seller ID</p>
                        <p className="font-mono text-sm text-gray-500">{sheetDetail.seller?.id?.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>

                  {/* แสดงเฉพาะรูปปกจาก imageUrl */}
                  {sheetDetail.imageUrl && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-purple-400 rounded-full inline-block" />
                        รูปภาพหน้าปก
                      </h3>
                      <div className="w-1/2">
                        <button onClick={() => setPreviewImageUrl(sheetDetail.imageUrl)} className="group relative w-full">
                          <img src={sheetDetail.imageUrl} alt="Cover Preview"
                            className="w-full h-auto object-cover rounded-xl border border-gray-200 group-hover:opacity-80 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/50 text-white text-sm px-3 py-1.5 rounded-lg font-medium">ขยายดูรูปเต็ม</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gray-400 rounded-full inline-block" />
                      ไฟล์ PDF
                    </h3>
                    {sheetDetail.fileUrl ? (
                      <a href={sheetDetail.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-5 py-3 rounded-xl border border-blue-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        เปิดไฟล์ PDF
                      </a>
                    ) : (
                      <p className="text-gray-400 text-sm">ไม่มีไฟล์ PDF</p>
                    )}
                  </div>

                  {sheetDetail.lastComment && sheetDetail.status === "REJECTED" && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-red-400 rounded-full inline-block" />
                        เหตุผลที่ปฏิเสธ
                      </h3>
                      <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm text-red-800 leading-relaxed">{sheetDetail.lastComment}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-center py-20 text-red-500">ไม่พบข้อมูล</div>
              )}
            </div>

            {sheetDetail?.status === "PENDING" && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={openRejectModal} disabled={loadingDetail || !sheetDetail}
                  className="bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
                  REJECT
                </button>
                <button onClick={openApproveModal} disabled={loadingDetail || !sheetDetail}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
                  APPROVE
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── IMAGE PREVIEW MODAL ── */}
      {previewImageUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 cursor-zoom-out"
          onClick={() => setPreviewImageUrl(null)}>
          <img src={previewImageUrl} alt="Preview" className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}

      {/* ── APPROVE MODAL ── */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">ยืนยันการอนุมัติ</h2>
                <p className="text-sm text-gray-400 line-clamp-1">{sheetDetail?.title}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              คุณต้องการอนุมัติชีท <strong>{sheetDetail?.title}</strong> ใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setApproveModalOpen(false)} disabled={submitting}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium disabled:opacity-50">
                ยกเลิก
              </button>
              <button onClick={handleApproveSubmit} disabled={submitting}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm disabled:opacity-50 transition-colors">
                {submitting ? "กำลังดำเนินการ..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">ระบุเหตุผลการปฏิเสธ</h2>
                <p className="text-sm text-gray-400 line-clamp-1">{sheetDetail?.title}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เหตุผล <span className="text-red-500">*</span>
              </label>
              <textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)}
                placeholder="กรุณาระบุเหตุผล เช่น รูปภาพไม่ชัดเจน, เนื้อหาไม่ครบถ้วน..."
                className="w-full h-32 px-4 py-3 border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 rounded-xl resize-none outline-none transition text-sm"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{rejectComment.trim().length} ตัวอักษร</p>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setRejectModalOpen(false)} disabled={submitting}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium disabled:opacity-50">
                ยกเลิก
              </button>
              <button onClick={handleRejectSubmit} disabled={!rejectComment.trim() || submitting}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {submitting ? "กำลังดำเนินการ..." : "ยืนยันการปฏิเสธ"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}