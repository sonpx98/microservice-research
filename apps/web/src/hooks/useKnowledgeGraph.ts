import { useMemo } from 'react';
import { KnowledgeGraphNode } from 'contentlayer/generated';
import type { Node, Edge } from 'reactflow';
import { buildGraphFromNodes } from '@/lib/knowledge-graph';
import { layoutNodes } from '@/components/knowledge-graph/utils/layout-nodes';

export function useKnowledgeGraph(nodes: KnowledgeGraphNode[]) {
  return useMemo(() => {
    const graph = buildGraphFromNodes(nodes);

    const edges: Edge[] = graph.edges.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      label: edge.type,
      animated: true,
      // Colors and hover-to-reveal label come from the reactflow theme adapter in globals.css.
      className: 'knowledge-graph-edge',
    }));

    const unpositioned: Node[] = graph.nodes.map((node) => ({
      id: node.id,
      type: 'concept',
      data: { label: node.label, type: node.type },
      position: { x: 0, y: 0 },
    }));
    const positions = layoutNodes(unpositioned, edges);
    const rfNodes = unpositioned.map((node, i) => ({ ...node, position: positions[i] }));

    return { nodes: rfNodes, edges, nodesMap: graph.nodesMap };
  }, [nodes]);
}
