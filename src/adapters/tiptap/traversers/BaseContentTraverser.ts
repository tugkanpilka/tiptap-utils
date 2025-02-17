import { JSONContent } from "@tiptap/core";
import { NodeTraversalStrategy } from "../../types";
import { BaseContentVisitor } from "../visitors/BaseContentVisitor";

export class BaseContentTraverser implements NodeTraversalStrategy {
  traverse(content: JSONContent, visitor: BaseContentVisitor<any>): void {
    this.visitNode(content, visitor);
  }

  protected visitNode(
    node: JSONContent,
    visitor: BaseContentVisitor<any>
  ): void {
    switch (node.type) {
      case "taskList":
        visitor.visitTaskList(node);
        break;
      case "taskItem":
        visitor.visitTaskItem(node);
        break;
      case "text":
        visitor.visitText(node);
        break;
    }

    if (node.content) {
      node.content.forEach((child) => this.visitNode(child, visitor));
    }
  }
}
