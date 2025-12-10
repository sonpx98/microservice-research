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
      data: { label: node.label, type: node.type },
      position: { x: 0, y: 0 }, // Layout will be handled by dagre
      style: {
        background: getNodeColor(node.type),
        color: 'white',
        border: '2px solid #1f2937',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '14px',
        fontWeight: '500',
        minWidth: '120px',
        textAlign: 'center',
      },
    }));

    const rfEdges: Edge[] = graph.edges.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: edge.type,
      animated: true,
    }));

    return {
      rfNodes,
      rfEdges,
      nodesMap: graph.nodesMap,
    };
  }, [nodes]);

  return { nodes: rfNodes, edges: rfEdges, nodesMap };
}
