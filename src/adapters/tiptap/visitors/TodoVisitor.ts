import { JSONContent } from "@tiptap/core";
import { TaskList } from "@tiptap/extension-task-list";
import { BaseContentVisitor } from "./BaseContentVisitor";
import { ContentType, Todo } from "../../../domain/types";

export class TodoVisitor extends BaseContentVisitor<Todo> {
  private currentTodo: Partial<Todo> | null = null;
  private isFinalized: boolean = false;

  visitTaskList(node: JSONContent): void {
    // Reset state for new task list
    this.currentTodo = {
      type: ContentType.TODO,
      isCompleted: false,
    };
    this.isFinalized = false;
  }

  visitTaskItem(node: JSONContent): void {
    if (this.currentTodo && node.attrs) {
      this.currentTodo.isCompleted = node.attrs.checked || false;
      if (node.attrs.metadata) {
        this.currentTodo.metadata = node.attrs.metadata;
      }
    }
  }

  visitText(node: JSONContent): void {
    if (this.currentTodo && node.text && !this.isFinalized) {
      this.currentTodo.content = node.text;
      this.currentTodo.id = this.generateId();
      this.items.push(this.currentTodo as Todo);
      this.isFinalized = true;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
