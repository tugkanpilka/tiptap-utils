import { JSONContent } from "@tiptap/core";
import { TiptapContentAdapter } from "../TiptapContentAdapter";
import { BaseContentVisitor } from "../visitors/BaseContentVisitor";
import {
  NodeTraversalStrategy,
  ContentFilter,
  NodeCreationStrategy,
} from "../../types";
import { ContentItem, ContentType } from "../../../domain/types";
import {
  ContentValidator,
  ContentValidationResult,
} from "../validation/ContentValidator";

// Mock implementations
class MockVisitor extends BaseContentVisitor<ContentItem> {
  protected items: ContentItem[] = [];

  visitTaskList(node: JSONContent): void {
    // Mock implementation
  }

  visitTaskItem(node: JSONContent): void {
    // Mock implementation
  }

  visitText(node: JSONContent): void {
    this.items.push({
      id: "1",
      type: ContentType.NOTE,
      content: node.text || "",
    });
  }

  getItems(): ContentItem[] {
    return this.items;
  }
}

class MockTraversalStrategy implements NodeTraversalStrategy {
  traverse(
    content: JSONContent,
    visitor: BaseContentVisitor<ContentItem>
  ): void {
    if (content.content) {
      content.content.forEach((node) => {
        if (node.type === "text") {
          visitor.visitText(node);
        }
      });
    }
  }
}

class MockFilter implements ContentFilter<ContentItem> {
  filter(items: ContentItem[]): ContentItem[] {
    return items.filter((item) => item.content.length > 0);
  }
}

class MockNodeStrategy implements NodeCreationStrategy {
  canHandle(item: ContentItem): boolean {
    return item.type === ContentType.NOTE;
  }

  createNode(
    item: ContentItem
  ): Required<Pick<JSONContent, "type" | "content">> {
    return {
      type: "paragraph",
      content: [{ type: "text", text: item.content }],
    };
  }
}

class MockValidator implements ContentValidator {
  validate(content: string | null): ContentValidationResult {
    if (!content) {
      return { isValid: false, content: null };
    }
    try {
      const parsed = JSON.parse(content);
      return { isValid: true, content: parsed };
    } catch {
      return { isValid: false, content: null };
    }
  }
}

describe("TiptapContentAdapter", () => {
  let adapter: TiptapContentAdapter;
  let visitor: MockVisitor;
  let traversalStrategy: MockTraversalStrategy;
  let filter: MockFilter;
  let nodeStrategy: MockNodeStrategy;
  let validator: MockValidator;

  beforeEach(() => {
    visitor = new MockVisitor();
    traversalStrategy = new MockTraversalStrategy();
    filter = new MockFilter();
    nodeStrategy = new MockNodeStrategy();
    validator = new MockValidator();
    adapter = new TiptapContentAdapter(
      traversalStrategy,
      visitor,
      [nodeStrategy],
      [filter],
      validator
    );
  });

  describe("extract", () => {
    it("should extract content items from JSONContent", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "text",
            text: "Hello World",
          },
        ],
      };

      const items = adapter.extract(content);
      expect(items).toHaveLength(1);
      expect(items[0].content).toBe("Hello World");
    });

    it("should apply filters to extracted items", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "text",
            text: "",
          },
          {
            type: "text",
            text: "Hello World",
          },
        ],
      };

      const items = adapter.extract(content);
      expect(items).toHaveLength(1);
      expect(items[0].content).toBe("Hello World");
    });
  });

  describe("create", () => {
    it("should create JSONContent from content items", () => {
      const items: ContentItem[] = [
        {
          id: "1",
          type: ContentType.NOTE,
          content: "Hello World",
        },
      ];

      const content = adapter.create(items);
      expect(content.type).toBe("doc");
      expect(content.content).toHaveLength(1);
      expect(content.content![0].type).toBe("paragraph");
      expect(content.content![0].content![0].text).toBe("Hello World");
    });

    it("should use custom node strategy when available", () => {
      const items: ContentItem[] = [
        {
          id: "1",
          type: ContentType.NOTE,
          content: "Custom Content",
        },
      ];

      const content = adapter.create(items);
      expect(content.type).toBe("doc");
      expect(content.content).toHaveLength(1);
      expect(content.content![0].type).toBe("paragraph");
      expect(content.content![0].content![0].text).toBe("Custom Content");
    });
  });

  describe("validateContent", () => {
    it("should return null for invalid content", () => {
      const result = (adapter as any).validateContent(null);
      expect(result).toBeNull();
    });

    it("should return parsed content for valid JSON", () => {
      const validContent = JSON.stringify({
        type: "doc",
        content: [],
      });

      const result = (adapter as any).validateContent(validContent);
      expect(result).toEqual({
        type: "doc",
        content: [],
      });
    });
  });
});
