<div align="center">

# Stellix

**AI-powered financial workspace built for the Stellar ecosystem.**

Stellix combines digital asset management, payments, invoicing, transactions, analytics, and an intelligent financial assistant in one platform. Users can manage assets like USDC, XLM, and EURC, send and receive payments, create invoices, track financial activity, and use natural language to understand their finances.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)

</div>

---

## Overview

Stellix brings AI-powered financial intelligence to the Stellar ecosystem, making onchain finance easier to understand, manage, and use. The application runs on demo data today and is structured for a clean transition to Supabase, the Stellar SDK, and Soroban smart contracts without needing to rebuild the UI.

---

## Features

### Wallet Management
View your Stellar wallet address, check balances across USDC, XLM, and EURC, send and receive assets, and track portfolio changes over time. Every send and receive flow includes a confirmation step before anything is submitted.

### Transaction History
Browse your full transaction history with search, filtering by asset, type, status, and date range. Each transaction opens in a detail view showing its hash, memo, and a direct link to the Stellar Explorer.

### Invoice Management
Create professional invoices with multiple line items, custom due dates, and asset selection. Track payment status across draft, pending, paid, and overdue states. Generate shareable payment links and keep all your billing in one place.

### Financial Analytics
Get a clear picture of your financial activity through interactive charts covering balance over time, income vs. expenses, transaction volume, and asset distribution. Filter by 7D, 30D, 90D, or 1Y. Charts animate as they enter the viewport.

### AI Assistant
Ask questions about your wallet and activity in plain language. The assistant can summarize spending, surface unpaid invoices, and pull insights from your data. It can help you draft a transaction for review but will never execute anything on its own.

### Settings and Profile
Manage your profile, wallet connection, notification preferences, security settings, and appearance (light, dark, or system theme), all saved across sessions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| Build Tool | [Vite 8](https://vitejs.dev/) |
| Routing | [TanStack Router](https://tanstack.com/router) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |

---

## Project Structure

```
stellix-frontend/
├── src/
│   ├── components/         # Feature and UI components
│   │   ├── analytics/      # Chart components
│   │   ├── invoices/       # Invoice form and preview
│   │   ├── layout/         # App shell, sidebar, header, theme
│   │   ├── shared/         # Motion, status, and common components
│   │   ├── transactions/   # Transaction list and detail
│   │   ├── ui/             # Base shadcn/ui components
│   │   └── wallet/         # Send, receive, and wallet flows
│   ├── data/               # Decoupled mock data
│   │   ├── mockAnalytics.ts
│   │   ├── mockAssistant.ts
│   │   ├── mockInvoices.ts
│   │   ├── mockTransactions.ts
│   │   ├── mockUsers.ts
│   │   └── mockWallet.ts
│   ├── routes/             # TanStack Router file-based routes
│   ├── services/           # Service layer (mock today, SDK-ready tomorrow)
│   │   ├── analyticsService.ts
│   │   ├── assistantService.ts
│   │   ├── invoiceService.ts
│   │   ├── transactionService.ts
│   │   └── walletService.ts
│   ├── types/              # Shared TypeScript types
│   └── lib/                # Utilities and helpers
├── public/
├── roadmap.md
└── package.json
```

---

## Architecture

### Service Layer

All data access goes through `src/services/`. Components never import mock data directly; they call service functions that return typed responses. This keeps the mock layer fully replaceable. Switching to Supabase or the Stellar SDK only requires changes inside those service files, nothing in the UI.

```
Component -> Service -> (mock data | Supabase | Stellar SDK)
```

### Planned Integrations

These integration points are already stubbed in the service layer and ready to wire up:

- **Supabase** - authentication, user profiles, invoice persistence, and notification delivery
- **Stellar SDK** - wallet connection, balance queries, and transaction submission
- **Soroban smart contracts** - on-chain invoice settlement and payment verification

### Design System

The entire application uses a strict two-color identity: **Gold** and **Milk**, across both light and dark mode. No other brand colors exist anywhere in the codebase.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm 10 or later (or [bun](https://bun.sh/))

### Running locally

```sh
# Clone the repository
git clone https://github.com/Lumora-Finance/Stellix_front-end.git
cd stellix-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## Roadmap

- [x] Gold and Milk design system, themes, motion, and responsive app shell
- [x] Domain types, realistic mock data, and future-ready mock services
- [x] Dashboard and wallet send/receive flows
- [x] Transaction search, filters, pagination, and detail views
- [x] Invoice list, creation, detail, and payment-link workflows
- [x] Analytics, assistant, settings, profile, and help pages
- [x] Route metadata, 404, loading, empty, and error states
- [ ] Supabase authentication and data persistence
- [ ] Stellar SDK wallet connection and live balance queries
- [ ] Live transaction submission with Stellar network
- [ ] Soroban smart contract invoice settlement
- [ ] Real AI assistant integration (e.g. OpenAI, Anthropic)
- [ ] PDF invoice export
- [ ] Mobile app (React Native)

---

## Contributing

Contributions are welcome. Follow the steps below to keep things consistent.

### 1. Fork and clone

```sh
git clone https://github.com/<your-username>/Stellix_front-end.git
cd stellix-frontend
npm install
```

### 2. Create a branch

Pick a descriptive name that reflects what you are working on.

```sh
git checkout -b feat/soroban-invoice-settlement
```

Branch naming:
- `feat/` - new feature
- `fix/` - bug fix
- `chore/` - maintenance, refactoring, or tooling
- `docs/` - documentation only

### 3. Make your changes

- Keep all external data access behind `src/services/`. Components should never import wallet, cloud, or contract SDKs directly.
- Follow the existing component structure under `src/components/`.
- New components must work in both light and dark mode.
- Stick to Gold and Milk brand colors only.
- Every icon-only button needs an accessible tooltip.
- Run `npm run lint` and `npm run build` before opening a pull request.

### 4. Commit your changes

Write clear, imperative commit messages.

```sh
git add .
git commit -m "feat: add Soroban invoice settlement flow"
```

### 5. Open a pull request

Push your branch and open a pull request against `main`. Add a short description of what changed and why.

```sh
git push origin feat/soroban-invoice-settlement
```

> **Note:** This project is connected to [Lovable](https://lovable.dev). Do not force-push, rebase, or amend commits that have already been pushed, as it rewrites history on Lovable's side and will break the project sync.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
Built for the Stellar ecosystem.
</div>
