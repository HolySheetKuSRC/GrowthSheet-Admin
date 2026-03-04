"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function SheetsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [sheetDetail, setSheetDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [rejectComment, setRejectComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // GET /api/admin/sheets-applications/
  const fetchSheets = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        "/admin/sheets-applications/?page=0&size=10&sort=latest"
      );
      setData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  // GET /api/admin/sheets-applications/:sheetId
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
  const openRejectModal = () => {
    setRejectComment("");
    setRejectModalOpen(true);
  };

  // PATCH /api/admin/sheets-applications/:sheetId/approve
  const handleApproveSubmit = async () => {
    if (!selectedSheetId) return;
    try {
      setSubmitting(true);
      await api.patch(`/admin/sheets-applications/${selectedSheetId}/approve`);
      alert("อนุมัติสำเร็จ!");
      setApproveModalOpen(false);
      setDetailModalOpen(false);
      setSelectedSheetId(null);
      fetchSheets();
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  // PATCH /api/admin/sheets-applications/:sheetId/reject — body: { comment }
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
      fetchSheets();
    } catch (err: any) {
      alert(err.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  // list มาจาก SheetCardResponse — content อยู่ใน res.data.content
  const sheets = data?.content || [];

  return (
    <div className="space-y-8 p-2 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Sheet Approvals
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            ตรวจสอบและอนุมัติชีทสรุปที่รอการพิจารณา
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm text-gray-500">รอดำเนินการ: </span>
          <span className="text-lg font-bold text-blue-600">
            {data?.totalElements || 0}
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
                  ข้อมูลชีท
                </th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">
                  วิชา / คณะ
                </th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600">
                  ผู้ขาย / ราคา
                </th>
                <th className="px-8 py-5 text-sm font-semibold text-gray-600 text-center">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400">
                    กำลังดึงข้อมูล...
                  </td>
                </tr>
              ) : sheets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-500">
                    ไม่มีรายการรออนุมัติ
                  </td>
                </tr>
              ) : (
                sheets.map((sheet: any) => (
                  <tr key={sheet.id} className="hover:bg-blue-50/30">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">{sheet.title}</span>
                        <span className="text-xs text-gray-400">
                          ID: {sheet.id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        {/* SheetCardResponse ไม่มี courseCode/faculty ตรงๆ ใช้ category แทน */}
                        <span>{sheet.category?.name || "-"}</span>
                        <span className="text-blue-500 italic">
                          {sheet.university?.nameEn || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span>{sheet.seller?.name || "-"}</span>
                        <span className="text-blue-500 font-semibold">
                          ฿{Number(sheet.price).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => openDetailModal(sheet.id)}
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

      {/* DETAIL MODAL — ใช้ AdminSheetDetailResponse */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">รายละเอียดชีท</h2>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
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

                  {/* ข้อมูลทั่วไป */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">ชื่อชีท</p>
                      <p className="font-semibold text-lg">{sheetDetail.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">สถานะ</p>
                      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mt-1 ${
                        sheetDetail.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : sheetDetail.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {sheetDetail.status || "PENDING"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">เผยแพร่</p>
                      <p className="font-semibold">
                        {sheetDetail.isPublished ? "✅ เผยแพร่แล้ว" : "⏳ ยังไม่เผยแพร่"}
                      </p>
                    </div>
                  </div>

                  {sheetDetail.description && (
                    <>
                      <hr className="border-gray-100" />
                      <div>
                        <p className="text-sm text-gray-500">คำอธิบาย</p>
                        <p className="font-semibold mt-1 text-gray-700 leading-relaxed">
                          {sheetDetail.description}
                        </p>
                      </div>
                    </>
                  )}

                  <hr className="border-gray-100" />

                  {/* ข้อมูลผู้ขาย */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">ข้อมูลผู้ขาย</h3>
                    <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">ชื่อผู้ขาย</p>
                        <p className="font-semibold">{sheetDetail.seller?.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Seller ID</p>
                        <p className="font-semibold text-xs text-gray-400">
                          {sheetDetail.seller?.id?.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* รูปภาพตัวอย่าง */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">รูปภาพตัวอย่าง</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">รูปตัวอย่าง</p>
                        {sheetDetail.imageUrl ? (
                          <button
                            onClick={() => setPreviewImageUrl(sheetDetail.imageUrl)}
                            className="group relative w-full"
                          >
                            <img
                              src={sheetDetail.imageUrl}
                              alt="Sheet Preview"
                              className="w-full h-48 object-cover rounded-xl border border-gray-200 group-hover:opacity-80 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg font-medium">ขยาย</span>
                            </div>
                          </button>
                        ) : (
                          <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                            ไม่มีรูปภาพ
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* lastComment — แสดงเฉพาะตอน REJECTED */}
                  {sheetDetail.lastComment && sheetDetail.status === "REJECTED" && (
                    <>
                      <hr className="border-gray-100" />
                      <div>
                        <p className="text-sm text-gray-500">หมายเหตุจาก Admin</p>
                        <p className="font-semibold text-red-500 mt-1">
                          {sheetDetail.lastComment}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex justify-center py-20 text-red-500">ไม่พบข้อมูล</div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={openRejectModal}
                disabled={loadingDetail || !sheetDetail}
                className="bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
              >
                REJECT
              </button>
              <button
                onClick={openApproveModal}
                disabled={loadingDetail || !sheetDetail}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
              >
                APPROVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 cursor-zoom-out"
          onClick={() => setPreviewImageUrl(null)}
        >
          <img
            src={previewImageUrl}
            alt="Preview"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* APPROVE MODAL */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">ยืนยันการอนุมัติ</h2>
            <p className="text-gray-600">
              คุณต้องการอนุมัติชีท{" "}
              <strong>{sheetDetail?.title}</strong> ใช่หรือไม่?
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

      {/* REJECT MODAL */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">ระบุเหตุผลการปฏิเสธ</h2>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="กรุณาระบุเหตุผล เช่น รูปภาพไม่ชัดเจน, เนื้อหาไม่ครบถ้วน..."
              className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-red-400"
            />
            {!rejectComment.trim() && (
              <p className="text-red-500 text-sm mt-2">จำเป็นต้องระบุเหตุผล</p>
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