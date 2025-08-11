"use client";

import Sidebar from "@/components/Sidebar";
import { ASSIGNEES } from "@/data/assignees";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  useGetBoardByIdQuery,
  GetBoardByIdQuery,
  useCreateColumnMutation,
  useCreateCardMutation,
  useDeleteColumnMutation,
  useDeleteCardMutation,
  useUpdateCardPositionMutation,
  useUpdateColumnOrderMutation,
  useUpdateCardAssigneeMutation,
} from "@/graphql/generated";

import {
  DndContext,
  closestCorners,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ---------- color helpers ---------- */
const columnHeaderColor = (idx: number) => {
  const palette = [
    "bg-rose-600",
    "bg-sky-600",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-violet-600",
  ];
  return palette[idx % palette.length];
};
const cardThemeFor = (idx: number) => {
  const themes = [
    {
      card: "bg-rose-700/80 border-rose-800 text-rose-50",
      pill: "bg-rose-800/40 border-rose-400/30 text-rose-100",
    },
    {
      card: "bg-sky-700/80 border-sky-800 text-sky-50",
      pill: "bg-sky-800/40 border-sky-400/30 text-sky-100",
    },
    {
      card: "bg-amber-700/80 border-amber-800 text-amber-50",
      pill: "bg-amber-800/40 border-amber-400/30 text-amber-100",
    },
    {
      card: "bg-emerald-700/80 border-emerald-800 text-emerald-50",
      pill: "bg-emerald-800/40 border-emerald-400/30 text-emerald-100",
    },
    {
      card: "bg-violet-700/80 border-violet-800 text-violet-50",
      pill: "bg-violet-800/40 border-violet-400/30 text-violet-100",
    },
  ];
  return themes[idx % themes.length];
};
const avatarFor = (name?: string | null) =>
  ASSIGNEES.find((a) => a.name.toLowerCase() === (name ?? "").toLowerCase())
    ?.avatar;

type Column = NonNullable<GetBoardByIdQuery["boards_by_pk"]>["columns"][0];
type Card = Column["cards"][0] & { assignee?: string | null };

/* ---------- Sortable column outer shell (for dragging columns) ---------- */
function SortableColumnShell({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      data: { type: "column", columnId: id },
    });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-72 shrink-0"
    >
      {children}
    </div>
  );
}

