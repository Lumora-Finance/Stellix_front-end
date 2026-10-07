# StellarFlow application plan

## Goal
Build the complete StellarFlow financial workspace as a polished, responsive frontend using realistic demo data. The product opens directly into the application, not a marketing page, and every visible control has a working frontend interaction.

## Product shell and visual system
- Create a shared application shell with desktop sidebar, tablet/mobile drawer, compact mobile navigation, page header, notifications, wallet connection, profile menu, and accessible tooltips.
- Replace the starter palette with a strict Gold + Milk semantic token system for light and dark modes; use only opacity and contrast variations of those families.
- Add a premium sans-serif type system, restrained elevation, visible focus states, compact card radii, and smooth theme transitions.
- Support Light, Dark, and System appearance modes with persisted preference and reduced-motion support.
- Build reusable motion primitives modeled on React Bits patterns: one-time viewport reveals, staggered entrances, count-up values, blur/fade transitions, subtle hover lift, and chart reveal animation.

## Architecture
- Define shared types for wallets, assets, transactions, invoices, line items, payments, users, analytics, and assistant messages.
- Keep realistic demo records in dedicated data modules, separate from interface code.
- Add asynchronous service interfaces for wallet, transaction, invoice, analytics, and assistant operations, with small simulated delays and clearly labeled demo results.
- Keep wallet and transaction methods shaped for future Stellar SDK/Soroban adapters and data methods shaped for future Lovable Cloud integration, without adding backend infrastructure now.
- Add shared formatters, clipboard helpers, status treatments, loading states, empty states, error states, and confirmation patterns.

## Pages and workflows
- `/dashboard`: greeting, animated wallet balance, portfolio assets, statistics, quick actions, three chart previews, recent transactions, invoice summary, and activity.
- `/wallet`: address tools, balance visibility, asset list, send confirmation flow, receive QR/address dialog, and mock wallet connection state.
- `/transactions`: search, asset/type/status/date filters, responsive table/cards, pagination, and transaction detail dialog with mock explorer action.
- `/invoices`: summary statistics, status tabs, responsive records, view/edit/duplicate/share/delete actions, and payment-link copying.
- `/invoices/new`: validated multi-line-item form with draft, preview, create, loading, and success states.
- `/invoices/:id`: professional invoice preview, payment status, share/copy/print/download/mark-paid interactions, and missing-invoice state.
- `/analytics`: period filters, demo-data label, five key statistics, five responsive charts, and useful generated insights.
- `/assistant`: deterministic chat based on demo financial data, suggested prompts, copy/regenerate/clear controls, typing state, and safe transaction drafts that require explicit wallet review.
- `/settings`: profile, wallet, notifications, security, and appearance tabs with functional controls.
- `/profile`: identity, wallet details, join date, recent activity, and open-source contribution summary.
- `/help`: practical product help so the sidebar destination is real.
- `/` redirects into `/dashboard`; unknown paths use the branded 404 experience.

## Reusable interface pieces
- Application layout, sidebar, header, mobile navigation, theme control, wallet-connect control.
- Stat card, wallet card, asset row, quick action, chart card, transaction row/detail, invoice status/table/form/preview/payment link.
- Send flow, receive flow, confirmation dialog, QR-style address panel, filters, pagination, notifications panel, and assistant message components.
- Skeletons for wallet, transactions, invoices, and charts; Gold + Milk empty and error states.

## Interaction and accessibility rules
- Use only Lucide icons from the supplied icon specification, with consistent sizing and Gold/neutral emphasis.
- Give every icon-only control both an accessible name and tooltip.
- Use semantic labels, keyboard-operable dialogs/menus/tabs, focus management from the existing interface primitives, and status text in addition to icons.
- Never imply that a demo blockchain operation was submitted. Send actions stop at an explicit demo confirmation result, and assistant requests only create reviewable drafts.
- Make tables collapse into scannable mobile cards, prevent horizontal overflow, and keep primary touch targets at least 44px.

## Validation
- Verify every requested route, navigation destination, filter, search, tab, dialog, form, theme mode, clipboard action, and safe transaction-review flow.
- Check desktop and mobile layouts, light and dark modes, reduced-motion behavior, overflow, icon tooltips, console/runtime errors, and the preview build.
- Add unique metadata for every content page and remove all starter branding.
