"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function SellersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sellerDetail, setSellerDetail] = useState<any>(null); // เก็บข้อมูล DTO เชิงลึก
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [rejectComment, setRejectComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        "/admin/seller-applications?status=PENDING&page=0&size=10"
      );
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // --- ฟังก์ชันเปิดหน้า Detail และดึงข้อมูลเชิงลึก ---
  const openDetailModal = async (userId: string) => {
    setSelectedUserId(userId);
    setDetailModalOpen(true);
    setLoadingDetail(true);
    setSellerDetail(null); // เคลียร์ข้อมูลเก่าก่อน

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

  // --- ฟังก์ชันจัดการ Modal Approve/Reject ---
  const openApproveModal = () => {
    setApproveModalOpen(true);
  };

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
      setDetailModalOpen(false); // ปิดหน้า detail ด้วย
      setSelectedUserId(null);
      fetchSellers(); // ดึง list ใหม่
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedUserId) return;
    if (!rejectComment.trim()) return;

    try {
      setSubmitting(true);
      await api.put(`/admin/seller-applications/${selectedUserId}/reject`, {
        comment: rejectComment.trim(),
      });

      alert("ปฏิเสธสำเร็จ!");
      setRejectModalOpen(false);
      setDetailModalOpen(false); // ปิดหน้า detail ด้วย
      setSelectedUserId(null);
      setRejectComment("");
      fetchSellers(); // ดึง list ใหม่
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const sellers = data?.content || [];

  return (
    <div className="space-y-8 p-2 relative">
      {/* Header */}
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
          <span className="text-sm text-gray-500">รอดำเนินการ: </span>
          <span className="text-lg font-bold text-blue-600">
            {data?.page?.totalElements || 0}
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
                  ข้อมูลผู้สมัคร
                </th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">
                  มหาวิทยาลัย / นามปากกา
                </th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600 text-center">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-gray-400">
                    กำลังดึงข้อมูล...
                  </td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-gray-500">
                    ไม่มีรายการรออนุมัติ
                  </td>
                </tr>
              ) : (
                sellers.map((seller: any) => (
                  <tr key={seller.user_id} className="hover:bg-blue-50/30">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">
                          {seller.full_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ID: {seller.user_id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span>{seller.university}</span>
                        <span className="text-blue-500 italic">
                          @{seller.pen_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex justify-center gap-3">
                        {/* เปลี่ยนปุ่มตรงนี้เป็น View Detail */}
                        <button
                          onClick={() => openDetailModal(seller.user_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold"
                        >
                          VIEW DETAIL
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">รายละเอียดผู้สมัคร</h2>
              <button onClick={() => setDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetail ? (
                <div className="flex justify-center py-20 text-gray-500">กำลังดึงข้อมูลรายละเอียด...</div>
              ) : sellerDetail ? (
                <div className="space-y-6">
                  {/* ข้อมูลทั่วไป */}
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

                  {/* ข้อมูลธนาคาร */}
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

                  {/* รูปภาพยืนยันตัวตน */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">เอกสารยืนยันตัวตน</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">บัตรนักศึกษา</p>
                        {sellerDetail.id_card_url ? (
                          <img src={sellerDetail.id_card_url} alt="ID Card" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                        ) : (
                          <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">รูปถ่ายคู่บัตร</p>
                        {sellerDetail.selfie_id_url ? (
                          <img src={sellerDetail.selfie_id_url} alt="Selfie" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                        ) : (
                          <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-20 text-red-500">ไม่พบข้อมูล</div>
              )}
            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={openRejectModal}
                disabled={loadingDetail || !sellerDetail}
                className="bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
              >
                REJECT
              </button>
              <button
                onClick={openApproveModal}
                disabled={loadingDetail || !sellerDetail}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
              >
                APPROVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MODAL (ซ้อนบน Detail Modal ได้) */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              ยืนยันการอนุมัติ
            </h2>
            <p className="text-gray-600">
              คุณต้องการอนุมัติผู้สมัคร <strong>{sellerDetail?.full_name}</strong> ใช่หรือไม่?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setApproveModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleApproveSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                {submitting ? "กำลังดำเนินการ..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL (ซ้อนบน Detail Modal ได้) */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              ระบุเหตุผลการปฏิเสธ
            </h2>

            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="กรุณาระบุเหตุผล เช่น รูปถ่ายไม่ชัดเจน..."
              className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-red-400"
            />

            {!rejectComment.trim() && (
              <p className="text-red-500 text-sm mt-2">
                จำเป็นต้องระบุเหตุผล
              </p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setRejectModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleRejectSubmit}
                disabled={!rejectComment.trim() || submitting}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50"
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