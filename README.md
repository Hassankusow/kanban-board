# Kanban Board

[![CI](https://github.com/Hassankusow/kanban-board/actions/workflows/ci.yml/badge.svg)](https://github.com/Hassankusow/kanban-board/actions/workflows/ci.yml)

A full-stack Trello-style Kanban board with real-time drag-and-drop, multi-assignee support, and role-based access. Built with Next.js 15, Apollo GraphQL, and Nhost (Hasura + Auth).

---

## Features

- **Drag-and-drop** — reorder cards within and across columns using dnd-kit; drag entire columns left/right
- **Multi-board workspace** — create, browse, and delete multiple boards from a home dashboard
- **Assignee system** — assign team members to cards via an inline avatar picker
- **Quick-add sidebar** — add cards to any column directly from the sidebar without opening a modal
- **Column filtering** — focus on one column at a time via sidebar filter
- **Color-coded columns** — each list gets a distinct header color and matching card theme
- **Real-time GraphQL** — all mutations backed by Hasura via Apollo Client with immediate refetch

---

## Tech Stack

**Frontend:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui

**Data / API:** Apollo Client · GraphQL Codegen · Hasura (via Nhost)

**Drag and Drop:** dnd-kit (core + sortable + modifiers)

**Auth / Backend:** Nhost (Hasura + Nhost Auth) · PostgreSQL

---

## Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in NEXT_PUBLIC_NHOST_SUBDOMAIN, NEXT_PUBLIC_NHOST_REGION, HASURA_ADMIN_SECRET

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home — board list
│   ├── boards/[id]/page.tsx  # Board view with DnD
│   └── layout.tsx
├── components/
│   ├── BoardList.tsx         # Board CRUD + modal
│   └── Sidebar.tsx           # Column filter + quick-add + assignees
├── graphql/
│   ├── *.graphql             # Queries and mutations
│   └── generated/            # Auto-generated TypeScript types
├── lib/
│   ├── apollo.ts             # Apollo client setup
│   └── nhost.ts              # Nhost client
└── data/
    └── assignees.ts          # Assignee roster
```

---

## Author

**Hassan Abdi**
[GitHub](https://github.com/Hassankusow) · [LinkedIn](https://linkedin.com/in/hassan-abdi-119357267)
