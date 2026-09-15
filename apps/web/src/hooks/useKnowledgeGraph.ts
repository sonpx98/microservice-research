import { useMemo } from 'react';
import { KnowledgeGraphNode } from 'contentlayer/generated';
import type { Node, Edge } from 'reactflow';
import type { Relationship } from '@/lib/knowledge-graph';
import { buildGraphFromNodes, getNodeColor } from '@/lib/knowledge-graph';

export function useKnowledgeGraph(nodes: KnowledgeGraphNode[]) {
  const { rfNodes, rfEdges, nodesMap } = useMemo(() => {
    const graph = buildGraphFromNodes(nodes);

    // Convert to ReactFlow format
    const rfNodes: Node[] = graph.nodes.map((node) => ({
      id: node.id,
      type: 'star',
      data: { label: node.label, type: node.type },
      position: { x: 0, y: 0 }, // Layout will be handled by dagre
    }));

    const rfEdges: Edge[] = graph.edges.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: edge.type,
      animated: true,
      labelStyle: { 
        opacity: 0,
        transition: 'opacity 0.2s ease-in-out',
      },
      labelBgStyle: { 
        opacity: 0,
        transition: 'opacity 0.2s ease-in-out',
      },
      className: 'knowledge-graph-edge',
    }));

    return {
      rfNodes,
      rfEdges,
      nodesMap: graph.nodesMap,
    };
  }, [nodes]);

  return { nodes: rfNodes, edges: rfEdges, nodesMap };
}
