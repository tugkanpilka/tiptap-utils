import { TodoVisitor } from "../TodoVisitor";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { ContentType, Todo } from "../../../../domain/types";
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

  describe("Group Operations", () => {
    beforeEach(() => {
      // Create sample todos with different dates and headings
      const todos = [
        {
          id: "1",
          type: ContentType.TODO as ContentType.TODO,
          content: "Task 1",
          isCompleted: false,
          metadata: { sourceDate: "2024-03-20" },
          heading: { id: "h1", content: "Section 1", level: 1 },
        },
        {
          id: "2",
          type: ContentType.TODO as ContentType.TODO,
          content: "Task 2",
          isCompleted: true,
          metadata: { sourceDate: "2024-03-20" },
          heading: { id: "h2", content: "Section 2", level: 2 },
        },
        {
          id: "3",
          type: ContentType.TODO as ContentType.TODO,
          content: "Task 3",
          isCompleted: false,
          metadata: { sourceDate: "2024-03-21" },
          heading: { id: "h1", content: "Section 1", level: 1 },
        },
        // Add more test data for sorting tests
        {
          id: "4",
          type: ContentType.TODO as ContentType.TODO,
          content: "Task 4",
          isCompleted: true,
          metadata: { sourceDate: "2024-03-19" },
          heading: { id: "h3", content: "Section 3", level: 3 },
        },
        {
          id: "5",
          type: ContentType.TODO as ContentType.TODO,
          content: "Task 5",
          isCompleted: false,
          metadata: { sourceDate: "2024-03-19" },
          heading: { id: "h0", content: "Main Section", level: 0 },
        },
      ];

      // Add todos to visitor
      todos.forEach((todo) => visitor["items"].push(todo));
    });

    it("should group todos by date", () => {
      const groups = visitor.groupBy({ fields: ["date"] });

      expect(groups).toHaveLength(3);
      expect(groups.map((g) => g.date)).toEqual([
        "2024-03-19",
        "2024-03-20",
        "2024-03-21",
      ]);
      expect(groups[0].todos).toHaveLength(2); // 19th
      expect(groups[1].todos).toHaveLength(2); // 20th
      expect(groups[2].todos).toHaveLength(1); // 21st
    });

    it("should group todos by heading", () => {
      const groups = visitor.groupBy({ fields: ["heading"] });

      expect(groups).toHaveLength(4);
      expect(groups[0].heading?.level).toBe(0);
      expect(groups[0].heading?.content).toBe("Main Section");
      expect(groups[1].heading?.level).toBe(1);
      expect(groups[1].heading?.content).toBe("Section 1");
      expect(groups[2].heading?.level).toBe(2);
      expect(groups[2].heading?.content).toBe("Section 2");
      expect(groups[3].heading?.level).toBe(3);
      expect(groups[3].heading?.content).toBe("Section 3");
    });

    it("should group todos by both date and heading", () => {
      const groups = visitor.groupBy({ fields: ["date", "heading"] });

      expect(groups).toHaveLength(5);

      // Verify the complete order
      const groupInfo = groups.map((g) => ({
        date: g.date,
        heading: g.heading?.content,
        level: g.heading?.level,
        todoCount: g.todos.length,
      }));

      expect(groupInfo).toEqual([
        { date: "2024-03-19", heading: "Main Section", level: 0, todoCount: 1 },
        { date: "2024-03-19", heading: "Section 3", level: 3, todoCount: 1 },
        { date: "2024-03-20", heading: "Section 1", level: 1, todoCount: 1 },
        { date: "2024-03-20", heading: "Section 2", level: 2, todoCount: 1 },
        { date: "2024-03-21", heading: "Section 1", level: 1, todoCount: 1 },
      ]);
    });

    it("should handle empty grouping fields", () => {
      const groups = visitor.groupBy({ fields: [] });
      expect(groups).toHaveLength(1);
      expect(groups[0].todos).toHaveLength(5);
      expect(groups[0].date).toBeUndefined();
      expect(groups[0].heading).toBeUndefined();
    });

    it("should handle todos without specified grouping fields", () => {
      // Add a todo without date and heading
      visitor["items"].push({
        id: "6",
        type: ContentType.TODO as ContentType.TODO,
        content: "Orphan Task",
        isCompleted: false,
      });

      const groups = visitor.groupBy({ fields: ["date", "heading"] });

      // Find the group with undefined date and heading
      const orphanGroup = groups.find((g) => !g.date && !g.heading);
      expect(orphanGroup).toBeDefined();
      expect(orphanGroup?.todos).toHaveLength(1);
      expect(orphanGroup?.todos[0].content).toBe("Orphan Task");
    });

    describe("Sorting Behavior", () => {
      it("should maintain stable sorting when grouping by multiple fields", () => {
        const groups = visitor.groupBy({ fields: ["date", "heading"] });

        // Should be sorted first by date, then by heading level
        const sortedGroups = groups.map((g) => ({
          date: g.date,
          heading: g.heading?.content,
          level: g.heading?.level,
        }));

        expect(sortedGroups).toEqual([
          { date: "2024-03-19", heading: "Main Section", level: 0 },
          { date: "2024-03-19", heading: "Section 3", level: 3 },
          { date: "2024-03-20", heading: "Section 1", level: 1 },
          { date: "2024-03-20", heading: "Section 2", level: 2 },
          { date: "2024-03-21", heading: "Section 1", level: 1 },
        ]);
      });
    });

    describe("Edge Cases and Special Scenarios", () => {
      it("should handle todos with partial grouping information", () => {
        // Add a todo with only date, no heading
        visitor.addItem({
          id: "6",
          type: ContentType.TODO,
          content: "Date only task",
          isCompleted: false,
          metadata: { sourceDate: "2024-03-20" },
        });

        // Add a todo with only heading, no date
        visitor.addItem({
          id: "7",
          type: ContentType.TODO,
          content: "Heading only task",
          isCompleted: false,
          heading: { id: "h1", content: "Section 1", level: 1 },
        });

        const groups = visitor.groupBy({ fields: ["date", "heading"] });

        // Find groups with partial information
        const dateOnlyGroup = groups.find(
          (g) => g.date === "2024-03-20" && !g.heading
        );
        const headingOnlyGroup = groups.find(
          (g) => !g.date && g.heading?.content === "Section 1"
        );

        expect(dateOnlyGroup).toBeDefined();
        expect(dateOnlyGroup?.todos).toHaveLength(1);
        expect(dateOnlyGroup?.todos[0].content).toBe("Date only task");

        expect(headingOnlyGroup).toBeDefined();
        expect(headingOnlyGroup?.todos).toHaveLength(1);
        expect(headingOnlyGroup?.todos[0].content).toBe("Heading only task");
      });

      it("should handle invalid or non-existent grouping fields", () => {
        const groups = visitor.groupBy({
          // @ts-ignore - Testing invalid field
          fields: ["invalid", "nonexistent"],
        });

        // Should create a single group with all todos
        expect(groups).toHaveLength(1);
        expect(groups[0].todos).toHaveLength(visitor.getItems().length);
        expect(groups[0].date).toBeUndefined();
        expect(groups[0].heading).toBeUndefined();
      });

      it("should handle empty grouping fields", () => {
        const groups = visitor.groupBy({ fields: [] });
        expect(groups).toHaveLength(1);
        expect(groups[0].todos).toHaveLength(visitor.getItems().length);
        expect(groups[0].date).toBeUndefined();
        expect(groups[0].heading).toBeUndefined();
      });
    });
  });

  describe("Grouping Functionality", () => {
    beforeEach(() => {
      // Create sample todos with different dates and headings
      const todos = [
        {
          id: "1",
          type: ContentType.TODO,
          content: "Task 1",
          isCompleted: false,
          metadata: {
            sourceDate: "2024-03-20",
          },
        },
        {
          id: "2",
          type: ContentType.TODO,
          content: "Task 2",
          isCompleted: true,
          metadata: {
            sourceDate: "2024-03-20",
          },
          heading: {
            id: "h1",
            content: "Work",
            level: 1,
          },
        },
        {
          id: "3",
          type: ContentType.TODO,
          content: "Task 3",
          isCompleted: false,
          metadata: {
            sourceDate: "2024-03-21",
          },
          heading: {
            id: "h1",
            content: "Work",
            level: 1,
          },
        },
      ] as Todo[];

      todos.forEach((todo) => visitor.addItem(todo));
    });

    it("should group todos by date", () => {
      const groups = visitor.groupBy({ fields: ["date"] });

      expect(groups).toHaveLength(2);
      expect(groups).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            date: "2024-03-20",
            todos: expect.arrayContaining([
              expect.objectContaining({ id: "1" }),
              expect.objectContaining({ id: "2" }),
            ]),
          }),
          expect.objectContaining({
            date: "2024-03-21",
            todos: expect.arrayContaining([
              expect.objectContaining({ id: "3" }),
            ]),
          }),
        ])
      );
    });

    it("should group todos by heading", () => {
      const groups = visitor.groupBy({ fields: ["heading"] });

      expect(groups).toHaveLength(2); // One group for todos with heading, one for without
      expect(groups).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            heading: {
              id: "h1",
              content: "Work",
              level: 1,
            },
            todos: expect.arrayContaining([
              expect.objectContaining({ id: "2" }),
              expect.objectContaining({ id: "3" }),
            ]),
          }),
          expect.objectContaining({
            todos: expect.arrayContaining([
              expect.objectContaining({ id: "1" }),
            ]),
          }),
        ])
      );
    });

    it("should group todos by both date and heading", () => {
      const groups = visitor.groupBy({ fields: ["date", "heading"] });

      expect(groups).toHaveLength(3);
      expect(groups).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            date: "2024-03-20",
            heading: {
              id: "h1",
              content: "Work",
              level: 1,
            },
            todos: expect.arrayContaining([
              expect.objectContaining({ id: "2" }),
            ]),
          }),
          expect.objectContaining({
            date: "2024-03-20",
            todos: expect.arrayContaining([
              expect.objectContaining({ id: "1" }),
            ]),
          }),
          expect.objectContaining({
            date: "2024-03-21",
            heading: {
              id: "h1",
              content: "Work",
              level: 1,
            },
            todos: expect.arrayContaining([
              expect.objectContaining({ id: "3" }),
            ]),
          }),
        ])
      );
    });

    it("should handle empty groups correctly", () => {
      visitor.clearItems();
      const groups = visitor.groupBy({ fields: ["date", "heading"] });
      expect(groups).toHaveLength(0);
    });

    it("should handle todos without grouping metadata", () => {
      visitor.clearItems();
      visitor.addItem({
        id: "4",
        type: ContentType.TODO,
        content: "Task without metadata",
        isCompleted: false,
      });

      const dateGroups = visitor.groupBy({ fields: ["date"] });
      const headingGroups = visitor.groupBy({ fields: ["heading"] });

      expect(dateGroups).toHaveLength(1);
      expect(dateGroups[0].todos).toHaveLength(1);
      expect(dateGroups[0].date).toBeUndefined();

      expect(headingGroups).toHaveLength(1);
      expect(headingGroups[0].todos).toHaveLength(1);
      expect(headingGroups[0].heading).toBeUndefined();
    });
  });
});
