"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/axios";

interface WithdrawalRequest {
  id: number;
  user_id: string;
  sellerPenName: string;
  sellerFullName: string;
  full_name: string;
  amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: string;
  created_at: string;
}
interface WithdrawalDetailDTO {
  id: string;
  seller_id: string;
  user_id: string;
  sellerPenName: string;
  sellerFullName: string;
  amount: number;
  status: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  note: string | null;
  created_at: string;
  slip_url: string | null;
  transferred_at: string | null;
}

interface PageData {
  content: WithdrawalRequest[];
  page: {
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
}

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "ทั้งหมด", value: "ALL" },
  { label: "รออนุมัติ", value: "PENDING" },
  { label: "อนุมัติแล้ว", value: "APPROVED" },
  { label: "ปฏิเสธแล้ว", value: "REJECTED" },
];

const TAB_ACTIVE_COLOR: Record<StatusFilter, string> = {
  ALL: "bg-gray-800  text-white border-gray-800  shadow-md",
  PENDING: "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100",
  APPROVED: "bg-green-600 text-white border-green-600 shadow-md shadow-green-100",
  REJECTED: "bg-red-500   text-white border-red-500   shadow-md shadow-red-100",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "รออนุมัติ", className: "bg-amber-100 text-amber-700 border border-amber-200" },
  APPROVED: { label: "อนุมัติแล้ว", className: "bg-green-100 text-green-700 border border-green-200" },
  REJECTED: { label: "ปฏิเสธแล้ว", className: "bg-red-100   text-red-600   border border-red-200" },
};

