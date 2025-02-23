import { JSONContent } from "@tiptap/core";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { BaseContentVisitor } from "../visitors/BaseContentVisitor";
import { BaseContentTraverser } from "./BaseContentTraverser";

export class TodoTraverser extends BaseContentTraverser {
  traverse(content: JSONContent, visitor: BaseContentVisitor<any>): void {
    visitor.clearItems();
    super.traverse(content, visitor);
  }

  protected visitNode(
    node: JSONContent,
    visitor: BaseContentVisitor<any>
  ): void {
    switch (node.type) {
      case "heading":
        visitor.visitHeading(node);
        break;
      case TaskList.name:
        visitor.visitTaskList(node);
        break;
      case TaskItem.name:
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
