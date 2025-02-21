import { TodoContentAdapter } from "../TodoContentAdapter";
import { ContentType, Todo } from "../../../../domain/types";
import { TodoTraverser } from "../../traversers/TodoTraverser";
import { TodoVisitor } from "../../visitors/TodoVisitor";
import { DefaultNodeCreationStrategy } from "../../strategies/DefaultNodeCreationStrategy";
import { TiptapContentValidator } from "../../validation/ContentValidator";

describe("TodoContentAdapter", () => {
  let adapter: TodoContentAdapter;

  beforeEach(() => {
    adapter = new TodoContentAdapter(
      new TodoTraverser(),
      new TodoVisitor(),
      [new DefaultNodeCreationStrategy()],
      [],
      new TiptapContentValidator()
    );
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
      ] as Todo[];

      todos.forEach((todo) => adapter.addItem(todo));
    });

    it("should group todos by date", () => {
      const groups = adapter.groupBy({ fields: ["date"] });

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
      const groups = adapter.groupBy({ fields: ["heading"] });

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
      const groups = adapter.groupBy({ fields: ["date", "heading"] });

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
      const groups = adapter.groupBy({ fields: [] });
      expect(groups).toHaveLength(1);
      expect(groups[0].todos).toHaveLength(5);
      expect(groups[0].date).toBeUndefined();
      expect(groups[0].heading).toBeUndefined();
    });

    it("should handle todos without specified grouping fields", () => {
      // Add a todo without date and heading
      adapter.addItem({
        id: "6",
        type: ContentType.TODO as ContentType.TODO,
        content: "Orphan Task",
        isCompleted: false,
      });

      const groups = adapter.groupBy({ fields: ["date", "heading"] });

      // Find the group with undefined date and heading
      const orphanGroup = groups.find((g) => !g.date && !g.heading);
      expect(orphanGroup).toBeDefined();
      expect(orphanGroup?.todos).toHaveLength(1);
      expect(orphanGroup?.todos[0].content).toBe("Orphan Task");
    });

    describe("Edge Cases and Special Scenarios", () => {
      it("should handle todos with partial grouping information", () => {
        // Add a todo with only date, no heading
        adapter.addItem({
          id: "6",
          type: ContentType.TODO,
          content: "Date only task",
          isCompleted: false,
          metadata: { sourceDate: "2024-03-20" },
        });

        // Add a todo with only heading, no date
        adapter.addItem({
          id: "7",
          type: ContentType.TODO,
          content: "Heading only task",
          isCompleted: false,
          heading: { id: "h1", content: "Section 1", level: 1 },
        });

        const groups = adapter.groupBy({ fields: ["date", "heading"] });

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
        const groups = adapter.groupBy({
          // @ts-ignore - Testing invalid field
          fields: ["invalid", "nonexistent"],
        });

        // Should create a single group with all todos
        expect(groups).toHaveLength(1);
        expect(groups[0].todos).toHaveLength(adapter.getItems().length);
        expect(groups[0].date).toBeUndefined();
        expect(groups[0].heading).toBeUndefined();
      });
    });
  });
});
