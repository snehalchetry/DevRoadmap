"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dagre from "dagre";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Clock,
  ExternalLink,
  Maximize2,
  Minus,
  Move,
  Plus,
  Sparkles
} from "lucide-react";
import { SideDrawer } from "@/components/SideDrawer";
import {
  CATEGORY_COLORS,
  PRIORITY_STYLES,
  type RoadmapItem
} from "@/types";

interface RoadmapGraphProps {
  items: RoadmapItem[];
}

interface PositionedNode {
  id: string;
  item: RoadmapItem;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PositionedEdge {
  id: string;
  source: string;
  target: string;
  path: string;
  highlighted: boolean;
}

interface GraphLayout {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  width: number;
  height: number;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 124;
const MIN_SCALE = 0.55;
const MAX_SCALE = 1.6;

function buildLayout(items: RoadmapItem[], selectedId: string | null): GraphLayout {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "TB",
    ranksep: 110,
    nodesep: 52,
    marginx: 40,
    marginy: 40
  });

  for (const item of items) {
    graph.setNode(item.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const item of items) {
    for (const dependency of item.dependsOn) {
      graph.setEdge(dependency, item.id);
    }
  }

  dagre.layout(graph);

  const nodes: PositionedNode[] = items.map((item) => {
    const position = graph.node(item.id);

    return {
      id: item.id,
      item,
      x: position.x - NODE_WIDTH / 2,
      y: position.y - NODE_HEIGHT / 2,
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    };
  });

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const edges: PositionedEdge[] = items.flatMap((item) =>
    item.dependsOn
      .map((dependency) => {
        const sourceNode = nodeMap.get(dependency);
        const targetNode = nodeMap.get(item.id);

        if (!sourceNode || !targetNode) {
          return null;
        }

        const startX = sourceNode.x + sourceNode.width / 2;
        const startY = sourceNode.y + sourceNode.height;
        const endX = targetNode.x + targetNode.width / 2;
        const endY = targetNode.y;
        const curve = Math.max(44, (endY - startY) * 0.35);
        const path = `M ${startX} ${startY} C ${startX} ${startY + curve}, ${endX} ${endY - curve}, ${endX} ${endY}`;
        const highlighted = selectedId === item.id || selectedId === dependency;

        return {
          id: `${dependency}-${item.id}`,
          source: dependency,
          target: item.id,
          path,
          highlighted
        };
      })
      .filter((edge): edge is PositionedEdge => Boolean(edge))
  );

  const maxX = Math.max(...nodes.map((node) => node.x + node.width), NODE_WIDTH) + 80;
  const maxY = Math.max(...nodes.map((node) => node.y + node.height), NODE_HEIGHT) + 80;

  return {
    nodes,
    edges,
    width: maxX,
    height: maxY
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function GraphNode({
  node,
  active,
  onSelect
}: {
  node: PositionedNode;
  active: boolean;
  onSelect: (item: RoadmapItem) => void;
}) {
  const categoryColor = CATEGORY_COLORS[node.item.category];
  const priorityStyle = PRIORITY_STYLES[node.item.priority];

  return (
    <button
      type="button"
      onClick={(event) => {
        event.currentTarget.blur();
        onSelect(node.item);
      }}
      className="group absolute overflow-hidden rounded-xl border bg-[rgba(22,27,34,0.94)] text-left shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition-all duration-200 hover:scale-[1.02]"
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        borderColor: active ? `${categoryColor}80` : "var(--border)",
        boxShadow: active
          ? `0 0 0 1px ${categoryColor}55, 0 18px 44px rgba(0,0,0,0.28), 0 0 24px ${categoryColor}1A`
          : `0 16px 40px rgba(0,0,0,0.22), 0 0 18px ${categoryColor}10`
      }}
    >
      <div className="h-1 w-full" style={{ background: categoryColor }} />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at top left, ${categoryColor}14, transparent 34%)`
        }}
      />
      <div
        className={`pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-200 ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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
          {node.item.title}
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
          {node.item.description}
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
          <Clock className="h-2.5 w-2.5" />
          <span>{node.item.estimatedTime}</span>
        </div>
      </div>
    </button>
  );
}

