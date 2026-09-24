# AI Project Context & Handoff: StepJourney

**To the receiving AI / Assistant:**  
*Read this document carefully before suggesting architectural changes, writing new features, or refactoring code. It contains the core philosophy, technical constraints, and state of the StepJourney application.*

## 1. Project Identity & Purpose
**StepJourney** is a mobile-first, Progressive Web Application (PWA) designed for FMCG (Fast-Moving Consumer Goods) field sales teams, specifically Order Bookers and Salesmen. 

Its primary job is to function reliably in the field with poor or zero internet connectivity. It allows salesmen to view their daily journey (PJP), book orders, process sales returns, conduct merchandising surveys (Brand Positioning), and generate end-of-day reports.

## 2. Tech Stack & Environment
- **Framework:** Next.js 14 (App Router)
- **Deployment:** Static Export (`next export`) hosted on GitHub Pages.
- **Styling:** Tailwind CSS (Strictly mobile-first, responsive, lightweight).
- **Language:** TypeScript / React 18.
- **Backend / Data:** Supabase (for Auth and remote DB sync) + **Browser `localStorage`** (for offline-first field operations).

## 3. Strict Architectural Rules (CRITICAL)
When contributing to this project, adhere to the following constraints. **Do not violate these without explicit user permission.**

1. **Lightweight & Native Over Libraries:** 
   - **Do NOT** install heavy third-party libraries (like `jspdf`, `html2canvas`, or heavy state managers like Redux).
   - *Example:* Invoice PDF generation is handled natively using CSS `@media print` and the browser's built-in print dialog.
2. **Do Not Rewrite the Core Calculation Engine:**
   - The `calcOrder` function in `app/order/page.tsx` perfectly handles complex FMCG math: Trade Price (ex-GST), GT/MT percentage trade offers, tiered slab discounts based on net volume, 18%/22% GST, and 1%/2.5% Advance Tax. Leave it alone unless fixing a proven mathematical bug.
3. **Offline-First via LocalStorage:**
   - Field operations rely on `localStorage`. 
   - `todayOutlets` caches the daily route.
   - `orders_YYYY-MM-DD` stores the day's finalized invoices.
   - `survey_YYYY-MM-DD` stores offline brand positioning surveys.
   - *Rule:* Always read/write to these local structures first. Synchronization to Supabase happens asynchronously.
4. **Preserve the UI/UX:**
   - The UI is designed for fast, one-handed mobile use ("Tap → Tick → Quantity → Save"). 
   - Stick to the existing Tailwind color palette (Slate, Blue, Emerald, Indigo) and layout conventions (sticky headers, bottom action bars, `h-[100dvh]` scrolling panes).

## 4. Codebase Map
- `/app/page.tsx`: The main Dashboard / PJP Outlet List. Handles filtering and launching outlet-specific tasks.
- `/app/order/page.tsx`: The Order Booking engine. Manages cart state, handles calculations, and saves the final invoice.
- `/app/return/page.tsx`: The Sales Return engine (shares math logic with ordering).
- `/app/brand-positioning/page.tsx`: A compact merchandising survey matching exact UI specs from Google Stitch. Normalizes entered stock (Units vs. Cartons) using the `PRODUCTS` master list.
- `/app/report/page.tsx`: A native A4 printable report consolidating all daily invoices into a Cash & Stock summary.
- `/app/export/page.tsx`: A bulk-export interface to combine multiple invoices into a single printable PDF stream or share via native Web Share API.
- `/components/OutletCard.tsx`: The heavily used mobile list item representing a shop, containing action buttons (Order, Return, Survey, Brand Positioning) and status toggles.
- `/components/PrintInvoice.tsx`: A visually isolated, print-only React component used for generating accurate receipt/invoice outputs.

## 5. Current State & Next Steps
The application is functionally complete for its MVP phase. It successfully compiles (`npm run build`) with zero Next.js static generation errors and is deployed live.

**Expected Upcoming Work:**
- Wiring the background sync mechanism to flush the `localStorage` queues (`orders_*`, `survey_*`) up to Supabase when the user taps a "Sync Data" button or detects Wi-Fi.
- Migrating the hardcoded `PRODUCTS` array into a Supabase-managed table that caches locally on initial login.
- Hooking the existing camera toggle states (in the survey module) to actual device camera APIs and Supabase Storage buckets.