/* ---------- Sortable Card ---------- */
function CardItem({
  card,
  columnId,
  theme,
  onDelete,
  onSetAssignee,
}: {
  card: Card;
  columnId: string;
  theme: ReturnType<typeof cardThemeFor>;
  onDelete: (card: Card) => void;
  onSetAssignee: (id: string, assignee: string | null) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", cardId: card.id, columnId },
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };
  const avatar = avatarFor(card.assignee);

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={`rounded-lg border p-3 shadow-sm ${theme.card} ${
          isDragging ? "opacity-70 scale-[1.01]" : ""
        } transition`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium truncate">{card.title}</div>
            {card.description && (
              <div className="mt-1 text-sm/5 opacity-90 break-words">
                {card.description}
              </div>
            )}

            {/* Avatar + quick assign menu */}
            <details className="mt-2 group relative">
              <summary className="list-none flex items-center gap-2 cursor-pointer">
                <span className="inline-flex items-center gap-2">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={card.assignee ?? ""}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-6 w-6 rounded-full bg-black/20 grid place-items-center">
                      –
                    </span>
                  )}
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded border ${theme.pill}`}
                  >
                    {card.assignee ?? "Unassigned"}
                  </span>
                </span>
              </summary>

              {/* menu */}
              <div className="absolute z-20 mt-2 rounded-md border border-black/30 bg-black/60 backdrop-blur p-2 flex flex-col gap-1">
                <button
                  onClick={async () => {
                    await onSetAssignee(card.id, null);
                    (document.activeElement as HTMLElement | null)?.blur();
                  }}
                  className="flex items-center gap-2 text-xs px-2 py-1 rounded hover:bg-white/10"
                >
                  <span className="h-5 w-5 rounded-full bg-white/10 grid place-items-center">
                    –
                  </span>
                  Unassigned
                </button>
                {ASSIGNEES.map((a) => (
                  <button
                    key={a.name}
                    onClick={async () => {
                      await onSetAssignee(card.id, a.name);
                      (document.activeElement as HTMLElement | null)?.blur();
                    }}
                    className="flex items-center gap-2 text-xs px-2 py-1 rounded hover:bg-white/10"
                  >
                    <img
                      src={a.avatar}
                      alt={a.name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    {a.name}
                  </button>
                ))}
              </div>
            </details>
          </div>

          <button
            onClick={() => onDelete(card)}
            className="rounded-md border border-black/30 bg-black/20 px-2 py-1 text-[11px] hover:bg-black/30"
            title="Delete card"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

/* ---------- Droppable list (catch drops into empty columns) ---------- */
function DroppableColumn({
  columnId,
  children,
}: {
  columnId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id: `column-${columnId}`,
    data: { type: "column-droppable", columnId },
  });
  return (
    <ul ref={setNodeRef} className="p-3 space-y-3 min-h-[12px]">
      {children}
    </ul>
  );
}

export default function BoardPage() {
  const { id } = useParams();
  const boardId = (typeof id === "string" ? id : id?.[0]) as string | undefined;

  const { data, loading, error, refetch } = useGetBoardByIdQuery({
    variables: { id: boardId as string },
    skip: !boardId,
    fetchPolicy: "network-only",
  });

  const [createColumn] = useCreateColumnMutation();
  const [createCard] = useCreateCardMutation();
  const [deleteColumn] = useDeleteColumnMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [updateCardPos] = useUpdateCardPositionMutation();
  const [updateColumnOrder] = useUpdateColumnOrderMutation();
  const [updateAssignee] = useUpdateCardAssigneeMutation();

  // sidebar state
  const [selectedColumnId, setSelectedColumnId] = useState<string | "all">(
    "all"
  );
  const [defaultAssignee, setDefaultAssignee] = useState<string | null>(null);

  // new column
  const [newColName, setNewColName] = useState("");
  const [addingCol, setAddingCol] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // data shaping
  const board = data?.boards_by_pk ?? null;
  const columns = useMemo(
    () =>
      [...(board?.columns ?? [])].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
      ),
    [board?.columns]
  );
  const cardsByColumn = useMemo(() => {
    const m: Record<string, Card[]> = {};
    for (const c of columns) {
      m[c.id] = [...((c.cards as Card[]) ?? [])].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
      );
    }
    return m;
  }, [columns]);
  const sidebarColumns = useMemo(
    () => columns.map((c) => ({ id: c.id, name: c.name })),
    [columns]
  );
  const visibleColumns = useMemo(
    () =>
      selectedColumnId === "all"
        ? columns
        : columns.filter((c) => c.id === selectedColumnId),
    [columns, selectedColumnId]
  );

  if (!boardId) return <p className="text-slate-200">Missing board id</p>;
  if (loading) return <p className="text-slate-200">Loading...</p>;
  if (error || !board)
    return <p className="text-slate-200">Error loading board</p>;

  /* ---------- helpers ---------- */
  async function persistCardReindex(columnId: string, ids: string[]) {
    await Promise.all(
      ids.map((cid, i) =>
        updateCardPos({
          variables: { id: cid, column_id: columnId, order_index: i * 1.0 },
        })
      )
    );
  }
  async function persistColumnReindex(ids: string[]) {
    await Promise.all(
      ids.map((colId, i) =>
        updateColumnOrder({ variables: { id: colId, order_index: i * 1.0 } })
      )
    );
  }

  /* ---------- actions ---------- */
  async function handleAddColumn() {
    if (!board) return;
    const name = newColName.trim();
    if (!name || addingCol) return;
    try {
      setAddingCol(true);
      await createColumn({
        variables: {
          board_id: board.id,
          name,
          order_index: columns.length * 1.0,
        },
      });
      setNewColName("");
      await refetch();
    } finally {
      setAddingCol(false);
    }
  }
  async function handleDeleteColumn(column: Column) {
    if (!window.confirm(`Delete column "${column.name}"?`)) return;
    await deleteColumn({ variables: { id: column.id } });
    await refetch();
  }
  async function handleDeleteCard(card: Card) {
    if (!window.confirm(`Delete card "${card.title}"?`)) return;
    await deleteCard({ variables: { id: card.id } });
    await refetch();
  }
  async function setCardAssignee(id: string, assignee: string | null) {
    await updateAssignee({ variables: { id, assignee } });
    await refetch();
  }
  async function handleQuickAddCard(payload: {
    columnId: string;
    title: string;
    description: string;
    assignee: string | null;
  }) {
    const { columnId, title, description, assignee } = payload;
    if (!title.trim()) return;
    await createCard({
      variables: {
        column_id: columnId,
        title: title.trim(),
        description: description.trim(),
        order_index: cardsByColumn[columnId]?.length ?? 0,
        assignee, // may be null or a name from roster
      },
    });
    await refetch();
  }

  /* ---------- DnD ---------- */
  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const aType = active.data.current?.type as "card" | "column" | undefined;
    const oType = over.data.current?.type as string | undefined;

    // Column drag
    if (aType === "column") {
      const ids = visibleColumns.map((c) => c.id);
      const from = ids.indexOf(active.id as string);
      const to =
        oType === "column"
          ? ids.indexOf(over.id as string)
          : ids.indexOf((over.data.current as any)?.columnId || "");
      if (from < 0 || to < 0 || from === to) return;
      const next = arrayMove(ids, from, to);
      await persistColumnReindex(next);
      await refetch();
      return;
    }

    // Card drag
    if (aType === "card") {
      const fromColId = active.data.current?.columnId as string | undefined;
      const cardId = active.data.current?.cardId as string | undefined;
      const toColId =
        (oType === "card" ? (over.data.current as any)?.columnId : undefined) ??
        (typeof over.id === "string" && over.id.startsWith("column-")
          ? over.id.replace("column-", "")
          : fromColId);

      if (!fromColId || !toColId || !cardId) return;

      const fromCards = [...(cardsByColumn[fromColId] ?? [])];
      const toCards =
        fromColId === toColId ? fromCards : [...(cardsByColumn[toColId] ?? [])];
      const fromIndex = fromCards.findIndex((c) => c.id === cardId);

      let toIndex = toCards.length;
      if (oType === "card") {
        const overId = over.id as string;
        const i = toCards.findIndex((c) => c.id === overId);
        if (i >= 0) toIndex = i;
      }

      if (fromColId === toColId) {
        const next = arrayMove(toCards, fromIndex, toIndex);
        await persistCardReindex(
          toColId,
          next.map((c) => c.id)
        );
      } else {
        const [moved] = fromCards.splice(fromIndex, 1);
        toCards.splice(toIndex, 0, moved);
        await Promise.all([
          persistCardReindex(
            fromColId,
            fromCards.map((c) => c.id)
          ),
          persistCardReindex(
            toColId,
            toCards.map((c) => c.id)
          ),
        ]);
      }
      await refetch();
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* header */}
      <header className="fixed top-0 inset-x-0 z-20 h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="h-full px-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{board.name}</h1>
          <div className="text-sm text-slate-400">
            {columns.length} lists •{" "}
            {columns.reduce((n, c) => n + (c.cards?.length ?? 0), 0)} cards
          </div>
        </div>
      </header>

      {/* sidebar */}
      <Sidebar
        boardName={board.name}
        columns={sidebarColumns}
        selectedColumnId={selectedColumnId}
        onSelectColumn={setSelectedColumnId}
        assignees={ASSIGNEES}
        defaultAssignee={defaultAssignee}
        onDefaultAssignee={setDefaultAssignee}
        onQuickAddCard={handleQuickAddCard}
      />

      {/* main */}
      <main className="pt-16 pl-64">
        <div className="px-6 py-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={visibleColumns.map((c) => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-4 overflow-x-auto">
                {visibleColumns.map((col, idx) => {
                  const header = columnHeaderColor(idx);
                  const theme = cardThemeFor(idx);
                  const cards = cardsByColumn[col.id] ?? [];

                  return (
                    <SortableColumnShell key={col.id} id={col.id}>
                      <div className="rounded-xl border border-slate-800 bg-slate-900">
                        <div
                          className={`flex items-center justify-between rounded-t-xl px-3 py-2 ${header} text-white`}
                        >
                          <div className="font-medium truncate">{col.name}</div>
                          <span className="text-xs bg-black/20 rounded px-2 py-0.5">
                            {cards.length}
                          </span>
                        </div>

                        <SortableContext
                          items={cards.map((c) => c.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <DroppableColumn columnId={col.id}>
                            {cards.map((card) => (
                              <CardItem
                                key={card.id}
                                card={card}
                                columnId={col.id}
                                theme={theme}
                                onDelete={handleDeleteCard}
                                onSetAssignee={setCardAssignee}
                              />
                            ))}
                          </DroppableColumn>
                        </SortableContext>

                        <div className="px-3 pb-3">
                          <button
                            onClick={() => handleDeleteColumn(col)}
                            className="w-full rounded-md border border-red-700/40 bg-red-700/20 px-3 py-2 text-sm text-red-300 hover:bg-red-700/30"
                          >
                            Delete list
                          </button>
                        </div>
                      </div>
                    </SortableColumnShell>
                  );
                })}

                {/* New Column */}
                <div className="w-72 shrink-0 rounded-xl border border-slate-800 bg-slate-900 p-3">
                  <div className="rounded-md bg-slate-800/60 p-3 space-y-2">
                    <input
                      type="text"
                      placeholder="New list name"
                      className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                    />
                    <button
                      type="button"
                      onClick={handleAddColumn}
                      disabled={!newColName.trim() || addingCol}
                      className={`w-full rounded-md text-white text-sm py-2 transition ${
                        !newColName.trim() || addingCol
                          ? "bg-emerald-600/50 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-500"
                      }`}
                    >
                      {addingCol ? "Creating…" : "+ New list"}
                    </button>
                  </div>
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </main>
    </div>
  );
}
