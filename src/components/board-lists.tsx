import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useSlip } from "@/lib/store";
import { cn } from "@/lib/utils";

export const AUTO_LIST = "auto";
export const BOOKMARK_LIST = "bookmarked";

type Search = {
  leagues?: string;
  country?: string;
  continent?: string;
  day?: string;
  strength?: string;
  list?: string;
};

export function BoardLists({
  active,
  searchFor,
}: {
  active: string;
  searchFor: (list?: string) => Search;
}) {
  const savedN = useSlip((s) => s.saved.length);
  const lists = useSlip((s) => s.lists) ?? [];
  const createList = useSlip((s) => s.createList);
  const renameList = useSlip((s) => s.renameList);
  const deleteList = useSlip((s) => s.deleteList);
  const navigate = useNavigate();
  const [draft, setDraft] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function startCreate() {
    setDraft("");
    setName("");
    setEditing(null);
  }

  function commitCreate() {
    const id = createList(name);
    setDraft(null);
    setName("");
    if (id) void navigate({ to: "/", search: searchFor(id) });
    return id;
  }

  function startEdit(id: string, current: string) {
    setEditing(id);
    setEditName(current);
    setDraft(null);
  }

  const chip =
    "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors";

  return (
    <div className="space-y-2">
      <div role="group" aria-label="Board lists" className="flex flex-wrap gap-2">
        <Link
          to="/"
          search={searchFor(active === BOOKMARK_LIST ? undefined : BOOKMARK_LIST)}
          aria-pressed={active === BOOKMARK_LIST}
          title={active === BOOKMARK_LIST ? "Show full board" : "Show bookmarked matches"}
          className={cn(
            chip,
            active === BOOKMARK_LIST ? "bg-accent text-bg" : "bg-raised text-muted hover:text-fg",
          )}
        >
          Bookmarked
          <span className={cn("ml-1.5 tabular-nums", active === BOOKMARK_LIST ? "text-bg/70" : "text-subtle")}>
            {savedN}
          </span>
        </Link>
        {lists.map((list) => {
          const on = active === list.id;
          if (editing === list.id) {
            return (
              <form
                key={list.id}
                className="flex h-11 items-center gap-1 rounded-full bg-raised pl-3 pr-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  renameList(list.id, editName);
                  setEditing(null);
                }}
              >
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={28}
                  autoFocus
                  aria-label="List name"
                  className="h-9 w-32 bg-transparent text-sm text-fg outline-none"
                />
                <button type="submit" className="size-9 text-accent" aria-label="Save list name">
                  <Check className="mx-auto size-4" />
                </button>
                <button
                  type="button"
                  className="size-9 text-muted"
                  aria-label="Cancel rename"
                  onClick={() => setEditing(null)}
                >
                  <X className="mx-auto size-4" />
                </button>
              </form>
            );
          }
          return (
            <div key={list.id} className="flex items-center">
              <Link
                to="/"
                search={searchFor(on ? undefined : list.id)}
                aria-pressed={on}
                className={cn(
                  chip,
                  on ? "bg-accent text-bg" : "bg-raised text-muted hover:text-fg",
                  on && "rounded-r-none pr-2",
                )}
              >
                {list.name}
                <span className={cn("ml-1.5 tabular-nums", on ? "text-bg/70" : "text-subtle")}>{list.ids.length}</span>
              </Link>
              {on && (
                <span className="flex h-11 overflow-hidden rounded-r-full bg-accent">
                  <button
                    type="button"
                    className="size-11 text-bg/80 hover:text-bg"
                    aria-label={`Rename ${list.name}`}
                    onClick={() => startEdit(list.id, list.name)}
                  >
                    <Pencil className="mx-auto size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="size-11 text-bg/80 hover:text-bg"
                    aria-label={`Delete ${list.name}`}
                    onClick={() => {
                      if (window.confirm(`Delete “${list.name}”?`)) {
                        deleteList(list.id);
                        void navigate({ to: "/", search: searchFor(undefined) });
                      }
                    }}
                  >
                    <Trash2 className="mx-auto size-3.5" />
                  </button>
                </span>
              )}
            </div>
          );
        })}
        {draft !== null ? (
          <form
            className="flex h-11 items-center gap-1 rounded-full bg-raised pl-3 pr-1"
            onSubmit={(e) => {
              e.preventDefault();
              commitCreate();
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={28}
              autoFocus
              placeholder="List name"
              aria-label="New list name"
              className="h-9 w-32 bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
            />
            <button type="submit" className="size-9 text-accent" aria-label="Create list" disabled={!name.trim()}>
              <Check className="mx-auto size-4" />
            </button>
            <button type="button" className="size-9 text-muted" aria-label="Cancel" onClick={() => setDraft(null)}>
              <X className="mx-auto size-4" />
            </button>
          </form>
        ) : (
          <button type="button" onClick={startCreate} className={cn(chip, "bg-raised text-muted hover:text-fg")}>
            <Plus className="mr-1.5 size-3.5" />
            New list
          </button>
        )}
      </div>
    </div>
  );
}
