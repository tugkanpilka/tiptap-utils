import { JSONContent } from "@tiptap/core";
import { TaskList } from "@tiptap/extension-task-list";
import { BaseContentVisitor } from "./BaseContentVisitor";
import { ContentType, Todo } from "../../../domain/types";

export class TodoVisitor extends BaseContentVisitor<Todo> {
  private currentTodo: Partial<Todo> | null = null;
  private contentParts: string[] = [];

  visitTaskList(node: JSONContent): void {
    console.log("[TodoVisitor] Visiting TaskList:", node);
    // Reset state for new task list
    this.currentTodo = null;
    this.contentParts = [];
  }

  visitTaskItem(node: JSONContent): void {
    console.log("[TodoVisitor] Visiting TaskItem:", {
      attrs: node.attrs,
      hasContent: !!node.content,
      contentLength: node.content?.length,
    });

    // Initialize new todo for this task item
    this.currentTodo = {
      type: ContentType.TODO,
      isCompleted: false,
    };

    if (node.attrs) {
      this.currentTodo.isCompleted = node.attrs.checked || false;
      if (node.attrs.metadata) {
        this.currentTodo.metadata = node.attrs.metadata;
      }
    }

    // Reset content parts for new task item
    this.contentParts = [];

    // Process all content recursively
    if (node.content) {
      this.processContent(node.content);
    }

    // Finalize the todo if we have content
    if (this.currentTodo && this.contentParts.length > 0) {
      this.currentTodo.content = this.contentParts.join(" ").trim();
      this.currentTodo.id = this.generateId();
      this.items.push(this.currentTodo as Todo);
      console.log("[TodoVisitor] Finalized Todo:", this.currentTodo);
    }
  }

  visitText(node: JSONContent): void {
    console.log("[TodoVisitor] Visiting Text:", {
      text: node.text,
      contentPartsLength: this.contentParts.length,
    });

    if (this.currentTodo && node.text !== undefined) {
      this.contentParts.push(node.text);
    }
  }

  private processContent(content: JSONContent[]): void {
    content.forEach((node) => {
      if (node.type === "text") {
        this.visitText(node);
      } else if (node.type === "paragraph" && node.content) {
        this.processContent(node.content);
      } else if (node.type === "orderedList" && node.content) {
        this.processContent(node.content);
      } else if (node.type === "listItem" && node.content) {
        this.processContent(node.content);
      }
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
