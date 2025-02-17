import { JSONContent } from "@tiptap/core";
import { BaseContentTraverser } from "../BaseContentTraverser";
import { BaseContentVisitor } from "../../visitors/BaseContentVisitor";
import { ContentItem } from "../../../../domain/types";

// Mock visitor for testing
class MockVisitor extends BaseContentVisitor<ContentItem> {
  visitTaskList = jest.fn();
  visitTaskItem = jest.fn();
  visitText = jest.fn();
}

describe("BaseContentTraverser", () => {
  let traverser: BaseContentTraverser;
  let visitor: MockVisitor;

  beforeEach(() => {
    traverser = new BaseContentTraverser();
    visitor = new MockVisitor();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should traverse a simple text node", () => {
    const content: JSONContent = {
      type: "text",
      text: "Hello World",
    };

    traverser.traverse(content, visitor);

    expect(visitor.visitText).toHaveBeenCalledTimes(1);
    expect(visitor.visitText).toHaveBeenCalledWith(content);
    expect(visitor.visitTaskList).not.toHaveBeenCalled();
    expect(visitor.visitTaskItem).not.toHaveBeenCalled();
  });

  it("should traverse a task list structure", () => {
    const content: JSONContent = {
      type: "taskList",
      content: [
        {
          type: "taskItem",
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

  it("should handle nodes without content", () => {
    const content: JSONContent = {
      type: "taskList",
    };

    traverser.traverse(content, visitor);

    expect(visitor.visitTaskList).toHaveBeenCalledTimes(1);
    expect(visitor.visitTaskList).toHaveBeenCalledWith(content);
    expect(visitor.visitTaskItem).not.toHaveBeenCalled();
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
    expect(visitor.visitText).toHaveBeenCalledWith(content.content![0]);
  });
});
