'use client';

import React, { useCallback, useState } from 'react';
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
import { ConceptNode } from './ConceptNode';

// Extracted components and utilities
import { SearchFilterPanel } from './components/SearchFilterPanel';
import { GraphCanvas } from './components/GraphCanvas';
import { useGraphFilters } from './hooks/useGraphFilters';

interface KnowledgeGraphViewProps {
  nodes: KnowledgeGraphNode[];
}

// Register custom node types
const nodeTypes = {
  concept: ConceptNode,
};

function KnowledgeGraphViewInner({ nodes }: KnowledgeGraphViewProps) {
  const { nodes: rfNodes, edges: rfEdges, nodesMap } = useKnowledgeGraph(nodes);
  const [flowNodes, , onNodesChange] = useNodesState(rfNodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(rfEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { setCenter } = useReactFlow();

  // Use extracted filter hook
  const filters = useGraphFilters(flowNodes);

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
    filteredCount: filters.filteredNodes.length,
    totalCount: flowNodes.length,
  };

  return (
    <div className="relative h-full overflow-hidden">
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
          <PanelResizeHandle className="w-1 cursor-col-resize bg-border transition-colors hover:bg-primary" />

          {/* Detail panel */}
          <Panel defaultSize={30} minSize={20} maxSize={60}>
            <div className="h-full border-l border-border bg-card">
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
