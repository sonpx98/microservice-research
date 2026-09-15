'use client';

import React, { useCallback, useState, useEffect } from 'react';
import {
  Node,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { KnowledgeGraphNode } from 'contentlayer/generated';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { NodeDetail } from './NodeDetail';
import { StarNode } from './StarNode';

// Extracted components and utilities
import { GalaxyBackground } from './components/GalaxyBackground';
import { SearchFilterPanel } from './components/SearchFilterPanel';
import { GraphCanvas } from './components/GraphCanvas';
import { useGraphFilters } from './hooks/useGraphFilters';
import { layoutNodes } from './utils/layout-nodes';

interface KnowledgeGraphViewProps {
  nodes: KnowledgeGraphNode[];
}

// Register custom node types
const nodeTypes = {
  star: StarNode,
};

// Custom styles for edge labels
const edgeHoverStyles = `
  .knowledge-graph-edge:hover .react-flow__edge-textbg,
  .knowledge-graph-edge:hover .react-flow__edge-text {
    opacity: 1 !important;
  }
  
  .react-flow__edge-textbg {
    fill: rgba(31, 41, 55, 0.9);
  }
  
  .react-flow__edge-text {
    fill: white;
    font-size: 12px;
  }
`;

function KnowledgeGraphViewInner({ nodes }: KnowledgeGraphViewProps) {
  const { nodes: rfNodes, edges: rfEdges, nodesMap } = useKnowledgeGraph(nodes);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(rfNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(rfEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { setCenter } = useReactFlow();
  const [isMounted, setIsMounted] = useState(false);

  // Use extracted filter hook
  const filters = useGraphFilters(flowNodes);

  // Mount flag to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Inject custom styles for edge hover effects
  useEffect(() => {
    const styleId = 'knowledge-graph-edge-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = edgeHoverStyles;
      document.head.appendChild(style);
    }
  }, []);

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
      setSelectedNodeId(node.id);
    },
    []
  );

  const selectedNode = selectedNodeId ? nodesMap.get(selectedNodeId) : null;

  const handleCloseDetail = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleRelationshipClick = useCallback(
    (nodeId: string) => {
      const targetNode = flowNodes.find((n) => n.id === nodeId);
      if (targetNode) {
        setCenter(targetNode.position.x + 70, targetNode.position.y + 70, {
          zoom: 1.5,
          duration: 800,
        });
        setTimeout(() => {
          setSelectedNodeId(nodeId);
        }, 400);
      }
    },
    [flowNodes, setCenter]
  );

  // Shared props for SearchFilterPanel
  const searchFilterProps = {
    searchQuery: filters.searchQuery,
    onSearchChange: filters.setSearchQuery,
    typeFilter: filters.typeFilter,
    onTypeFilterChange: filters.setTypeFilter,
    availableTypes: filters.availableTypes,
    isExpanded: filters.isSearchExpanded,
    onExpandToggle: () => filters.setIsSearchExpanded(!filters.isSearchExpanded),
    isFilterOpen: filters.isFilterOpen,
    onFilterToggle: () => filters.setIsFilterOpen(!filters.isFilterOpen),
    filteredCount: filters.filteredNodes.length,
    totalCount: flowNodes.length,
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden mx-auto max-w-7xl">
      {/* Galaxy Background */}
      <GalaxyBackground isMounted={isMounted} />

      {selectedNode ? (
        <PanelGroup direction="horizontal" className="h-full">
          {/* Main graph panel */}
          <Panel defaultSize={70} minSize={40}>
            <div className="relative h-full">
              <SearchFilterPanel {...searchFilterProps} />
              <GraphCanvas
                nodes={filters.displayNodes}
                edges={flowEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
              />
            </div>
          </Panel>

          {/* Resize handle */}
          <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors cursor-col-resize" />

          {/* Detail panel */}
          <Panel defaultSize={30} minSize={20} maxSize={60}>
            <div className="h-full bg-white/95 dark:bg-gray-800/95 shadow-lg backdrop-blur-sm">
              <NodeDetail 
                node={selectedNode} 
                onClose={handleCloseDetail}
                onRelationshipClick={handleRelationshipClick}
              />
            </div>
          </Panel>
        </PanelGroup>
      ) : (
        <div className="relative h-full">
          <SearchFilterPanel {...searchFilterProps} />
          <GraphCanvas
            nodes={filters.displayNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
          />
        </div>
      )}
    </div>
  );
}

// Wrap with ReactFlowProvider to enable useReactFlow hook
export function KnowledgeGraphView(props: KnowledgeGraphViewProps) {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphViewInner {...props} />
    </ReactFlowProvider>
  );
}
