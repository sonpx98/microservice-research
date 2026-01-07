'use client';

import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
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
import { Search, X, Filter, ChevronDown, Minimize2, Maximize2 } from 'lucide-react';

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
    const x = parseInt(level) * 350;
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

function KnowledgeGraphViewInner({ nodes }: KnowledgeGraphViewProps) {
  const { nodes: rfNodes, edges: rfEdges, nodesMap } = useKnowledgeGraph(nodes);
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(rfNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(rfEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { setCenter, getZoom } = useReactFlow();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

  // Get unique types for filter dropdown
  const availableTypes = React.useMemo(() => {
    const types = new Set<string>();
    flowNodes.forEach(node => {
      if (node.data.type) types.add(node.data.type);
    });
    return ['all', ...Array.from(types)];
  }, [flowNodes]);

  // Filter nodes based on search and type
  const filteredNodes = React.useMemo(() => {
    return flowNodes.filter(node => {
      const matchesSearch = searchQuery === '' || 
        node.data.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || node.data.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [flowNodes, searchQuery, typeFilter]);

  // Update node styles based on filter
  const displayNodes = React.useMemo(() => {
    return flowNodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        opacity: filteredNodes.some(n => n.id === node.id) ? 1 : 0.2,
      }
    }));
  }, [flowNodes, filteredNodes]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Always set the selected node (no toggle when panel is open)
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
      // Find the node in the flow
      const targetNode = flowNodes.find((n) => n.id === nodeId);
      if (targetNode) {
        // Zoom to node with animation (centered on star)
        setCenter(targetNode.position.x + 70, targetNode.position.y + 70, {
          zoom: 1.5,
          duration: 800,
        });
        // Select the node after a brief delay
        setTimeout(() => {
          setSelectedNodeId(nodeId);
        }, 400);
      }
    },
    [flowNodes, setCenter]
  );

  // Generate random stars for background
  const backgroundStars = React.useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 3,
    }));
  }, []);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden mx-auto max-w-7xl">
      {/* Galaxy Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Nebula clouds */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)
            `,
          }}
        />
        
        {/* Animated stars - Only render on client to avoid hydration mismatch */}
        {isMounted && (
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {backgroundStars.map((star) => (
              <circle
                key={star.id}
                cx={`${star.x}%`}
                cy={`${star.y}%`}
                r={star.size}
                fill="white"
                opacity={star.opacity}
                filter="url(#glow)"
                style={{
                  animation: `twinkle ${2 + star.delay}s ease-in-out infinite`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
          </svg>
        )}
        
        {/* Milky Way effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              linear-gradient(135deg, 
                transparent 0%,
                rgba(139, 92, 246, 0.2) 25%,
                rgba(59, 130, 246, 0.3) 50%,
                rgba(139, 92, 246, 0.2) 75%,
                transparent 100%
              )
            `,
            transform: 'rotate(-20deg) scale(1.5)',
          }}
        />
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      {selectedNode ? (
        <PanelGroup direction="horizontal" className="h-full">
          {/* Main graph panel */}
          <Panel defaultSize={70} minSize={40}>
            <div className="relative h-full">
              {/* Compact Search and Filter Panel */}
              <div className="absolute top-4 left-4 z-50">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  {/* Collapsed State - Just Icons */}
                  {!isSearchExpanded && (
                    <div className="flex items-center gap-2 p-2">
                      <button
                        onClick={() => setIsSearchExpanded(true)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Expand search"
                      >
                        <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      {(searchQuery || typeFilter !== 'all') && (
                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md text-xs font-medium text-blue-700 dark:text-blue-300">
                          {filteredNodes.length}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded State */}
                  {isSearchExpanded && (
                    <div className="p-3 w-80">
                      {/* Header with Collapse Button */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search & Filter</h3>
                        <button
                          onClick={() => setIsSearchExpanded(false)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Collapse"
                        >
                          <Minimize2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>

                      {/* Search Input */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search nodes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Type Filter Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setIsFilterOpen(!isFilterOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <span>
                              {typeFilter === 'all' 
                                ? 'All Types' 
                                : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                            </span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isFilterOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-[100]">
                            {availableTypes.map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  setTypeFilter(type);
                                  setIsFilterOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                  typeFilter === type
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                              >
                                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Results Counter */}
                      {(searchQuery || typeFilter !== 'all') && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Results:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {filteredNodes.length} / {flowNodes.length}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <ReactFlow
                nodes={displayNodes}
                edges={flowEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                fitView
              >
                <Background color="transparent" />
                <Controls />
              </ReactFlow>
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
          {/* Compact Search and Filter Panel */}
          <div className="absolute top-4 left-4 z-50">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              {/* Collapsed State - Just Icons */}
              {!isSearchExpanded && (
                <div className="flex items-center gap-2 p-2">
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title="Expand search"
                  >
                    <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  {(searchQuery || typeFilter !== 'all') && (
                    <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md text-xs font-medium text-blue-700 dark:text-blue-300">
                      {filteredNodes.length}
                    </div>
                  )}
                </div>
              )}

              {/* Expanded State */}
              {isSearchExpanded && (
                <div className="p-3 w-80">
                  {/* Header with Collapse Button */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search & Filter</h3>
                    <button
                      onClick={() => setIsSearchExpanded(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Collapse"
                    >
                      <Minimize2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search nodes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Type Filter Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span>
                          {typeFilter === 'all' 
                            ? 'All Types' 
                            : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isFilterOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-[100]">
                        {availableTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setTypeFilter(type);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                              typeFilter === type
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Results Counter */}
                  {(searchQuery || typeFilter !== 'all') && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Results:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {filteredNodes.length} / {flowNodes.length}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <ReactFlow
            nodes={displayNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="transparent" />
            <Controls />
          </ReactFlow>
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
