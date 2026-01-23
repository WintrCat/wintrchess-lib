import { AssessmentNode } from "../types/assessment/node";

/**
 * Recursively remove `parent` from all nodes in a tree below a
 * given root node. This shallowly copies the original tree.
 */
export function orphanizeAssessmentNode(node: AssessmentNode) {
    const orphanizeNode = (node: AssessmentNode): AssessmentNode => ({
        ...node,
        parent: undefined,
        children: node.children.map(child => orphanizeNode(child))
    });

    return orphanizeNode(node);
}

/** Returns the nodes from the root to the given node. */
export function getAssessmentNodeChain(
    node: AssessmentNode,
    movesOnly = false
) {
    const nodes: AssessmentNode[] = [];
    let current: AssessmentNode | undefined = node;

    while (current) {
        if (movesOnly && !current.context.move) return nodes;

        nodes.unshift(current);
        current = current.parent;
    }

    return nodes;
}

/** Returns a node's depth from its root. */
export function getAssessmentNodeDepth(node: AssessmentNode) {
    return getAssessmentNodeChain(node).length - 1;
}