import { TiptapContentValidator } from "../ContentValidator";

describe("TiptapContentValidator", () => {
  let validator: TiptapContentValidator;

  beforeEach(() => {
    validator = new TiptapContentValidator();
  });

  describe("validate", () => {
    it("should return invalid result for null content", () => {
      const result = validator.validate(null);
      expect(result.isValid).toBe(false);
      expect(result.content).toBeNull();
    });

    it("should return invalid result for empty content", () => {
      const result = validator.validate("");
      expect(result.isValid).toBe(false);
      expect(result.content).toBeNull();
    });

    it("should return invalid result for whitespace content", () => {
      const result = validator.validate("   ");
      expect(result.isValid).toBe(false);
      expect(result.content).toBeNull();
    });

    it("should return invalid result for invalid JSON", () => {
      const result = validator.validate("{invalid json}");
      expect(result.isValid).toBe(false);
      expect(result.content).toBeNull();
    });

    it("should return invalid result for JSON without type", () => {
      const result = validator.validate('{"content": "test"}');
      expect(result.isValid).toBe(false);
      expect(result.content).toBeNull();
    });

    it("should return invalid result for JSON with non-string type", () => {
      const result = validator.validate('{"type": 123, "content": "test"}');
      expect(result.isValid).toBe(false);
      expect(result.content).toBeNull();
    });

    it("should return valid result for valid Tiptap JSON content", () => {
      const validContent = JSON.stringify({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello World" }],
          },
        ],
      });

      const result = validator.validate(validContent);
      expect(result.isValid).toBe(true);
      expect(result.content).toEqual({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello World" }],
          },
        ],
      });
    });

    it("should return valid result for minimal valid Tiptap JSON content", () => {
      const validContent = JSON.stringify({
        type: "doc",
      });

      const result = validator.validate(validContent);
      expect(result.isValid).toBe(true);
      expect(result.content).toEqual({
        type: "doc",
      });
    });
  });
});
