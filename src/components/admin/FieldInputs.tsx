"use client";

import { Input, Textarea, Label } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { FieldDef } from "@/lib/sections";

type Value = unknown;
type Row = Record<string, Value>;

/** Renders one editable field based on its declared type. */
export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: Value;
  onChange: (v: Value) => void;
}) {
  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          rows={4}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          value={value === "" || value == null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
    case "taglist":
      return <TagList value={(value as string[]) ?? []} onChange={onChange} />;
    case "kvlist":
      return <PairList value={(value as KV[]) ?? []} keys={["label", "value"]} labels={["ラベル", "値"]} onChange={onChange} />;
    case "linklist":
      return <PairList value={(value as KV[]) ?? []} keys={["label", "url"]} labels={["ラベル", "URL"]} onChange={onChange} />;
    default:
      return (
        <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      );
  }
}

function TagList({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <Input
      value={value.join(", ")}
      placeholder="タグをカンマ区切りで入力"
      onChange={(e) =>
        onChange(
          e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

type KV = Record<string, string>;

function PairList({
  value,
  keys,
  labels,
  onChange,
}: {
  value: KV[];
  keys: [string, string];
  labels: [string, string];
  onChange: (v: KV[]) => void;
}) {
  const rows = value.length ? value : [];

  function update(i: number, key: string, v: string) {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r));
    onChange(next);
  }
  function add() {
    onChange([...rows, { [keys[0]]: "", [keys[1]]: "" }]);
  }
  function remove(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder={labels[0]}
            value={r[keys[0]] ?? ""}
            onChange={(e) => update(i, keys[0], e.target.value)}
          />
          <Input
            placeholder={labels[1]}
            value={r[keys[1]] ?? ""}
            onChange={(e) => update(i, keys[1], e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="削除"
            className="shrink-0 rounded-lg px-2 py-2 text-muted hover:bg-red-50 hover:text-red-600"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={add}>
        + 追加
      </Button>
    </div>
  );
}

/** A labelled field wrapper used by editors. */
export function EditableField({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: Value;
  onChange: (v: Value) => void;
}) {
  return (
    <div>
      <Label>{field.label}</Label>
      <FieldInput field={field} value={value} onChange={onChange} />
      {field.hint && <p className="mt-1 text-xs text-muted">{field.hint}</p>}
    </div>
  );
}

export type { Row };
