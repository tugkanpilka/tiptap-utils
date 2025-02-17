import { TodoVisitor } from "../TodoVisitor";
import { TaskItem } from "@tiptap/extension-task-item";
import { ContentType } from "../../../../domain/types";

describe("TodoVisitor", () => {
  let visitor: TodoVisitor;

  beforeEach(() => {
    visitor = new TodoVisitor();
  });

  describe("visitTaskItem", () => {
    it("should create todo item from task item node", () => {
      const node = {
        type: TaskItem.name,
        attrs: {
          id: "test-id",
          checked: true,
          priority: "high",
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

      visitor.visitTaskItem(node as any);
      const todos = visitor.getItems();

      expect(todos).toHaveLength(1);
      expect(todos[0]).toEqual({
        id: "test-id",
        type: ContentType.TODO,
        content: "Test todo",
        isCompleted: true,
        metadata: {
          id: "test-id",
          checked: true,
          priority: "high",
        },
      });
    });

    it("should generate id if not provided", () => {
      const node = {
        type: TaskItem.name,
        attrs: {
          checked: false,
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

      visitor.visitTaskItem(node as any);
      const todos = visitor.getItems();

      expect(todos[0].id).toBeDefined();
      expect(typeof todos[0].id).toBe("string");
    });
  });

  describe("visitTaskList and visitText", () => {
    it("should not create todos for task list container", () => {
      visitor.visitTaskList({} as any);
      expect(visitor.getItems()).toHaveLength(0);
    });

    it("should not create todos for text nodes", () => {
      visitor.visitText({ text: "Test" } as any);
      expect(visitor.getItems()).toHaveLength(0);
    });
  });
});
