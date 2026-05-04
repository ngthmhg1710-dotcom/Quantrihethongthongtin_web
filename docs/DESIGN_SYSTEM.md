# Design System

This project follows a lightweight design system to keep all customer and admin screens consistent.

## 1) Core Principles

- Keep visual language clean, soft, and product-focused.
- Use one primary accent family (pink) and neutral text/background colors.
- Reuse existing UI blocks (cards, buttons, table styles, badges, modals) before creating new variants.
- Maintain predictable spacing and typography rhythm across all pages.

## 2) Color Tokens

### Brand

- `brand.100`: `#FFE4E9`
- `brand.300`: `#FFC0CB`
- `brand.500`: `#FF8DA1` (optional highlight)

### Neutral

- `neutral.900`: `#111111` (primary text/buttons)
- `neutral.700`: `#374151` (secondary text)
- `neutral.500`: `#6B7280` (muted text)
- `neutral.300`: `#D1D5DB` (borders)
- `neutral.100`: `#F3F4F6` (surface)
- `neutral.0`: `#FFFFFF` (base background)

### Feedback

- `success`: `#16A34A`
- `warning`: `#D97706`
- `error`: `#DC2626`
- `info`: `#2563EB`

## 3) Typography

- **Primary Global Font**: `Be Vietnam Pro` (Tối ưu cho hiển thị tiếng Việt).
- **Body/UI & Headings**: Đều sử dụng chung `Be Vietnam Pro`.
- *Lưu ý kỹ thuật:* Trong code hiện tại sử dụng các class tiện ích như `font-['Poppins']` của Tailwind, nhưng đã được ghi đè (remap) CSS trực tiếp trong file `theme.css` để render ra font `Be Vietnam Pro`. Điều này giúp giao diện hiển thị tiếng Việt không bị lỗi dấu.

### Recommended Sizes

- H1: `text-3xl` to `text-4xl`, `font-bold`
- H2: `text-2xl`, `font-bold`
- H3: `text-xl`, `font-semibold`
- Body: `text-base`
- Secondary/meta: `text-sm`
- Captions/help text: `text-xs`

## 4) Spacing Scale

Use Tailwind spacing scale consistently:

- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px
- `6` = 24px
- `8` = 32px
- `12` = 48px

### Layout Guidelines

- Section gap: `gap-6` or `gap-8`
- Card padding: `p-6` (small cards `p-4`)
- Form vertical spacing: `space-y-4`
- Page container max width: `max-w-6xl` (or context-specific)

## 5) Reusable Components

### Buttons

- Primary: dark background (`bg-black text-white`) with rounded full pill.
- Secondary: outlined (`border border-gray-300`) with white background.
- Destructive: red accent only for destructive actions.

### Cards

- Base: `bg-white rounded-2xl shadow-sm`
- Inner sections use subtle separators: `border-b border-gray-100`

### Inputs

- Base: `border border-gray-300 rounded-lg px-4 py-3`
- Focus state: `focus:ring-2 focus:ring-[#FFC0CB]`
- Validation errors should show direct message below field.

### Tables

- Header text: small uppercase or semibold.
- Keep row actions consistent (`View details`, status update).
- Use badges for statuses (pending/processing/shipped/delivered/cancelled).

### Modals

- Rounded large surface with clear title + close button.
- Primary action on the right, cancel/secondary on the left when needed.
- For order details, include copy/print actions.

## 6) Iconography

- Use Lucide icons for visual consistency.
- Icon size in lists/nav labels: `16-18px`.
- Keep icon + label spacing tight (`gap-2`).

## 7) Responsive Rules

- Mobile first.
- Prefer single-column stacks on small screens.
- Switch to 2-column layouts from `md` or `lg` breakpoints where useful.
- Ensure tables either remain readable with min-width + horizontal scroll or convert to cards.

## 8) Screen Coverage (Minimum 8 Main Screens)

Implemented screens:

1. Home
2. Product Listing
3. Product Detail
4. Cart
5. Checkout
6. Login/Register (JWT + Google OAuth)
7. Customer Dashboard
8. Admin Dashboard

## 9) Interaction Coverage

- Complete shopping flow available: browse -> detail -> cart -> checkout -> order history.
- Customer can review products and manage account information.
- Admin can manage products/categories, orders, and overview metrics.

## 10) OAuth Setup Notes

To enable Google OAuth:

1. Set `GOOGLE_CLIENT_ID` in `server/.env`.
2. Set `VITE_GOOGLE_CLIENT_ID` in `client/.env`.
3. Restart both server and client dev processes.

If missing, normal email/password login still works and Google login button is disabled with guidance.
