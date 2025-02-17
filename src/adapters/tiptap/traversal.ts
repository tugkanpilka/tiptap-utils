import { JSONContent } from "@tiptap/react";
import { NodeVisitor, NodeTraversalStrategy, TaskList } from "../types";

export class TiptapNodeTraversal implements NodeTraversalStrategy {
  traverse(node: JSONContent, visitor: NodeVisitor): void {
    if (!node) return;

    // First traverse the current node
    switch (node.type) {
      case "taskList":
        visitor.visitTaskList(TaskList);
        break;
      case "taskItem":
        visitor.visitTaskItem(node);
        break;
      case "text":
        visitor.visitText(node);
        break;
    }

    // Then traverse its children
    if (node.content) {
      node.content.forEach((child: JSONContent) =>
        this.traverse(child, visitor),
      );
    }
  }
}
