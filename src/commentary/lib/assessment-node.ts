import { AnalysedMove } from "@/types";
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

/** Returns the moves needed to reach this node from its root. */
export function getAssessmentNodeMoves(node: AssessmentNode) {
    const moves: AnalysedMove[] = [];
    let current: AssessmentNode | undefined = node;

    while (true) {
        if (!current?.context.move) return moves;

        moves.unshift(current.context.move);
        current = current.parent;
    }
}