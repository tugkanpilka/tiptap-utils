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

  describe("Complex Document Structure", () => {
    it("should handle complex document with headings and task lists", () => {
      const complexDoc: JSONContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Docbook" }],
          },
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
                        text: "Test dosyalarının tekrar organize edilmesi.",
                      },
                    ],
                  },
                ],
              },
              {
                type: "taskItem",
                attrs: { checked: false },
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Pazarlama stratejileri @Esra." },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Mülakatlar" }],
          },
          {
            type: "taskList",
            content: [
              {
                type: "taskItem",
                attrs: { checked: false },
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "LeetCode planlama." }],
                  },
                ],
              },
            ],
          },
        ],
      };

      // Visit the document structure
      if (complexDoc.content) {
        // Visit first heading
        const docbookHeading = complexDoc.content[0] as JSONContent;
        visitor.visitHeading(docbookHeading);

        // Visit tasks under Docbook
        const docbookTaskList = complexDoc.content[1] as JSONContent;
        visitor.visitTaskList(docbookTaskList);
        if (docbookTaskList.content) {
          visitor.visitTaskItem(docbookTaskList.content[0] as JSONContent);
          visitor.visitTaskItem(docbookTaskList.content[1] as JSONContent);
        }

        // Visit second heading
        const interviewsHeading = complexDoc.content[2] as JSONContent;
        visitor.visitHeading(interviewsHeading);

        // Visit tasks under Interviews
        const interviewsTaskList = complexDoc.content[3] as JSONContent;
        visitor.visitTaskList(interviewsTaskList);
        if (interviewsTaskList.content) {
          visitor.visitTaskItem(interviewsTaskList.content[0] as JSONContent);
        }
      }

      const todos = visitor.getItems();

      // Assertions
      expect(todos).toHaveLength(3);
      expect(todos[0]).toMatchObject({
        type: ContentType.TODO,
        content: "Test dosyalarının tekrar organize edilmesi.",
        isCompleted: false,
        heading: {
          content: "Docbook",
          level: 2,
        },
      });
      expect(todos[1]).toMatchObject({
        type: ContentType.TODO,
        content: "Pazarlama stratejileri @Esra.",
        isCompleted: false,
        heading: {
          content: "Docbook",
          level: 2,
        },
      });
      expect(todos[2]).toMatchObject({
        type: ContentType.TODO,
        content: "LeetCode planlama.",
        isCompleted: false,
        heading: {
          content: "Mülakatlar",
          level: 2,
        },
      });
    });
  });
});