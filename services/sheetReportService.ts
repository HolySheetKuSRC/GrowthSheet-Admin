// services/sheetReportService.ts
import api from "@/lib/axios";

export interface SheetReportResponse {
  id: string;
  sheetId: string;
  reporterId: string;
  reason: string;
  status: string;
  adminId?: string;  
  adminNote?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ReviewReportPayload {
  status: string;
  adminNote?: string;
  suspendSheet?: boolean;
}

export const sheetReportService = {
  /**
   * ดู report ทั้งหมด (กรองตาม status ได้)
   */
  getReports: async (status: string = "PENDING", page: number = 0, size: number = 10) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("size", size.toString());

    const res = await api.get<PageResponse<SheetReportResponse>>(`/admin/sheet-reports?${params.toString()}`);
    return res.data;
  },

  /**
   * ดู report ทั้งหมดของ sheet นั้น
   */
  getReportsBySheet: async (sheetId: string, page: number = 0, size: number = 10) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());

    const res = await api.get<PageResponse<SheetReportResponse>>(`/admin/sheet-reports/sheets/${sheetId}?${params.toString()}`);
    return res.data;
  },

  /**
   * Admin review report
   */
  reviewReport: async (reportId: string, payload: ReviewReportPayload) => {
    const res = await api.patch<SheetReportResponse>(`/admin/sheet-reports/${reportId}/review`, payload);
    return res.data;
  },

  /**
   * User กด report ชีท (ส่ง reason ใน body)
   */
  reportSheet: async (sheetId: string, reason: string) => {
    const res = await api.post<SheetReportResponse>(`/products/${sheetId}/report`, { reason });
    return res.data;
  }
};
