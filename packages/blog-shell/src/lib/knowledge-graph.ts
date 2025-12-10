import { KnowledgeGraphNode as KGNode } from 'contentlayer/generated';
import { allKnowledgeGraphNodes } from 'contentlayer/generated';

export interface Relationship {
  id: string;
  type: string;
}

export type NodeType = 'technical' | 'issue' | 'slang';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  data: KGNode;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodesMap: Map<string, KGNode>;
}

/**
 * Get all knowledge graph nodes (from contentlayer cache)
 * This caches the contentlayer data to avoid re-parsing on every request
 */
export function getKnowledgeGraphNodes(): KGNode[] {
  return allKnowledgeGraphNodes;
}

function getNodeType(node: KGNode): NodeType {
  const category = (node as any).category?.toLowerCase();
  if (['technical', 'issue', 'slang'].includes(category)) {
    return category as NodeType;
  }
  return 'technical';
}

export function buildGraphFromNodes(allNodes: KGNode[]): Graph {
  const nodesMap = new Map<string, KGNode>();
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenRelationships = new Set<string>();

  // First pass: create nodes
  allNodes.forEach((node) => {
    nodesMap.set(node.id, node);
    nodes.push({
      id: node.id,
      label: node.title,
      type: getNodeType(node),
      data: node,
    });
  });

  // Second pass: create edges from relationships
  allNodes.forEach((node) => {
    const relationships = (node as any).relationships as Relationship[] | undefined;
    if (relationships && Array.isArray(relationships) && relationships.length > 0) {
      relationships.forEach((rel) => {
        // Only add if target exists
        if (nodesMap.has(rel.id)) {
          const edgeKey = `${node.id}-${rel.id}`;
          if (!seenRelationships.has(edgeKey)) {
            edges.push({
              source: node.id,
              target: rel.id,
              type: rel.type,
            });
            seenRelationships.add(edgeKey);
          }
        }
      });
    }
  });

  return {
    nodes,
    edges,
    nodesMap,
  };
}

export function getNodeColor(type: 'technical' | 'issue' | 'slang'): string {
  switch (type) {
    case 'technical':
      return '#3b82f6'; // blue
    case 'issue':
      return '#ef4444'; // red
    case 'slang':
      return '#8b5cf6'; // purple
    default:
      return '#6b7280'; // gray
  }
}
