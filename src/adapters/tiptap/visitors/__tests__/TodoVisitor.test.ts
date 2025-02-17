import { TodoVisitor } from "../TodoVisitor";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { ContentType } from "../../../../domain/types";

describe("TodoVisitor", () => {
  let visitor: TodoVisitor;

  beforeEach(() => {
    visitor = new TodoVisitor();
  });

  afterEach(() => {
    visitor.clearItems();
  });

  describe("visitTaskList", () => {
    it("should initialize a new todo item", () => {
      visitor.visitTaskList({
        type: TaskList.name,
      } as any);

      visitor.visitText({
        type: "text",
        text: "Test todo",
      } as any);

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0].type).toBe(ContentType.TODO);
      expect(todos[0].content).toBe("Test todo");
      expect(todos[0].isCompleted).toBe(false);
    });
  });

  describe("visitTaskItem", () => {
    it("should set todo completion status and metadata", () => {
      visitor.visitTaskList({
        type: TaskList.name,
      } as any);

      visitor.visitTaskItem({
        type: TaskItem.name,
        attrs: {
          checked: true,
          metadata: {
            priority: "high",
          },
        },
      } as any);

      visitor.visitText({
        type: "text",
        text: "Test todo",
      } as any);

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toEqual(
        expect.objectContaining({
          type: ContentType.TODO,
          content: "Test todo",
          isCompleted: true,
          metadata: {
            priority: "high",
          },
        })
      );
      expect(todos[0].id).toBeDefined();
    });

    it("should handle task item without metadata", () => {
      visitor.visitTaskList({
        type: TaskList.name,
      } as any);

      visitor.visitTaskItem({
        type: TaskItem.name,
        attrs: {
          checked: false,
        },
      } as any);

      visitor.visitText({
        type: "text",
        text: "Test todo",
      } as any);

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toEqual(
        expect.objectContaining({
          type: ContentType.TODO,
          content: "Test todo",
          isCompleted: false,
        })
      );
      expect(todos[0].id).toBeDefined();
    });
  });

  describe("visitText", () => {
    it("should not create todo without task list context", () => {
      visitor.visitText({
        type: "text",
        text: "Test todo",
      } as any);

      expect(visitor.getItems()).toHaveLength(0);
    });

    it("should finalize todo item with text content", () => {
      visitor.visitTaskList({
        type: TaskList.name,
      } as any);

      visitor.visitTaskItem({
        type: TaskItem.name,
        attrs: {
          checked: false,
        },
      } as any);

      visitor.visitText({
        type: "text",
        text: "Test todo",
      } as any);

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0].content).toBe("Test todo");
    });
  });
});