function DesktopGraph({
  items,
  selectedSkill,
  onSelect
}: {
  items: RoadmapItem[];
  selectedSkill: RoadmapItem | null;
  onSelect: (item: RoadmapItem) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0
  });
  const [transform, setTransform] = useState({ x: 40, y: 40, scale: 0.9 });

  const selectedId = selectedSkill?.id ?? null;
  const layout = useMemo(() => buildLayout(items, selectedId), [items, selectedId]);

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))],
    [items]
  );

  const centerGraph = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const bounds = container.getBoundingClientRect();
    const scaleX = (bounds.width - 80) / layout.width;
    const scaleY = (bounds.height - 80) / layout.height;
    const nextScale = clamp(Math.min(scaleX, scaleY, 1), MIN_SCALE, 1.05);
    const nextX = (bounds.width - layout.width * nextScale) / 2;
    const nextY = (bounds.height - layout.height * nextScale) / 2;

    setTransform({
      x: nextX,
      y: nextY,
      scale: nextScale
    });
  }, [layout.height, layout.width]);

  useEffect(() => {
    centerGraph();
  }, [centerGraph]);

  useEffect(() => {
    const handleMouseUp = () => {
      dragState.current.active = false;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragState.current.active) {
        return;
      }

      setTransform((current) => ({
        ...current,
        x: dragState.current.originX + (event.clientX - dragState.current.startX),
        y: dragState.current.originY + (event.clientY - dragState.current.startY)
      }));
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const handleNativeWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? 0.08 : -0.08;

      setTransform((current) => ({
        ...current,
        scale: clamp(current.scale + delta, MIN_SCALE, MAX_SCALE)
      }));
    };

    container.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleNativeWheel);
    };
  }, []);

  const zoomBy = useCallback((delta: number) => {
    setTransform((current) => ({
      ...current,
      scale: clamp(current.scale + delta, MIN_SCALE, MAX_SCALE)
    }));
  }, []);

  const handleMouseDown = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    dragState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: transform.x,
      originY: transform.y
    };
  }, [transform.x, transform.y]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[#0d1117] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
    >
      <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Interactive graph
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Drag to pan, scroll to zoom, click a node for details.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-1 text-xs text-[var(--text-secondary)]"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: CATEGORY_COLORS[category] }}
                />
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className="flow-canvas relative h-[calc(100vh-320px)] min-h-[620px] overflow-hidden"
        style={{ cursor: dragState.current.active ? "grabbing" : "grab" }}
      >
        <div className="pointer-events-none absolute left-5 top-5 z-10 max-w-sm rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,17,23,0.72)] px-4 py-3 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            Graph mode
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Use the mouse wheel to zoom and drag empty canvas space to pan.
          </p>
        </div>

        <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,17,23,0.78)] p-2 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => zoomBy(-0.08)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => centerGraph()}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={() => zoomBy(0.08)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-5 left-5 z-10 inline-flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,17,23,0.78)] px-3 py-2 text-xs text-[var(--text-secondary)] backdrop-blur-xl">
          <Move className="h-4 w-4 text-[var(--accent)]" />
          <span>{Math.round(transform.scale * 100)}%</span>
        </div>

        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            className="absolute left-0 top-0 overflow-visible"
          >
            {layout.edges.map((edge) => (
              <path
                key={edge.id}
                d={edge.path}
                fill="none"
                stroke={edge.highlighted ? "rgba(88,166,255,0.62)" : "rgba(88,166,255,0.28)"}
                strokeWidth={edge.highlighted ? 2 : 1.5}
                strokeDasharray="6 6"
              />
            ))}
          </svg>

          {layout.nodes.map((node) => (
            <GraphNode
              key={node.id}
              node={node}
              active={selectedSkill?.id === node.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function RoadmapGraph({ items }: RoadmapGraphProps) {
  const [selectedSkill, setSelectedSkill] = useState<RoadmapItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null);

  const openSkill = useCallback((item: RoadmapItem) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setSelectedSkill(item);
  }, []);

  useEffect(() => {
    setExpandedId(items[0]?.id ?? null);
  }, [items]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((currentId) => (currentId === id ? null : id));
  }, []);

  return (
    <>
      <div className="hidden lg:block">
        <DesktopGraph
          items={items}
          selectedSkill={selectedSkill}
          onSelect={openSkill}
        />
      </div>

      <div className="space-y-4 lg:hidden">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-[24px] p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[rgba(88,166,255,0.18)] bg-[rgba(88,166,255,0.08)]">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Learning sequence
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                Expand each step for context, then open the full detail drawer when you want resources and reasoning.
              </p>
            </div>
          </div>
        </motion.div>

        {items.map((item, index) => {
          const isExpanded = expandedId === item.id;
          const categoryColor = CATEGORY_COLORS[item.category];
          const priorityStyle = PRIORITY_STYLES[item.priority];

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="glass-card overflow-hidden rounded-2xl"
            >
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
                      style={{
                        background: `${categoryColor}1A`,
                        borderColor: `${categoryColor}33`,
                        color: categoryColor
                      }}
                    >
                      {item.category}
                    </span>
                    <span
                      className="inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: priorityStyle.background,
                        borderColor: priorityStyle.border,
                        color: priorityStyle.text
                      }}
                    >
                      {priorityStyle.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{item.estimatedTime}</span>
                  </div>
                </div>
                <ChevronDown
                  className={`mt-1 h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isExpanded ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[rgba(255,255,255,0.06)] px-4 py-4">
                      <p className="text-sm leading-7 text-[var(--text-secondary)]">
                        {item.description}
                      </p>

                      <div className="mt-4 space-y-2">
                        {item.resources.map((resource) => (
                          <a
                            key={`${item.id}-${resource.url}`}
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-3 text-sm text-[var(--text-secondary)]"
                          >
                            <span>{resource.title}</span>
                            <ExternalLink className="h-4 w-4 text-[var(--accent)]" />
                          </a>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.currentTarget.blur();
                          openSkill(item);
                        }}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
                      >
                        View details
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <SideDrawer
        open={Boolean(selectedSkill)}
        skill={selectedSkill}
        onOpenChange={(value) => {
          if (!value) {
            setSelectedSkill(null);
          }
        }}
      />
    </>
  );
}

export default RoadmapGraph;
