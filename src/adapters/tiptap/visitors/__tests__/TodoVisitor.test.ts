import { TodoVisitor } from "../TodoVisitor";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
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
    it("should create a simple todo item with text content", () => {
      // Simulate the structure: TaskList -> TaskItem -> Paragraph -> Text
      const taskList: JSONContent = {
        type: TaskList.name,
        content: [
          {
            type: TaskItem.name,
            attrs: { checked: false },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Simple todo item",
                  },
                ],
              },
            ],
          },
        ],
      };

      visitor.visitTaskList(taskList);
      visitor.visitTaskItem(taskList.content![0]);
      visitor.visitText(taskList.content![0].content![0].content![0]);

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toMatchObject({
        type: ContentType.TODO,
        content: "Simple todo item",
        isCompleted: false,
      });
    });

    it("should handle todo item with metadata", () => {
      const taskList: JSONContent = {
        type: TaskList.name,
        content: [
          {
            type: TaskItem.name,
            attrs: {
              checked: true,
              metadata: {
                priority: "high",
                dueDate: "2024-03-01",
              },
            },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Todo with metadata",
                  },
                ],
              },
            ],
          },
        ],
      };

      visitor.visitTaskList(taskList);
      visitor.visitTaskItem(taskList.content![0]);
      visitor.visitText(taskList.content![0].content![0].content![0]);

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toMatchObject({
        isCompleted: true,
        content: "Todo with metadata",
        metadata: {
          priority: "high",
          dueDate: "2024-03-01",
        },
      });
    });
  });

  describe("Complex Content Structures", () => {
    it("should handle todo item with nested ordered list", () => {
      const taskList: JSONContent = {
        type: TaskList.name,
        content: [
          {
            type: TaskItem.name,
            attrs: { checked: false },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Main todo text",
                  },
                ],
              },
              {
                type: "orderedList",
                content: [
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: "First sub-item",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: "Second sub-item",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      visitor.visitTaskList(taskList);
      visitor.visitTaskItem(taskList.content![0]);

      // Manually traverse the structure to simulate the traverser
      const taskItem = taskList.content![0];
      visitor.visitText(taskItem.content![0].content![0]); // Main text

      // Visit ordered list items
      const orderedList = taskItem.content![1];
      orderedList.content?.forEach((listItem) => {
        listItem.content?.forEach((paragraph) => {
          paragraph.content?.forEach((text) => {
            visitor.visitText(text);
          });
        });
      });

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0].content).toBe(
        "Main todo text First sub-item Second sub-item"
      );
    });

    it("should handle multiple paragraphs in a todo item", () => {
      const taskList: JSONContent = {
        type: TaskList.name,
        content: [
          {
            type: TaskItem.name,
            attrs: { checked: false },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "First paragraph",
                  },
                ],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Second paragraph",
                  },
                ],
              },
            ],
          },
        ],
      };

      visitor.visitTaskList(taskList);
      visitor.visitTaskItem(taskList.content![0]);

      const taskItem = taskList.content![0];
      taskItem.content?.forEach((paragraph) => {
        paragraph.content?.forEach((text) => {
          visitor.visitText(text);
        });
      });

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0].content).toBe("First paragraph Second paragraph");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content", () => {
      const taskList: JSONContent = {
        type: TaskList.name,
        content: [
          {
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
          },
        ],
      };

      visitor.visitTaskList(taskList);
      visitor.visitTaskItem(taskList.content![0]);
      visitor.visitText(taskList.content![0].content![0].content![0]);

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0].content).toBe("");
    });

    it("should handle missing content array", () => {
      const taskList: JSONContent = {
        type: TaskList.name,
        content: [
          {
            type: TaskItem.name,
            attrs: { checked: false },
          },
        ],
      };

      visitor.visitTaskList(taskList);
      visitor.visitTaskItem(taskList.content![0]);

      const todos = visitor.getItems();
      expect(todos).toHaveLength(0);
    });
  });

  describe("Multiple Todos", () => {
    it("should handle multiple todo items in a task list", () => {
      const taskList: JSONContent = {
        type: TaskList.name,
        content: [
          {
            type: TaskItem.name,
            attrs: { checked: false },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "First todo",
                  },
                ],
              },
            ],
          },
          {
            type: TaskItem.name,
            attrs: { checked: true },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Second todo",
                  },
                ],
              },
            ],
          },
        ],
      };

      visitor.visitTaskList(taskList);

      // Visit first todo
      visitor.visitTaskItem(taskList.content![0]);
      visitor.visitText(taskList.content![0].content![0].content![0]);

      // Visit second todo
      visitor.visitTaskItem(taskList.content![1]);
      visitor.visitText(taskList.content![1].content![0].content![0]);

      const todos = visitor.getItems();
      expect(todos).toHaveLength(2);
      expect(todos[0]).toMatchObject({
        content: "First todo",
        isCompleted: false,
      });
      expect(todos[1]).toMatchObject({
        content: "Second todo",
        isCompleted: true,
      });
    });
  });
});
