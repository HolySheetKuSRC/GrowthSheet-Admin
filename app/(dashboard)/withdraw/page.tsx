"use client";

import { useEffect, useState } from "react";
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

interface PageData {
  content: WithdrawalRequest[];
  page: {
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
}

export default function WithdrawPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<WithdrawalRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchWithdrawals = async (page = 0) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/withdraw/list?status=PENDING&page=${page}&size=${pageSize}`
      );
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals(currentPage);
  }, [currentPage]);

  const openDetailModal = (item: WithdrawalRequest) => {
    setSelectedId(item.id);
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const openApproveModal = () => setApproveModalOpen(true);
  const openRejectModal = () => setRejectModalOpen(true);

  const handleApproveSubmit = async () => {
    if (!selectedId) return;
    try {
      setSubmitting(true);
      await api.put(`/admin/withdraw/${selectedId}/approve`);
      alert("อนุมัติสำเร็จ!");
      setApproveModalOpen(false);
      setDetailModalOpen(false);
      setSelectedId(null);
      setSelectedItem(null);
      fetchWithdrawals(currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedId) return;
    try {
      setSubmitting(true);
      await api.put(`/admin/withdraw/${selectedId}/reject`);
      alert("ปฏิเสธสำเร็จ!");
      setRejectModalOpen(false);
      setDetailModalOpen(false);
      setSelectedId(null);
      setSelectedItem(null);
      fetchWithdrawals(currentPage);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = data?.page?.totalPages ?? 0;
  const requests = data?.content ?? [];

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2 }).format(amount);

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
      {/* Header */}
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
          <span className="text-sm text-gray-500">รอดำเนินการ: </span>
          <span className="text-lg font-bold text-amber-500">
            {data?.page?.totalElements ?? 0}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-xl shadow-gray-100/50 rounded-3xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">
                  ผู้ขอถอนเงิน
                </th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">
                  จำนวนเงิน
                </th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">
                  ธนาคาร / เลขบัญชี
                </th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">
                  วันที่ขอ
                </th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600 text-center">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400">
                    กำลังดึงข้อมูล...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>ไม่มีรายการรออนุมัติ</span>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-gray-900">
                          {item.sellerFullName}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5">
                            {item.sellerPenName && `(${item.sellerPenName}) · `}
                          ID: {String(item.user_id).substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-bold text-green-600">
                        ฿{formatAmount(item.amount)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">{item.bank_name}</span>
                        <span className="text-sm text-gray-400 tracking-wider">
                          {item.bank_account_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500">
                      {item.created_at ? formatDate(item.created_at) : "-"}
                    </td>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <p className="text-sm text-gray-500">
              หน้า{" "}
              <span className="font-semibold text-gray-700">
                {currentPage + 1}
              </span>{" "}
              จาก{" "}
              <span className="font-semibold text-gray-700">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← ก่อนหน้า
              </button>
              {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                    currentPage === page
                      ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                      : "border border-gray-200 text-gray-600 hover:bg-white"
                  }`}
                >
                  {page + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">รายละเอียดคำขอถอนเงิน</h2>
                <p className="text-sm text-gray-400 mt-0.5">Request ID: #{selectedId}</p>
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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {selectedItem ? (
                <>
                  {/* Amount highlight */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 text-center">
                    <p className="text-sm text-gray-500 mb-1">จำนวนเงินที่ขอถอน</p>
                    <p className="text-4xl font-extrabold text-green-600">
                      ฿{formatAmount(selectedItem.amount)}
                    </p>
                  </div>

                  {/* User info */}
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

                  {/* Bank info */}
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
                </>
              ) : (
                <div className="flex justify-center py-20 text-red-500">ไม่พบข้อมูล</div>
              )}
            </div>

            {/* Modal Footer */}
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
          </div>
        </div>
      )}

      {/* APPROVE MODAL */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">ยืนยันการอนุมัติ</h2>
            </div>
            <p className="text-gray-600">
              คุณต้องการอนุมัติการถอนเงินจำนวน{" "}
              <strong className="text-green-600">
                ฿{selectedItem ? formatAmount(selectedItem.amount) : "-"}
              </strong>{" "}
              ให้กับ <strong>{selectedItem?.sellerFullName}</strong> ใช่หรือไม่?
            </p>
            <p className="text-sm text-gray-400 mt-2">
              เงินจะถูกโอนไปยังบัญชี {selectedItem?.bank_name} เลขที่{" "}
              {selectedItem?.bank_account_number}
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setApproveModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleApproveSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {submitting ? "กำลังดำเนินการ..." : "ยืนยันการอนุมัติ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">ยืนยันการปฏิเสธ</h2>
            </div>
            <p className="text-gray-600 mb-1">
              คุณต้องการปฏิเสธคำขอถอนเงินจำนวน{" "}
              <strong className="text-red-500">
                ฿{selectedItem ? formatAmount(selectedItem.amount) : "-"}
              </strong>{" "}
              ของ <strong>{selectedItem?.sellerFullName}</strong> ใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setRejectModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {submitting ? "กำลังดำเนินการ..." : "ยืนยันการปฏิเสธ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}