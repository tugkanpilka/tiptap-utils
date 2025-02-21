import { JSONContent } from "@tiptap/core";
import { TaskList } from "@tiptap/extension-task-list";
import { BaseContentVisitor } from "./BaseContentVisitor";
import { ContentType, Todo, Heading } from "../../../domain/types";

export class TodoVisitor extends BaseContentVisitor<Todo> {
  private currentTodo: Partial<Todo> | null = null;
  private contentParts: string[] = [];
  private currentHeading: Heading | null = null;

  visitTaskList(node: JSONContent): void {
    console.log("[TodoVisitor] Visiting TaskList:", node);
    // Reset state for new task list
    this.currentTodo = null;
    this.contentParts = [];
    // Reset heading if we have empty nodes before this task list
    if (this.hasEmptyNodesBefore(node)) {
      console.log(
        "[TodoVisitor] Resetting heading due to empty nodes before task list"
      );
      this.currentHeading = null;
    }
  }

  private hasEmptyNodesBefore(node: JSONContent): boolean {
    // Check if the node has a parent and siblings
    if (!node.parent?.content) return false;

    const nodeIndex = node.parent.content.findIndex(
      (n: JSONContent) => n === node
    );
    if (nodeIndex <= 0) return false;

    // Check previous sibling for empty paragraph
    const prevSibling = node.parent.content[nodeIndex - 1];
    return (
      prevSibling?.type === "paragraph" &&
      (!prevSibling.content || prevSibling.content.length === 0)
    );
  }

  visitHeading(node: JSONContent): void {
    console.log("[TodoVisitor] Visiting Heading:", {
      level: node.attrs?.level,
      content: node.content,
    });

    if (node.attrs?.level && node.content?.[0]?.text) {
      this.currentHeading = {
        id: this.generateId(),
        type: ContentType.HEADING,
        content: node.content[0].text,
        level: node.attrs.level,
      };
      console.log("[TodoVisitor] Set Current Heading:", this.currentHeading);
    }
  }

  visitTaskItem(node: JSONContent): void {
    console.log("[TodoVisitor] Visiting TaskItem:", {
      attrs: node.attrs,
      hasContent: !!node.content,
      contentLength: node.content?.length,
      currentHeading: this.currentHeading,
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

    // Add heading reference if available
    if (this.currentHeading) {
      this.currentTodo.heading = {
        id: this.currentHeading.id,
        content: this.currentHeading.content,
        level: this.currentHeading.level,
      };
    }

    // Reset content parts for new task item
    this.contentParts = [];

    // Process all content recursively
    if (node.content) {
      console.log("[TodoVisitor] Processing content:", {
        contentLength: node.content.length,
        firstNodeType: node.content[0]?.type,
        hasText: node.content[0]?.content?.[0]?.type === "text",
        textContent: node.content[0]?.content?.[0]?.text,
      });
      this.processContent(node.content);
    }

    console.log("[TodoVisitor] After processing:", {
      contentPartsLength: this.contentParts.length,
      contentParts: this.contentParts,
      hasCurrentTodo: !!this.currentTodo,
      nodeContent: node.content,
    });

    // Only create todo if we have actual content (non-empty text)
    const content = this.contentParts.join(" ").trim();
    if (this.currentTodo && content.length > 0) {
      this.currentTodo.content = content;
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
      } else if (node.type === "heading") {
        this.visitHeading(node);
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

  /**
   * Adds a todo item directly to the visitor's items list
   * This is primarily used for testing purposes
   * @param todo The todo item to add
   */
  addItem(todo: Todo): void {
    this.items.push(todo);
  }
}
