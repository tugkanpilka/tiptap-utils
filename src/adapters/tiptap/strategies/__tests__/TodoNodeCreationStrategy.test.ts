import { TodoNodeCreationStrategy } from "../TodoNodeCreationStrategy";
import { ContentType, Todo } from "../../../../domain/types";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";

describe("TodoNodeStrategy", () => {
  let strategy: TodoNodeCreationStrategy;

  beforeEach(() => {
    strategy = new TodoNodeCreationStrategy();
  });

  describe("canHandle", () => {
    it("should return true for TODO type content", () => {
      const todoItem: Todo = {
        id: "1",
        type: ContentType.TODO,
        content: "Test todo",
        isCompleted: false,
      };

      expect(strategy.canHandle(todoItem)).toBe(true);
    });

    it("should return false for non-TODO type content", () => {
      const noteItem = {
        id: "1",
        type: ContentType.NOTE,
        content: "Test note",
      };

      expect(strategy.canHandle(noteItem)).toBe(false);
    });
  });

  describe("createNode", () => {
    it("should create correct node structure for a todo item", () => {
      const todoItem: Todo = {
        id: "1",
        type: ContentType.TODO,
        content: "Test todo",
        isCompleted: true,
        metadata: { priority: "high" },
      };

      const expectedNode = {
        type: TaskList.name,
        content: [
          {
            type: TaskItem.name,
            attrs: {
              checked: true,
              priority: "high",
            },
            content: [
              {
                type: "text",
                text: "Test todo",
              },
            ],
          },
        ],
      };

      expect(strategy.createNode(todoItem)).toEqual(expectedNode);
    });

    it("should handle todo item without metadata", () => {
      const todoItem: Todo = {
        id: "1",
        type: ContentType.TODO,
        content: "Test todo",
        isCompleted: false,
      };

      const node = strategy.createNode(todoItem);
      expect(node.type).toBe(TaskList.name);
      expect(node.content).toBeDefined();
      expect(Array.isArray(node.content)).toBe(true);
      expect(node.content.length).toBeGreaterThan(0);
      expect(node.content[0].type).toBe(TaskItem.name);
      expect(node.content[0].attrs?.checked).toBe(false);
    });
  });
});
