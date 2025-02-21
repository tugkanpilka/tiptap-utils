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
    it("should create a simple todo item", () => {
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
                    text: "Test todo",
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
        content: "Test todo",
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
        content: "Test todo",
        isCompleted: true,
        metadata: {
          priority: "high",
        },
      });
      expect(todos[0].id).toBeDefined();
    });

    it("should handle task item without metadata", () => {
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
                    text: "Test todo",
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
        content: "Test todo",
        isCompleted: false,
      });
      expect(todos[0].id).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should not create todo without task item", () => {
      visitor.visitTaskList({
        type: TaskList.name,
      });

      visitor.visitText({
        type: "text",
        text: "Test todo",
      });

      expect(visitor.getItems()).toHaveLength(0);
    });

    it("should not create todo without content", () => {
      visitor.visitTaskList({
        type: TaskList.name,
      });

      visitor.visitTaskItem({
        type: TaskItem.name,
        attrs: { checked: false },
      });

      expect(visitor.getItems()).toHaveLength(0);
    });

    it("should not create todo with empty text content", () => {
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
      expect(todos).toHaveLength(0);
    });

    it("should not create todo with empty paragraph", () => {
      const content = {
        type: "doc",
        content: [
          {
            type: "taskList",
            content: [
              {
                type: "taskItem",
                attrs: { checked: false },
                content: [
                  {
                    type: "paragraph",
                  },
                ],
              },
            ],
          },
        ],
      };

      const visitor = new TodoVisitor();
      visitor.visitTaskItem(content.content[0].content[0]);
      const todos = visitor.getItems();

      expect(todos).toHaveLength(0);
    });
  });

  describe("Complex Content", () => {
    it("should handle multiple paragraphs", () => {
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

      // Visit both paragraphs
      taskList.content![0].content!.forEach((paragraph) => {
        visitor.visitText(paragraph.content![0]);
      });

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0].content).toBe("First paragraph Second paragraph");
    });

    it("should handle nested ordered lists", () => {
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
                    text: "Main text",
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
                            text: "First item",
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
                            text: "Second item",
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

      // Visit main text
      visitor.visitText(taskList.content![0].content![0].content![0]);

      // Visit list items
      const orderedList = taskList.content![0].content![1];
      orderedList.content!.forEach((listItem) => {
        visitor.visitText(listItem.content![0].content![0]);
      });

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0].content).toBe("Main text First item Second item");
    });

    it("should handle paragraph with content", () => {
      const content = {
        type: "doc",
        content: [
          {
            type: "taskList",
            content: [
              {
                type: "taskItem",
                attrs: { checked: false },
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Task with paragraph",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const visitor = new TodoVisitor();
      visitor.visitTaskItem(content.content[0].content[0]);
      const todos = visitor.getItems();

      expect(todos).toHaveLength(1);
      expect(todos[0].content).toBe("Task with paragraph");
    });
  });

  describe("Heading Detection", () => {
    it("should associate todo with its parent heading", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Project Tasks" }],
          },
          {
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
                        text: "Complete documentation",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      // Visit heading first
      visitor.visitHeading(content.content![0]);

      // Then visit task list and its content
      visitor.visitTaskList(content.content![1]);
      visitor.visitTaskItem(content.content![1].content![0]);
      visitor.visitText(
        content.content![1].content![0].content![0].content![0]
      );

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toMatchObject({
        type: ContentType.TODO,
        content: "Complete documentation",
        isCompleted: false,
        heading: {
          content: "Project Tasks",
          level: 2,
        },
      });
      expect(todos[0].heading?.id).toBeDefined();
    });

    it("should handle multiple headings and associate todos with the nearest heading", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Main Section" }],
          },
          {
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
                        text: "Task under main section",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Sub Section" }],
          },
          {
            type: TaskList.name,
            content: [
              {
                type: TaskItem.name,
                attrs: { checked: true },
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Task under sub section",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      // Process first section
      visitor.visitHeading(content.content![0]);
      visitor.visitTaskList(content.content![1]);
      visitor.visitTaskItem(content.content![1].content![0]);
      visitor.visitText(
        content.content![1].content![0].content![0].content![0]
      );

      // Process second section
      visitor.visitHeading(content.content![2]);
      visitor.visitTaskList(content.content![3]);
      visitor.visitTaskItem(content.content![3].content![0]);
      visitor.visitText(
        content.content![3].content![0].content![0].content![0]
      );

      const todos = visitor.getItems();
      expect(todos).toHaveLength(2);

      // First todo should be under "Main Section"
      expect(todos[0]).toMatchObject({
        content: "Task under main section",
        isCompleted: false,
        heading: {
          content: "Main Section",
          level: 1,
        },
      });

      // Second todo should be under "Sub Section"
      expect(todos[1]).toMatchObject({
        content: "Task under sub section",
        isCompleted: true,
        heading: {
          content: "Sub Section",
          level: 2,
        },
      });
    });

    it("should handle todos without any heading", () => {
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
                    text: "Orphan task",
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
        content: "Orphan task",
        isCompleted: false,
      });
      expect(todos[0].heading).toBeUndefined();
    });

    it("should handle heading without content", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
          },
          {
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
                        text: "Task under empty heading",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      visitor.visitHeading(content.content![0]);
      visitor.visitTaskList(content.content![1]);
      visitor.visitTaskItem(content.content![1].content![0]);
      visitor.visitText(
        content.content![1].content![0].content![0].content![0]
      );

      const todos = visitor.getItems();
      expect(todos).toHaveLength(1);
      expect(todos[0].heading).toBeUndefined();
    });
  });

  describe("Heading Inheritance", () => {
    it("should not inherit heading when todos are separated by whitespace", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Main Section" }],
          },
          {
            type: TaskList.name,
            content: [
              {
                type: TaskItem.name,
                attrs: { checked: false },
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "First todo" }],
                  },
                ],
              },
            ],
          },
          // Empty paragraph between todos
          {
            type: "paragraph",
            content: [],
          },
          {
            type: TaskList.name,
            content: [
              {
                type: TaskItem.name,
                attrs: { checked: false },
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Second todo" }],
                  },
                ],
              },
            ],
          },
        ],
      };

      // Add parent references
      if (content.content) {
        content.content.forEach((node, index) => {
          node.parent = content;
          if (node.content) {
            node.content.forEach((child) => {
              child.parent = node;
              if (child.content) {
                child.content.forEach((grandChild) => {
                  grandChild.parent = child;
                });
              }
            });
          }
        });
      }

      // Process first section and todo
      visitor.visitHeading(content.content![0]);
      visitor.visitTaskList(content.content![1]);
      visitor.visitTaskItem(content.content![1].content![0]);
      visitor.visitText(
        content.content![1].content![0].content![0].content![0]
      );

      // Process second todo
      visitor.visitTaskList(content.content![3]);
      visitor.visitTaskItem(content.content![3].content![0]);
      visitor.visitText(
        content.content![3].content![0].content![0].content![0]
      );

      const todos = visitor.getItems();
      expect(todos).toHaveLength(2);

      // First todo should be under "Main Section"
      expect(todos[0]).toMatchObject({
        content: "First todo",
        isCompleted: false,
        heading: {
          content: "Main Section",
          level: 1,
        },
      });

      // Second todo should NOT have a heading
      expect(todos[1]).toMatchObject({
        content: "Second todo",
        isCompleted: false,
      });
      expect(todos[1].heading).toBeUndefined();
    });
  });
});
