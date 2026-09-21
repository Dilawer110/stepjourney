# FMCG Sales & Outlet Visit Mobile App - Handoff Document

This document serves as a comprehensive overview of the **FMCG Sales & Outlet Visit App**. It is designed to act as a definitive reference or a "step-by-step prompt" for developers, AI assistants, or project managers inheriting the codebase.

---

## 1. Project Overview & Architecture

**Goal:** A Mobile-first (PWA-optimized) application for FMCG (Fast-Moving Consumer Goods) Sales Representatives to view their daily routes, capture outlet visits (with geofencing), generate complex sales orders, output print-ready invoices, and export end-of-day stock & cash summary reports.

### Tech Stack
*   **Framework:** Next.js 14 (App Router), React, TypeScript
*   **Styling:** Tailwind CSS, Google Material Symbols (Outlined)
*   **Backend & DB:** Supabase (PostgreSQL), Supabase Auth
*   **Print Engine:** Native Browser Print (`@media print`, `window.print()`)
*   **State / Offline Storage:** React Hooks (`useState`, `useMemo`), `localStorage`

### Key Architectural Decisions
*   **"No-Library" PDF Printing:** Instead of relying on heavy libraries like `jsPDF` or `html2canvas`, all reports and invoices use standard HTML/CSS printed natively. Standard CSS properties (`page-break-after`, `break-inside: avoid`) manage pagination securely.
*   **Minimal Backend Payload:** To keep the offline-first experience snappy, finalized `order` JSON payloads are cached to the browser's `localStorage` (`orders_YYYY-MM-DD`). Supabase simply tracks the *status* of the outlet visit (`billed`, `visited`, `remaining`).

---

## 2. Screens & UI Workflows

### A. Authentication (`/login`)
*   **UI:** Clean, centered login card with company branding.
*   **Logic:** Uses Supabase Email/Password authentication. Redirects to `/` on success.

### B. Daily Route & Outlet Dashboard (`/` or `app/page.tsx`)
*   **UI:** Mobile-app style layout with a sticky top header showing the current Day, Route (PJP), and sync/end-day controls.
*   **Features:**
    *   **Filters:** "Vst", "Bill", "UnBill-V", "UnBill-UV", "Revisit", "All".
    *   **Search:** Real-time filter by outlet name, code, or channel.
    *   **Actionable Outlet Cards:** Displays Outlet Name, Channel, and a color-coded status badge. Tapping "Order" captures the user's GPS coordinates and jumps to the Order module.

### C. Order Creation & Invoice Engine (`/order`)
*   **UI:** A multi-step flow completely housed within a single dynamic page utilizing a `view` state (`'order' | 'picker' | 'review' | 'success' | 'print'`).
*   **Features:**
    *   **Product Picker:** Searchable, categorized list of SKUs.
    *   **Cart Editor:** Adjust quantities, select pricing tiers (Tier 1/Tier 2), channel rules (Retail, LMT, Wholesale, Institution), and tax status (Registered/Unregistered).
    *   **Success Screen:** Confirms order creation and caches the data array locally.

### D. Bulk Order Export (`/export`)
*   **UI:** A multi-select checklist interface (modeled on Google Stitch design).
*   **Features:**
    *   Displays all locally cached orders for the current day.
    *   **Action Sheet Modal:** Slides up allowing the user to select export formats.
    *   **Combined PDF Print:** Triggers a print preview rendering all selected invoices consecutively (via CSS page-break).
    *   **Native Share:** Leverages the Web Share API (`navigator.share`) for instant WhatsApp/Email distribution.

### E. End of Day Summary Report (`/report`)
*   **UI:** A dedicated, A4 Landscape printable dashboard.
*   **Features:** Uses a "Zipped Table" HTML methodology to cleanly render a 50/50 split view (Left side: Cash Receivables by Buyer, Right side: Total SKU Load Pick) ensuring browsers naturally paginate without breaking rows.

---

## 3. Database Schema (Supabase)

Below are the core Postgres tables backing the application:

### `public.outlets`
Stores the master data for all stores/buyers.
*   `id` (uuid, primary key)
*   `code` (text, e.g., "N00000000618")
*   `name` (text, e.g., "Adeel Store")
*   `type`, `channel`, `sub_channel` (text classifications)
*   `latitude`, `longitude` (float)

### `public.outlet_visits`
Tracks the daily interaction history.
*   `id` (uuid)
*   `outlet_id` (uuid, foreign key -> outlets)
*   `order_booker_id` (uuid, foreign key -> profiles/users)
*   `visit_date` (date)
*   `status` (enum: 'remaining', 'visited', 'billed', 'revisit_req')
*   `latitude`, `longitude` (float, exact location when action clicked)
*   `visited_at` (timestamp)

### `public.profiles` & `public.routes`
*   `profiles`: Custom user data attached to Supabase Auth.
*   `routes`: Salesman routes and territories mapping.

*(Note: Products/SKUs are currently hardcoded inside `app/order/page.tsx` (`const PRODUCTS`) to minimize DB latency, but can easily be migrated to a `public.products` table).*

---

## 4. Complex Business Logic & Calculations

The calculation engine (`calcOrder` in `app/order/page.tsx`) handles highly specific Pakistani FMCG pricing logic:

1.  **Trade Price (TP):** The base price (Ex-GST).
2.  **Trade Offer:** A percentage discount applied *before* GST. Varies based on the Channel (Retail GT vs Wholesale vs Institution).
3.  **Slab Discount:** Volume-based discounts applying conditionally depending on the selected Tier.
4.  **GST (Sales Tax):** Calculated globally at 18% on the (Gross Amount - Trade Offer).
5.  **Advance Tax (WHT):** Conditionally applied based on whether the buyer is `registered` (0.5%) or `unregistered` (2.5%). Calculated against the Gross Amount.
6.  **Landed Cost:** A display metric calculated per-unit, per-dozen, and per-carton, definitively inclusive of GST and Advance Tax to show the buyer their *actual* unit cost.

---

## 5. Next Steps & Future Handoff Tasks

If continuing development, prioritize the following:
1.  **Centralize Product Catalog:** Move `const PRODUCTS` from `app/order/page.tsx` into Supabase (`public.products`) and fetch on initialization.
2.  **Order Persistence:** Currently, line items and payable totals are saved to `localStorage` (via `orders_${todayStr}`). These should eventually be synced to a `public.orders` and `public.order_items` table in Supabase during the "End Day" routine.
3.  **PWA Manifest:** Finalize `manifest.json` and a Service Worker to allow full offline installation and caching.
