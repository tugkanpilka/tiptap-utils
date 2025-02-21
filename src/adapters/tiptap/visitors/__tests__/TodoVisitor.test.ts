import { TodoVisitor } from "../TodoVisitor";
import { TaskItem } from "@tiptap/extension-task-item";
import { ContentType } from "../../../../domain/types";
import { JSONContent } from "@tiptap/core";

describe("TodoVisitor", () => {
  let visitor: TodoVisitor;

  beforeEach(() => {
    visitor = new TodoVisitor();
  });

  afterEach(() => {
    visitor.clearItems();
  });

  describe("Basic Todo Operations", () => {
    it("should create a simple todo item", () => {
      const taskItem: JSONContent = {
        type: TaskItem.name,
        attrs: { checked: false },
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Test todo",
              },
            ],
          },
        ],
      };

      visitor.visitTaskItem(taskItem);
      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toMatchObject({
        type: ContentType.TODO,
        content: "Test todo",
        isCompleted: false,
      });
    });

    it("should handle todo item with metadata", () => {
      const taskItem: JSONContent = {
        type: TaskItem.name,
        attrs: {
          checked: true,
          metadata: {
            priority: "high",
          },
        },
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Test todo",
              },
            ],
          },
        ],
      };

      visitor.visitTaskItem(taskItem);
      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toMatchObject({
        type: ContentType.TODO,
        content: "Test todo",
        isCompleted: true,
        metadata: {
          priority: "high",
        },
      });
      expect(todos[0].id).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should not create todo without task item", () => {
      visitor.visitText({
        type: "text",
        text: "Test todo",
      });

      expect(visitor.getItems()).toHaveLength(0);
    });

    it("should not create todo without content", () => {
      visitor.visitTaskItem({
        type: TaskItem.name,
        attrs: { checked: false },
      });

      expect(visitor.getItems()).toHaveLength(0);
    });

    it("should not create todo with empty text content", () => {
      const taskItem: JSONContent = {
        type: TaskItem.name,
        attrs: { checked: false },
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "",
              },
            ],
          },
        ],
      };

      visitor.visitTaskItem(taskItem);
      expect(visitor.getItems()).toHaveLength(0);
    });
  });
}); 