import { Node, Edge } from 'reactflow';

/**
 * Simple Dagre-like layout (hierarchical)
 * Uses BFS to assign levels and position nodes
 */
export function layoutNodes(
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
