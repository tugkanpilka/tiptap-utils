import { JSONContent } from "@tiptap/core";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TodoTraverser } from "../TodoTraverser";
import { BaseContentVisitor } from "../../visitors/BaseContentVisitor";
import { ContentItem } from "../../../../domain/types";

// Mock visitor for testing
class MockVisitor extends BaseContentVisitor<ContentItem> {
  visitTaskList = jest.fn();
  visitTaskItem = jest.fn();
  visitText = jest.fn();
}

describe("TodoTraverser", () => {
  let traverser: TodoTraverser;
  let visitor: MockVisitor;

  beforeEach(() => {
    traverser = new TodoTraverser();
    visitor = new MockVisitor();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should traverse a task list structure with correct node types", () => {
    const content: JSONContent = {
      type: TaskList.name,
      content: [
        {
          type: TaskItem.name,
          attrs: { checked: false },
          content: [
            {
              type: "text",
              text: "Task 1",
            },
          ],
        },
      ],
    };

    traverser.traverse(content, visitor);

    expect(visitor.visitTaskList).toHaveBeenCalledTimes(1);
    expect(visitor.visitTaskList).toHaveBeenCalledWith(content);
    expect(visitor.visitTaskItem).toHaveBeenCalledTimes(1);
    expect(visitor.visitTaskItem).toHaveBeenCalledWith(content.content![0]);
    expect(visitor.visitText).toHaveBeenCalledTimes(1);
    expect(visitor.visitText).toHaveBeenCalledWith(
      content.content![0].content![0]
    );
  });

  it("should handle multiple task items", () => {
    const content: JSONContent = {
      type: TaskList.name,
      content: [
        {
          type: TaskItem.name,
          attrs: { checked: false },
          content: [{ type: "text", text: "Task 1" }],
        },
        {
          type: TaskItem.name,
          attrs: { checked: true },
          content: [{ type: "text", text: "Task 2" }],
        },
      ],
    };

    traverser.traverse(content, visitor);

    expect(visitor.visitTaskList).toHaveBeenCalledTimes(1);
    expect(visitor.visitTaskItem).toHaveBeenCalledTimes(2);
    expect(visitor.visitText).toHaveBeenCalledTimes(2);
  });

  it("should handle task items without content", () => {
    const content: JSONContent = {
      type: TaskList.name,
      content: [
        {
          type: TaskItem.name,
          attrs: { checked: false },
        },
      ],
    };

    traverser.traverse(content, visitor);

    expect(visitor.visitTaskList).toHaveBeenCalledTimes(1);
    expect(visitor.visitTaskItem).toHaveBeenCalledTimes(1);
    expect(visitor.visitText).not.toHaveBeenCalled();
  });

  it("should handle unknown node types", () => {
    const content: JSONContent = {
      type: "unknown",
      content: [
        {
          type: "text",
          text: "Hello",
        },
      ],
    };

    traverser.traverse(content, visitor);

    expect(visitor.visitTaskList).not.toHaveBeenCalled();
    expect(visitor.visitTaskItem).not.toHaveBeenCalled();
    expect(visitor.visitText).toHaveBeenCalledTimes(1);
  });
});
