"use client";
import * as React from "react";
import type { Assignee } from "@/data/assignees";

type SidebarProps = {
  boardName?: string;

  columns: { id: string; name: string }[];
  selectedColumnId: string | "all";
  onSelectColumn: (id: string | "all") => void;

  assignees: Assignee[]; // roster with avatars
  defaultAssignee: string | null; // name or null
  onDefaultAssignee: (name: string | null) => void;

  onQuickAddCard: (payload: {
    columnId: string;
    title: string;
    description: string;
    assignee: string | null;
  }) => Promise<void>;
};

export default function Sidebar({
  boardName,
  columns,
  selectedColumnId,
  onSelectColumn,
  assignees,
  defaultAssignee,
  onDefaultAssignee,
  onQuickAddCard,
}: SidebarProps) {
  const initialTarget =
    selectedColumnId === "all"
      ? columns[0]?.id ?? ""
      : (selectedColumnId as string);

  const [targetColumn, setTargetColumn] = React.useState<string>(initialTarget);
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  React.useEffect(() => {
    if (selectedColumnId !== "all") setTargetColumn(selectedColumnId);
  }, [selectedColumnId]);

  async function addCard() {
    if (!title.trim() || !targetColumn) return;
    try {
      setAdding(true);
      await onQuickAddCard({
        columnId: targetColumn,
        title: title.trim(),
        description: desc.trim(),
        assignee: defaultAssignee, // may be null
      });
      setTitle("");
      setDesc("");
    } finally {
      setAdding(false);
    }
  }

  return (
    // 🔧 was: inset-y-16 (creates 4rem gap at bottom)
    // now: top-16 bottom-0 so it fills to the footer
    <aside className="fixed top-16 bottom-0 left-0 z-10 w-64 bg-indigo-950/90 border-r border-indigo-900/60 text-slate-100 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-indigo-300/80">
            Workspace
          </div>
          <div className="mt-1 font-semibold truncate">
            {boardName ?? "Kanban"}
          </div>
        </div>

        {/* Filter: show one column or all */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-indigo-200/80 mb-1.5">
            Kanban Column
          </label>
          <select
            className="w-full rounded-md bg-indigo-900/70 border border-indigo-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-400"
            value={selectedColumnId}
            onChange={(e) => onSelectColumn(e.target.value as any)}
          >
            <option value="all">All columns</option>
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee roster with avatars */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-indigo-200">Assignees</div>
          <div className="flex flex-wrap gap-2">
            {/* Unassigned pill */}
            <button
              onClick={() => onDefaultAssignee(null)}
              className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs
                ${
                  defaultAssignee === null
                    ? "border-emerald-400 text-emerald-300 bg-black/20"
                    : "border-indigo-800 bg-indigo-900/50 text-indigo-200"
                }
              `}
              title="Unassigned"
            >
              <span className="inline-grid place-items-center h-6 w-6 rounded-full bg-indigo-800/50">
                –
              </span>
              Unassigned
            </button>

            {assignees.map((a) => (
              <button
                key={a.name}
                onClick={() => onDefaultAssignee(a.name)}
                className={`flex items-center gap-2 rounded-full border px-2 py-1 text-xs
                  ${
                    defaultAssignee === a.name
                      ? "border-emerald-400 text-emerald-300 bg-black/20"
                      : "border-indigo-800 bg-indigo-900/50 text-indigo-200"
                  }
                `}
                title={a.name}
              >
                <img
                  src={a.avatar}
                  alt={a.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                {a.name}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Add Card */}
        <div className="space-y-2 rounded-lg border border-indigo-900 bg-indigo-900/40 p-3">
          <div className="text-xs font-medium text-indigo-200">
            Quick add card
          </div>

          <label className="block text-[10px] uppercase tracking-wider text-indigo-200/80">
            Target list
          </label>
          <select
            className="w-full mb-1 rounded-md bg-indigo-900/70 border border-indigo-800 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-400"
            value={targetColumn}
            onChange={(e) => setTargetColumn(e.target.value)}
          >
            {columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Card title"
            className="w-full rounded-md bg-indigo-900/70 border border-indigo-800 px-3 py-2 text-sm outline-none placeholder:text-indigo-300/60 focus:ring-1 focus:ring-indigo-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCard()}
          />
          <input
            type="text"
            placeholder="Card description"
            className="w-full rounded-md bg-indigo-900/70 border border-indigo-800 px-3 py-2 text-sm outline-none placeholder:text-indigo-300/60 focus:ring-1 focus:ring-indigo-400"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCard()}
          />

          <button
            onClick={addCard}
            disabled={!title.trim() || !targetColumn || adding}
            className={`w-full rounded-md text-white text-sm py-2 transition ${
              !title.trim() || !targetColumn || adding
                ? "bg-emerald-600/50 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {adding ? "Adding…" : "+ Add card"}
          </button>
        </div>
      </div>
    </aside>
  );
}
