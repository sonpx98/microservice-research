'use client';

import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { KnowledgeGraphNode } from 'contentlayer/generated';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { NodeDetail } from './NodeDetail'

interface KnowledgeGraphViewProps {
  nodes: KnowledgeGraphNode[];
}

// Simple Dagre-like layout (hierarchical)
function layoutNodes(
  nodes: Node[],
  edges: Edge[]
): { x: number; y: number }[] {
  const positions: { [key: string]: { x: number; y: number } } = {};
  const levels: { [key: string]: number } = {};
  
  // Find root nodes (nodes without incoming edges)
  const incomingEdges = new Set(edges.map((e) => e.target));
  const rootNodes = nodes.filter((n) => !incomingEdges.has(n.id));

  // BFS to assign levels
  const visited = new Set<string>();
  const queue: [string, number][] = rootNodes.map((n) => [n.id, 0]);

  while (queue.length > 0) {
    const [nodeId, level] = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    levels[nodeId] = level;

    // Find connected nodes
    edges
      .filter((e) => e.source === nodeId)
      .forEach((e) => {
        if (!visited.has(e.target)) {
          queue.push([e.target, level + 1]);
        }
      });
  }

  // Assign default levels to unvisited nodes (orphaned/only outgoing edges)
  let maxLevel = Math.max(...Object.values(levels), -1);
  nodes.forEach((node) => {
    if (!levels[node.id]) {
      levels[node.id] = ++maxLevel;
    }
  });

  // Group nodes by level and calculate positions
  const nodesPerLevel: { [level: number]: string[] } = {};
  Object.entries(levels).forEach(([nodeId, level]) => {
    if (!nodesPerLevel[level]) {
      nodesPerLevel[level] = [];
    }
    nodesPerLevel[level].push(nodeId);
  });

  const levelHeight = 150;
  const nodeWidth = 150;

  Object.entries(nodesPerLevel).forEach(([level, nodeIds]) => {
    const x = parseInt(level) * 300;
    const totalWidth = nodeIds.length * nodeWidth;
    const startY = -totalWidth / 2;

    nodeIds.forEach((nodeId, index) => {
      positions[nodeId] = {
        x,
        y: startY + index * nodeWidth,
      };
    });
  });

  return nodes.map((n) => positions[n.id] || { x: 0, y: 0 });
}

export function KnowledgeGraphView({ nodes }: KnowledgeGraphViewProps) {
  const { nodes: rfNodes, edges: rfEdges, nodesMap } = useKnowledgeGraph(nodes);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(rfNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(rfEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Apply layout on mount
  useEffect(() => {
    const positions = layoutNodes(rfNodes, rfEdges);
    const layoutedNodes = rfNodes.map((node, index) => ({
      ...node,
      position: positions[index],
    }));
    setFlowNodes(layoutedNodes);
    setFlowEdges(rfEdges);
  }, [rfNodes, rfEdges, setFlowNodes, setFlowEdges]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Toggle selection: click same node again to deselect
      setSelectedNodeId(prev => prev === node.id ? null : node.id);
    },
    []
  );

  const selectedNode = selectedNodeId ? nodesMap.get(selectedNodeId) : null;

  const handleCloseDetail = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {selectedNode ? (
        <PanelGroup direction="horizontal" className="h-full">
          {/* Main graph panel */}
          <Panel defaultSize={70} minSize={40}>
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              fitView
            >
              <Background color="#aaa" gap={16} />
              <Controls />
            </ReactFlow>
          </Panel>

          {/* Resize handle */}
          <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors cursor-col-resize" />

          {/* Detail panel */}
          <Panel defaultSize={30} minSize={20} maxSize={60}>
            <div className="h-full bg-white dark:bg-gray-800 shadow-lg">
              <NodeDetail node={selectedNode} onClose={handleCloseDetail} />
            </div>
          </Panel>
        </PanelGroup>
      ) : (
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Background color="#aaa" gap={16} />
          <Controls />
        </ReactFlow>
      )}
    </div>
  );
}
