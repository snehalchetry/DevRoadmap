"use client";

import type { CSSProperties } from "react";
import { Clock } from "lucide-react";
import { Handle, Position, type NodeProps } from "reactflow";
import {
  CATEGORY_COLORS,
  PRIORITY_STYLES,
  type SkillNodeData
} from "@/types";

export function SkillCard({ data, selected }: NodeProps<SkillNodeData>) {
  const categoryColor = CATEGORY_COLORS[data.category];
  const priorityStyle = PRIORITY_STYLES[data.priority];
  const isSelected = Boolean(selected || data.isSelected);

  return (
    <div
      className="group relative w-[220px] cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-[rgba(22,27,34,0.92)] text-left shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition-all duration-200 hover:scale-[1.02]"
      style={
        {
          borderColor: isSelected ? `${categoryColor}80` : "var(--border)",
          boxShadow: isSelected
            ? `0 0 0 1px ${categoryColor}55, 0 18px 44px rgba(0,0,0,0.28), 0 0 24px ${categoryColor}1A`
            : "0 16px 40px rgba(0,0,0,0.22)"
        } as CSSProperties
      }
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-0"
        style={{ background: categoryColor }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-0"
        style={{ background: categoryColor }}
      />

      <div className="h-1 w-full" style={{ background: categoryColor }} />

      <div
        className={`pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-200 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{
          border: `1px solid ${categoryColor}66`,
          boxShadow: `0 0 12px ${categoryColor}1A`
        }}
      />

      <div className="relative p-3 pt-4">
        <div
          className="absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{
            background: priorityStyle.background,
            borderColor: priorityStyle.border,
            color: priorityStyle.text
          }}
        >
          {priorityStyle.label}
        </div>

        <p className="pr-14 text-[13px] font-semibold text-[var(--text-primary)]">
          {data.title}
        </p>
        <p
          className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden"
          }}
        >
          {data.description}
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
          <Clock className="h-2.5 w-2.5" />
          <span>{data.estimatedTime}</span>
        </div>
      </div>
    </div>
  );
}

export default SkillCard;
