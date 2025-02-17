import { JSONContent } from "@tiptap/core";
import { TaskList } from "@tiptap/extension-task-list";
import { BaseContentVisitor } from "./BaseContentVisitor";
import { ContentType, Todo } from "../../../domain/types";

export class TodoVisitor extends BaseContentVisitor<Todo> {
  visitTaskList(node: typeof TaskList): void {
    // Reset items when entering a new task list
    this.reset();
  }

  visitTaskItem(node: JSONContent): void {
    const attrs = node.attrs || {};

    // Extract text from the nested structure
    let content = "";
    if (node.content && node.content.length > 0) {
      const paragraph = node.content[0];
      if (
        paragraph.type === "paragraph" &&
        paragraph.content &&
        paragraph.content.length > 0
      ) {
        const textNode = paragraph.content[0];
        if (textNode.type === "text") {
          content = textNode.text || "";
        }
      }
    }

    this.items.push({
      id: attrs.id || String(Math.random()),
      type: ContentType.TODO,
      content,
      isCompleted: attrs.checked || false,
      metadata: { ...attrs },
    });
  }

  visitText(node: JSONContent): void {
    // Text nodes don't create todo items
  }
}
