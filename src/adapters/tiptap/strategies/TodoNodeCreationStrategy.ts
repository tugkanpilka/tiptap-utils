import { JSONContent } from "@tiptap/core";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { ContentItem, ContentType, Todo } from "../../../domain/types";
import { NodeCreationStrategy } from "../../types";

export class TodoNodeCreationStrategy implements NodeCreationStrategy {
  canHandle(item: ContentItem): boolean {
    return item.type === ContentType.TODO;
  }

  createNode(
    item: ContentItem
  ): Required<Pick<JSONContent, "type" | "content">> {
    const todoItem = item as Todo;
    return {
      type: TaskList.name,
      content: [
        {
          type: TaskItem.name,
          attrs: {
            checked: todoItem.isCompleted,
            ...todoItem.metadata,
          },
          content: [
            {
              type: "text",
              text: todoItem.content,
            },
          ],
        },
      ],
    };
  }
}
