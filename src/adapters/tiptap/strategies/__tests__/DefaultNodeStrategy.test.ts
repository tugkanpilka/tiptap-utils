import { DefaultNodeCreationStrategy } from "../DefaultNodeCreationStrategy";
import { ContentType } from "../../../../domain/types";

describe("DefaultNodeCreationStrategy", () => {
  let strategy: DefaultNodeCreationStrategy;

  beforeEach(() => {
    strategy = new DefaultNodeCreationStrategy();
  });

  describe("canHandle", () => {
    it("should return true for any content type", () => {
      const items = [
        { id: "1", type: ContentType.NOTE, content: "Test note" },
        { id: "2", type: ContentType.TODO, content: "Test todo" },
        { id: "3", type: ContentType.CHECKLIST, content: "Test checklist" },
      ];

      items.forEach((item) => {
        expect(strategy.canHandle(item)).toBe(true);
      });
    });
  });

  describe("createNode", () => {
    it("should create paragraph node with text content", () => {
      const item = {
        id: "1",
        type: ContentType.NOTE,
        content: "Test content",
      };

      const expectedNode = {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Test content",
          },
        ],
      };

      expect(strategy.createNode(item)).toEqual(expectedNode);
    });

    it("should handle content with metadata", () => {
      const item = {
        id: "1",
        type: ContentType.NOTE,
        content: "Test content",
        metadata: { color: "red" },
      };

      const node = strategy.createNode(item);
      expect(node.type).toBe("paragraph");
      expect(node.content).toBeDefined();
      expect(Array.isArray(node.content)).toBe(true);
      expect(node.content.length).toBeGreaterThan(0);
      expect(node.content[0].type).toBe("text");
      expect(node.content[0].text).toBe("Test content");
    });
  });
});
