"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function SellersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

  const openApproveModal = (userId: string) => {
    setSelectedUserId(userId);
    setApproveModalOpen(true);
  };

  const openRejectModal = (userId: string) => {
    setSelectedUserId(userId);
    setRejectComment("");
    setRejectModalOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedUserId) return;

    try {
      setSubmitting(true);

      await api.put(
        `/admin/seller-applications/${selectedUserId}/approve`
      );

      alert("อนุมัติสำเร็จ!");
      setApproveModalOpen(false);
      setSelectedUserId(null);
      fetchSellers();
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

      await api.put(
        `/admin/seller-applications/${selectedUserId}/reject`,
        {
          comment: rejectComment.trim(),
        }
      );

      alert("ปฏิเสธสำเร็จ!");
      setRejectModalOpen(false);
      setSelectedUserId(null);
      setRejectComment("");
      fetchSellers();
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
                        <button
                          onClick={() => openApproveModal(seller.user_id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold"
                        >
                          APPROVE
                        </button>

                        <button
                          onClick={() => openRejectModal(seller.user_id)}
                          className="bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 px-6 py-2.5 rounded-xl text-sm font-bold"
                        >
                          REJECT
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

      {/* APPROVE MODAL */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              ยืนยันการอนุมัติ
            </h2>
            <p className="text-gray-600">
              คุณต้องการอนุมัติคำขอนี้ใช่หรือไม่?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setApproveModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-gray-200"
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

      {/* REJECT MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              ระบุเหตุผลการปฏิเสธ
            </h2>

            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="กรุณาระบุเหตุผล..."
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
                className="px-4 py-2 rounded-xl border border-gray-200"
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