/** Giá trị lưu trong API (slug) → nhãn hiển thị tiếng Việt */
export const SKIN_TYPE_LABEL_VI: Record<string, string> = {
  all: 'Mọi loại da',
  dry: 'Da khô',
  oily: 'Da dầu',
  combination: 'Da hỗn hợp',
  normal: 'Da thường',
  sensitive: 'Da nhạy cảm',
  mature: 'Da lão hóa',
};

export function skinTypeLabelVi(slug: string): string {
  return SKIN_TYPE_LABEL_VI[slug] ?? slug;
}