export default function WithdrawPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("PENDING");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<WithdrawalDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<WithdrawalRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rejectComment, setRejectComment] = useState("");

  const fetchWithdrawals = async (status: StatusFilter, page = 0) => {
    setLoading(true);
    try {
      const statusParam = status !== "ALL" ? status : "ALL";
      const res = await api.get(
        `/admin/withdraw/list?status=${statusParam}&page=${page}&size=${pageSize}`
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
    fetchWithdrawals(activeTab, 0);
  }, [activeTab]);

  useEffect(() => {
    fetchWithdrawals(activeTab, currentPage);
  }, [currentPage]);

  const openDetailModal = async (item: WithdrawalRequest) => {
    setSelectedId(item.id);
    setSelectedItem(item);
    setDetailModalOpen(true);

    // ดึง detail รวม slipUrl
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/withdraw/${item.id}`);
      setDetailData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const openApproveModal = () => {
    setSlipFile(null);
    setSlipPreview(null);
    setApproveModalOpen(true);
  };

  const openRejectModal = () => {
    setRejectComment("");
    setRejectModalOpen(true);
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSlipFile(file);
    setSlipPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleApproveSubmit = async () => {
    if (!selectedId || !slipFile) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("slip", slipFile);
      await api.put(`/admin/withdraw/${selectedId}/approve`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("อนุมัติสำเร็จ!");
      setApproveModalOpen(false);
      setDetailModalOpen(false);
      setSelectedId(null);
      setSelectedItem(null);
      fetchWithdrawals(activeTab, currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedId || !rejectComment.trim()) return;
    try {
      setSubmitting(true);
      await api.put(`/admin/withdraw/${selectedId}/reject`, {
        comment: rejectComment.trim(),
      });
      alert("ปฏิเสธสำเร็จ!");
      setRejectModalOpen(false);
      setDetailModalOpen(false);
      setSelectedId(null);
      setSelectedItem(null);
      fetchWithdrawals(activeTab, currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = data?.page?.totalPages ?? 0;
  const totalItems = data?.page?.totalElements ?? 0;
  const requests = data?.content ?? [];

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2 }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("th-TH", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="space-y-8 p-2 relative">

      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Withdrawal Requests
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            ตรวจสอบและจัดการคำขอถอนเงินของผู้ขาย
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm text-gray-500">รายการ: </span>
          <span className="text-lg font-bold text-amber-500">{totalItems}</span>
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
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">ผู้ขอถอนเงิน</th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">จำนวนเงิน</th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">ธนาคาร / เลขบัญชี</th>
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
                        <span className="font-bold text-base text-gray-900">{item.sellerFullName}</span>
                        <span className="text-xs text-gray-400 mt-0.5">
                          {item.sellerPenName && `(${item.sellerPenName}) · `}
                          ID: {String(item.user_id).substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-bold text-green-600">฿{formatAmount(item.amount)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">{item.bank_name}</span>
                        <span className="text-sm text-gray-400 tracking-wider">{item.bank_account_number}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500">
                      {item.created_at ? formatDate(item.created_at) : "-"}
                    </td>
                    {/* ✅ Badge เฉพาะ tab ALL */}
                    {/* ✅ Badge เฉพาะ tab ALL - ปรับแก้ตรงนี้ */}
                    {activeTab === "ALL" && (
                      <td className="px-5 py-6">
                        <div className="flex items-center justify-start"> {/* หุ้มด้วย div เพื่อคุม layout */}
                          {(() => {
                            const statusKey = item.status; // เช่น "APPROVED"
                            const badge = STATUS_BADGE[statusKey] || {
                              label: statusKey,
                              className: "bg-gray-100 text-gray-500 border-gray-200"
                            };

                            return (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badge.className}`}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
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

        {/* ✅ Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <p className="text-sm text-gray-500">
              หน้า <span className="font-semibold text-gray-700">{currentPage + 1}</span>{" "}
              จาก <span className="font-semibold text-gray-700">{totalPages}</span>{" "}
              ({totalItems} รายการ)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← ก่อนหน้า
              </button>
              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(i => Math.abs(i - currentPage) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${currentPage === p
                      ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                      : "border border-gray-200 text-gray-600 hover:bg-white"
                      }`}
                  >
                    {p + 1}
                  </button>
                ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">รายละเอียดคำขอถอนเงิน</h2>
                <p className="text-sm text-gray-400 mt-0.5">Request ID: #{selectedId}</p>
              </div>
              {/* ✅ Badge status ใน modal header */}
              {selectedItem && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[selectedItem.status]?.className ?? "bg-gray-100 text-gray-500"
                  }`}>
                  {STATUS_BADGE[selectedItem.status]?.label ?? selectedItem.status}
                </span>
              )}
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
              {selectedItem ? (
                <>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 text-center">
                    <p className="text-sm text-gray-500 mb-1">จำนวนเงินที่ขอถอน</p>
                    <p className="text-4xl font-extrabold text-green-600">
                      ฿{formatAmount(selectedItem.amount)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">ชื่อผู้ขอ</p>
                      <p className="font-semibold text-gray-800">{selectedItem.sellerFullName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">วันที่ขอ</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {selectedItem.created_at ? formatDate(selectedItem.created_at) : "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-amber-400 rounded-full inline-block" />
                      ข้อมูลบัญชีรับเงิน
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">ธนาคาร</span>
                        <span className="font-semibold text-gray-800">{selectedItem.bank_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">ชื่อบัญชี</span>
                        <span className="font-semibold text-gray-800">{selectedItem.bank_account_name}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                        <span className="text-sm text-gray-500">เลขที่บัญชี</span>
                        <span className="font-bold text-lg tracking-widest text-gray-900">
                          {selectedItem.bank_account_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* สลิป — แสดงเมื่อ APPROVED */}
                  {detailData?.slip_url && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-green-400 rounded-full inline-block" />
                        สลิปการโอนเงิน
                      </h3>
                      <div className="rounded-xl overflow-hidden border border-green-100">
                        <img
                          src={detailData.slip_url}
                          alt="slip"
                          className="w-full object-contain max-h-64 bg-gray-50"
                        />
                      </div>
                      {detailData.transferred_at && (
                        <p className="text-xs text-gray-400 mt-1 text-right">
                          โอนเมื่อ: {formatDate(detailData.transferred_at)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* เหตุผล — แสดงเมื่อ REJECTED */}
                  {detailData?.note && selectedItem?.status === "REJECTED" && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-xs text-red-400 mb-1 font-semibold">เหตุผลที่ปฏิเสธ</p>
                      <p className="text-sm text-red-700">{detailData.note}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center py-20 text-red-500">ไม่พบข้อมูล</div>
              )}
            </div>

            {/* ✅ ซ่อนปุ่มถ้าไม่ใช่ PENDING */}
            {selectedItem?.status === "PENDING" && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={openRejectModal}
                  disabled={!selectedItem}
                  className="bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  REJECT
                </button>
                <button
                  onClick={openApproveModal}
                  disabled={!selectedItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  APPROVE
                </button>
              </div>
            )}
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
                <h2 className="text-xl font-bold text-gray-900">อนุมัติการถอนเงิน</h2>
                <p className="text-sm text-gray-400">
                  {selectedItem?.sellerFullName} · ฿{selectedItem ? formatAmount(selectedItem.amount) : "-"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                แนบสลิปการโอนเงิน <span className="text-red-500">*</span>
              </label>
              {slipPreview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-green-200">
                  <img src={slipPreview} alt="slip preview"
                    className="w-full max-h-56 object-contain bg-gray-50" />
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
              <input ref={fileInputRef} type="file" accept="image/*"
                className="hidden" onChange={handleSlipChange} />
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
                <h2 className="text-xl font-bold text-gray-900">ปฏิเสธคำขอถอนเงิน</h2>
                <p className="text-sm text-gray-400">
                  {selectedItem?.sellerFullName} · ฿{selectedItem ? formatAmount(selectedItem.amount) : "-"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เหตุผลที่ปฏิเสธ <span className="text-red-500">*</span>
              </label>
              <textarea rows={4} value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="ระบุเหตุผลที่ปฏิเสธคำขอนี้..."
                className="w-full border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none outline-none transition"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {rejectComment.trim().length} ตัวอักษร
              </p>
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