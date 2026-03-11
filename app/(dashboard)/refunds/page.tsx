"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/axios";

interface RefundRequest {
  id: string;
  orderItemId: string;
  sheetName?: string;
  sheetFileUrl?: string;
  userId: string;
  reason: string;
  evidenceUrl?: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  status: string;
  refundSlipUrl?: string;
  adminId?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ เปลี่ยน APPROVED → REFUNDED ให้ตรงกับ enum จริง
type StatusFilter = "ALL" | "PENDING" | "REFUNDED" | "REJECTED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "รออนุมัติ", value: "PENDING" },
  { label: "คืนเงินแล้ว", value: "REFUNDED" },  // ✅ APPROVED → REFUNDED
  { label: "ปฏิเสธแล้ว", value: "REJECTED" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รออนุมัติ", className: "bg-amber-100 text-amber-700 border border-amber-200" },
  REFUNDED: { label: "คืนเงินแล้ว", className: "bg-green-100 text-green-700 border border-green-200" },
  REJECTED: { label: "ปฏิเสธแล้ว", className: "bg-red-100 text-red-600 border border-red-200" },
};

export default function RefundPage() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("PENDING");

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<RefundRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [approveComment, setApproveComment] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rejectComment, setRejectComment] = useState("");

  const fetchRefunds = async (status: StatusFilter) => {
    setLoading(true);
    try {
      const params = status !== "ALL" ? { status } : {};
      const res = await api.get("/admin/refunds", { params });
      setRequests(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds(activeTab);
  }, [activeTab]);

  const openDetailModal = (item: RefundRequest) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const openApproveModal = () => {
    setSlipFile(null);
    setSlipPreview(null);
    setApproveComment("");
    setApproveModalOpen(true);
  };

  const openRejectModal = () => {
    setRejectComment("");
    setRejectModalOpen(true);
  };

  const openPdfModal = () => setPdfModalOpen(true);

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSlipFile(file);
    setSlipPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleApproveSubmit = async () => {
    if (!selectedItem || !slipFile) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("slip", slipFile);
      if (approveComment.trim()) formData.append("comment", approveComment.trim());
      await api.patch(`/admin/refunds/${selectedItem.id}/approve`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("อนุมัติ Refund สำเร็จ!");
      setApproveModalOpen(false);
      setDetailModalOpen(false);
      setSelectedItem(null);
      fetchRefunds(activeTab);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedItem || !rejectComment.trim()) return;
    try {
      setSubmitting(true);
      await api.patch(`/admin/refunds/${selectedItem.id}/reject`, {
        comment: rejectComment.trim(),
      });
      alert("ปฏิเสธ Refund สำเร็จ!");
      setRejectModalOpen(false);
      setDetailModalOpen(false);
      setSelectedItem(null);
      fetchRefunds(activeTab);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-8 p-2 relative">

      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Refund Requests
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            ตรวจสอบและจัดการคำขอคืนเงินของผู้ซื้อ
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm text-gray-500">รายการ: </span>
          <span className="text-lg font-bold text-amber-500">{requests.length}</span>
        </div>
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border ${activeTab === tab.value
              ? tab.value === "PENDING"
                ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100"
                : tab.value === "REFUNDED"   // ✅ เปลี่ยนจาก APPROVED
                  ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-100"
                  : tab.value === "REJECTED"
                    ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-100"
                    : "bg-gray-800 text-white border-gray-800 shadow-md"
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
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">ผู้ขอคืนเงิน</th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">ธนาคาร / บัญชี</th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">เหตุผล</th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">วันที่ขอ</th>
                {activeTab === "ALL" && (
                  <th className="px-8 py-5 text-sm font-semibold text-gray-600">สถานะ</th>
                )}
                <th className="px-8 py-5 text-sm font-semibold text-gray-600 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === "ALL" ? 6 : 5} className="px-8 py-20 text-center text-gray-400">
                    กำลังดึงข้อมูล...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "ALL" ? 6 : 5} className="px-8 py-20 text-center">
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
                requests.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-gray-900">{item.bankAccountName}</span>
                        <span className="text-xs text-gray-400 mt-0.5">
                          User ID: {item.userId?.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">{item.bankName}</span>
                        <span className="text-sm text-gray-400 tracking-wider">{item.bankAccountNumber}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-gray-600 max-w-xs line-clamp-2">{item.reason}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500">
                      {item.createdAt ? formatDate(item.createdAt) : "-"}
                    </td>
                    {activeTab === "ALL" && (
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[item.status]?.className ?? "bg-gray-100 text-gray-500"
                          }`}>
                          {STATUS_BADGE[item.status]?.label ?? item.status}
                        </span>
                      </td>
                    )}
                    <td className="px-8 py-6 text-center">
                      <button
                        onClick={() => openDetailModal(item)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                      >
                        VIEW DETAIL
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────── DETAIL MODAL ───────────── */}
      {detailModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">รายละเอียดคำขอคืนเงิน</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Refund ID: #{selectedItem.id.substring(0, 8)}...
                </p>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">ชื่อบัญชี</p>
                  <p className="font-semibold text-gray-800">{selectedItem.bankAccountName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">วันที่ขอ</p>
                  <p className="font-semibold text-gray-800 text-sm">{formatDate(selectedItem.createdAt)}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">สถานะ:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[selectedItem.status]?.className ?? "bg-gray-100 text-gray-500"
                  }`}>
                  {STATUS_BADGE[selectedItem.status]?.label ?? selectedItem.status}
                </span>
              </div>

              {/* ข้อมูลบัญชีรับเงิน */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
                  ข้อมูลบัญชีรับเงิน
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">ธนาคาร</span>
                    <span className="font-semibold text-gray-800">{selectedItem.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">ชื่อบัญชี</span>
                    <span className="font-semibold text-gray-800">{selectedItem.bankAccountName}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <span className="text-sm text-gray-500">เลขที่บัญชี</span>
                    <span className="font-bold text-lg tracking-widest text-gray-900">
                      {selectedItem.bankAccountNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* เหตุผล */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-400 rounded-full inline-block" />
                  เหตุผลที่ขอคืนเงิน
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.reason}</p>
                </div>
              </div>

              {/* หลักฐาน */}
              {selectedItem.evidenceUrl && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-purple-400 rounded-full inline-block" />
                    หลักฐานประกอบ
                  </h3>
                  <a href={selectedItem.evidenceUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedItem.evidenceUrl}
                      alt="evidence"
                      className="w-full max-h-48 object-contain rounded-xl border border-gray-200 bg-gray-50"
                    />
                  </a>
                </div>
              )}

              {/* Refund Slip (กรณี APPROVED/REFUNDED) */}
              {selectedItem.refundSlipUrl && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-green-400 rounded-full inline-block" />
                    สลิปการโอนเงิน
                  </h3>
                  <a href={selectedItem.refundSlipUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedItem.refundSlipUrl}
                      alt="refund slip"
                      className="w-full max-h-48 object-contain rounded-xl border border-gray-200 bg-gray-50"
                    />
                  </a>
                </div>
              )}

              {/* Admin Comment */}
              {selectedItem.adminComment && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-indigo-400 rounded-full inline-block" />
                    หมายเหตุจาก Admin
                  </h3>
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-sm text-indigo-800 leading-relaxed">{selectedItem.adminComment}</p>
                  </div>
                </div>
              )}

              {/* ข้อมูล Order */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gray-400 rounded-full inline-block" />
                  ข้อมูลออเดอร์
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">ชื่อชีท</span>
                    <span
                      className="font-semibold text-gray-800 text-right line-clamp-1 max-w-[200px]"
                      title={selectedItem.sheetName}
                    >
                      {selectedItem.sheetName || "-"}
                    </span>
                  </div>
                  {selectedItem.sheetFileUrl && (
                    <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                      <span className="text-sm text-gray-500">ไฟล์ที่เกิดปัญหา</span>
                      <button
                        onClick={openPdfModal}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        ดู PDF
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <span className="text-sm text-gray-500">Order Item ID</span>
                    <span className="font-mono text-sm text-gray-700">{selectedItem.orderItemId}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <span className="text-sm text-gray-500">User ID</span>
                    <span className="font-mono text-sm text-gray-700">{selectedItem.userId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ซ่อนปุ่มถ้าไม่ใช่ PENDING */}
            {selectedItem.status === "PENDING" && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={openRejectModal}
                  className="bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  REJECT
                </button>
                <button
                  onClick={openApproveModal}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  APPROVE
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────── PDF MODAL ───────────── */}
      {pdfModalOpen && selectedItem?.sheetFileUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white w-[1100px] max-w-[92vw] h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <span className="font-semibold text-gray-800">PDF Preview</span>
                  {selectedItem.sheetName && (
                    <span className="text-sm text-gray-400 ml-2">— {selectedItem.sheetName}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPdfModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors px-3 py-1 rounded-lg hover:bg-gray-100 text-sm font-medium"
              >
                Close
              </button>
            </div>
            <div className="flex-1">
              <iframe src={selectedItem.sheetFileUrl} className="w-full h-full border-0" />
            </div>
          </div>
        </div>
      )}

      {/* ───────────── APPROVE MODAL ───────────── */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">อนุมัติการคืนเงิน</h2>
                <p className="text-sm text-gray-400">
                  {selectedItem?.bankAccountName} · {selectedItem?.bankName}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                แนบสลิปการโอนเงิน <span className="text-red-500">*</span>
              </label>
              {slipPreview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-green-200">
                  <img src={slipPreview} alt="slip preview" className="w-full max-h-56 object-contain bg-gray-50" />
                  <button
                    onClick={() => {
                      setSlipFile(null);
                      setSlipPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 rounded-full p-1 shadow transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50/30 rounded-xl py-10 flex flex-col items-center gap-2 text-gray-400 hover:text-green-600 transition-colors"
                >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">คลิกเพื่อเลือกไฟล์สลิป</span>
                  <span className="text-xs text-gray-300">PNG, JPG, WEBP ไม่เกิน 10MB</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSlipChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">หมายเหตุ (ไม่บังคับ)</label>
              <textarea rows={3} value={approveComment} onChange={(e) => setApproveComment(e.target.value)}
                placeholder="ระบุหมายเหตุเพิ่มเติม..."
                className="w-full border border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none outline-none transition"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setApproveModalOpen(false)} disabled={submitting}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium disabled:opacity-50">
                ยกเลิก
              </button>
              <button onClick={handleApproveSubmit} disabled={submitting || !slipFile}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? "กำลังดำเนินการ..." : "ยืนยันการอนุมัติ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── REJECT MODAL ───────────── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">ปฏิเสธคำขอคืนเงิน</h2>
                <p className="text-sm text-gray-400">
                  {selectedItem?.bankAccountName} · {selectedItem?.bankName}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เหตุผลที่ปฏิเสธ <span className="text-red-500">*</span>
              </label>
              <textarea rows={4} value={rejectComment} onChange={(e) => setRejectComment(e.target.value)}
                placeholder="ระบุเหตุผลที่ปฏิเสธคำขอนี้..."
                className="w-full border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none outline-none transition"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{rejectComment.trim().length} ตัวอักษร</p>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setRejectModalOpen(false)} disabled={submitting}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium disabled:opacity-50">
                ยกเลิก
              </button>
              <button onClick={handleRejectSubmit} disabled={submitting || !rejectComment.trim()}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? "กำลังดำเนินการ..." : "ยืนยันการปฏิเสธ"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}