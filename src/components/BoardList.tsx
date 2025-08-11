"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useGetBoardsQuery,
  useCreateBoardMutation,
  useDeleteBoardMutation,
} from "@/graphql/generated";
import { Dialog } from "@headlessui/react";

export default function BoardList() {
  const { data, loading, error, refetch } = useGetBoardsQuery();
  const [createBoard] = useCreateBoardMutation();
  const [deleteBoard] = useDeleteBoardMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [boardName, setBoardName] = useState("");

  const handleCreateBoard = async () => {
    if (!boardName.trim()) return;
    try {
      await createBoard({ variables: { name: boardName.trim() } });
      setBoardName("");
      setIsOpen(false);
      await refetch();
    } catch (err) {
      console.error("Error creating board:", err);
    }
  };

  const handleDeleteBoard = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this board?"
    );
    if (!confirmed) return;

    try {
      await deleteBoard({ variables: { id } });
      await refetch();
    } catch (err) {
      console.error("Error deleting board:", err);
    }
  };

  return (
    <>
      <div className="grid gap-4 w-full max-w-md">
        {data?.boards.map((board) => (
          <div
            key={board.id}
            className="flex justify-between items-center p-4 bg-black text-white rounded-xl shadow hover:bg-gray-800 transition-colors"
          >
            <Link href={`/boards/${board.id}`} className="flex-1">
              <h2 className="text-lg font-semibold tracking-tight">
                {board.name}
              </h2>
            </Link>
            <button
              onClick={() => handleDeleteBoard(board.id)}
              className="ml-4 text-sm text-red-400 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        ))}

        <button
          onClick={() => setIsOpen(true)}
          className="py-3 rounded bg-muted text-muted-foreground border border-dashed border-border hover:bg-muted/70"
        >
          + New Board
        </button>
      </div>

      {/* Modal */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-sm rounded bg-white p-6 shadow">
            <Dialog.Title className="text-lg font-medium mb-2">
              Create a new board
            </Dialog.Title>

            <input
              autoFocus
              type="text"
              className="w-full border border-gray-300 p-2 rounded mb-4 text-black"
              placeholder="Enter board name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateBoard();
                if (e.key === "Escape") setIsOpen(false);
              }}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBoard}
                className="bg-black text-white px-4 py-2 rounded hover:bg-black/80"
              >
                Create
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
