"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

// ✅ SellerStatus ตรงกับ enum จริง
type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "ทั้งหมด",     value: "ALL" },
  { label: "รออนุมัติ",   value: "PENDING" },
  { label: "อนุมัติแล้ว", value: "APPROVED" },
  { label: "ปฏิเสธแล้ว", value: "REJECTED" },
];

const TAB_ACTIVE_COLOR: Record<StatusFilter, string> = {
  ALL:      "bg-gray-800  text-white border-gray-800  shadow-md",
  PENDING:  "bg-blue-600  text-white border-blue-600  shadow-md shadow-blue-100",
  APPROVED: "bg-green-600 text-white border-green-600 shadow-md shadow-green-100",
  REJECTED: "bg-red-500   text-white border-red-500   shadow-md shadow-red-100",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING:  { label: "รออนุมัติ",   className: "bg-blue-100  text-blue-700  border border-blue-200"  },
  APPROVED: { label: "อนุมัติแล้ว", className: "bg-green-100 text-green-700 border border-green-200" },
  REJECTED: { label: "ปฏิเสธแล้ว", className: "bg-red-100   text-red-600   border border-red-200"   },
};

export default function SellersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("PENDING"); // ✅

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sellerDetail, setSellerDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [rejectComment, setRejectComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ fetch ตาม activeTab
  const fetchSellers = async (status: StatusFilter) => {
    setLoading(true);
    try {
      const statusParam = status !== "ALL" ? status : "";
      const res = await api.get(
        `/admin/seller-applications?${statusParam ? `status=${statusParam}&` : ""}page=0&size=10`
      );
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers(activeTab);
  }, [activeTab]);

  const openDetailModal = async (userId: string) => {
    setSelectedUserId(userId);
    setDetailModalOpen(true);
    setLoadingDetail(true);
    setSellerDetail(null);
    try {
      const res = await api.get(`/admin/seller-applications/${userId}`);
      setSellerDetail(res.data);
    } catch (err) {
      console.error("Fetch Detail Error:", err);
      alert("ไม่สามารถดึงข้อมูลรายละเอียดได้");
    } finally {
      setLoadingDetail(false);
    }
  };

  const openApproveModal = () => setApproveModalOpen(true);
  const openRejectModal = () => {
    setRejectComment("");
    setRejectModalOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedUserId) return;
    try {
      setSubmitting(true);
      await api.put(`/admin/seller-applications/${selectedUserId}/approve`);
      alert("อนุมัติสำเร็จ!");
      setApproveModalOpen(false);
      setDetailModalOpen(false);
      setSelectedUserId(null);
      fetchSellers(activeTab);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedUserId || !rejectComment.trim()) return;
    try {
      setSubmitting(true);
      await api.put(`/admin/seller-applications/${selectedUserId}/reject`, {
        comment: rejectComment.trim(),
      });
      alert("ปฏิเสธสำเร็จ!");
      setRejectModalOpen(false);
      setDetailModalOpen(false);
      setSelectedUserId(null);
      setRejectComment("");
      fetchSellers(activeTab);
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const sellers = data?.content || [];

  return (
    <div className="space-y-8 p-2 relative">

      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Seller Applications
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            ตรวจสอบและอนุมัติรายชื่อผู้สมัครขายชีทสรุป
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm text-gray-500">รายการ: </span>
          <span className="text-lg font-bold text-blue-600">
            {data?.page?.totalElements || 0}
          </span>
        </div>
      </div>

      {/* ✅ ── Status Filter Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border ${
              activeTab === tab.value
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
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">ข้อมูลผู้สมัคร</th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">มหาวิทยาลัย / นามปากกา</th>
                {/* ✅ แสดง status column เฉพาะ tab ALL */}
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
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "ALL" ? 4 : 3} className="px-8 py-20 text-center text-gray-500">
                    ไม่มีรายการ
                  </td>
                </tr>
              ) : (
                sellers.map((seller: any) => (
                  <tr key={seller.user_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">{seller.full_name}</span>
                        <span className="text-xs text-gray-400">
                          ID: {seller.user_id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span>{seller.university}</span>
                        <span className="text-blue-500 italic">@{seller.pen_name}</span>
                      </div>
                    </td>
                    {/* ✅ Badge เฉพาะ tab ALL */}
                    {activeTab === "ALL" && (
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          STATUS_BADGE[seller.is_verified]?.className ?? "bg-gray-100 text-gray-500"
                        }`}>
                          {STATUS_BADGE[seller.is_verified]?.label ?? seller.is_verified}
                        </span>
                      </td>
                    )}
                    <td className="px-8 py-6 text-center">
                      <button
                        onClick={() => openDetailModal(seller.user_id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
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

      {/* ── DETAIL MODAL ── */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">รายละเอียดผู้สมัคร</h2>
                {/* ✅ แสดง badge status ใน modal header */}
                {sellerDetail && (
                  <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-bold ${
                    STATUS_BADGE[sellerDetail.is_verified]?.className ?? "bg-gray-100 text-gray-500"
                  }`}>
                    {STATUS_BADGE[sellerDetail.is_verified]?.label ?? sellerDetail.is_verified}
                  </span>
                )}
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetail ? (
                <div className="flex justify-center py-20 text-gray-500">กำลังดึงข้อมูลรายละเอียด...</div>
              ) : sellerDetail ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                      <p className="font-semibold text-lg">{sellerDetail.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">นามปากกา</p>
                      <p className="font-semibold text-lg">@{sellerDetail.pen_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">มหาวิทยาลัย</p>
                      <p className="font-semibold">{sellerDetail.university}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">รหัสนักศึกษา</p>
                      <p className="font-semibold">{sellerDetail.student_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                      <p className="font-semibold">{sellerDetail.phone_number}</p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">ข้อมูลการรับเงิน</h3>
                    <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">ธนาคาร</p>
                        <p className="font-semibold">{sellerDetail.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">ชื่อบัญชี</p>
                        <p className="font-semibold">{sellerDetail.bank_account_name}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">เลขที่บัญชี</p>
                        <p className="font-semibold text-lg tracking-wider">{sellerDetail.bank_account_number}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">เอกสารยืนยันตัวตน</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">บัตรนักศึกษา</p>
                        {sellerDetail.id_card_url ? (
                          <img src={sellerDetail.id_card_url} alt="ID Card"
                            className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                        ) : (
                          <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                            ไม่มีรูปภาพ
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">รูปถ่ายคู่บัตร</p>
                        {sellerDetail.selfie_id_url ? (
                          <img src={sellerDetail.selfie_id_url} alt="Selfie"
                            className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                        ) : (
                          <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                            ไม่มีรูปภาพ
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ✅ แสดง admin comment ถ้า REJECTED */}
                  {sellerDetail.admin_comment && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">เหตุผลที่ปฏิเสธ</h3>
                      <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm text-red-800">{sellerDetail.admin_comment}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-center py-20 text-red-500">ไม่พบข้อมูล</div>
              )}
            </div>

            {/* ✅ ซ่อนปุ่มถ้าไม่ใช่ PENDING */}
            {sellerDetail?.is_verified === "PENDING" && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={openRejectModal}
                  disabled={loadingDetail || !sellerDetail}
                  className="bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  REJECT
                </button>
                <button
                  onClick={openApproveModal}
                  disabled={loadingDetail || !sellerDetail}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  APPROVE
                </button>
              </div>
            )}
          </div>
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
                <p className="text-sm text-gray-400">{sellerDetail?.full_name}</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              คุณต้องการอนุมัติผู้สมัคร <strong>{sellerDetail?.full_name}</strong> ใช่หรือไม่?
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
                <p className="text-sm text-gray-400">{sellerDetail?.full_name}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เหตุผล <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="กรุณาระบุเหตุผล เช่น รูปถ่ายไม่ชัดเจน..."
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