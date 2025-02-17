import { JSONContent } from "@tiptap/core";

export interface ContentValidationResult {
  isValid: boolean;
  content: JSONContent | null;
}

export interface ContentValidator {
  validate(content: string | null): ContentValidationResult;
}

export class TiptapContentValidator implements ContentValidator {
  validate(content: string | null): ContentValidationResult {
    // Step 1: Validate raw content
    if (!this.validateContent(content)) {
      return this.createResult(false, null);
    }

    // Step 2: Parse content
    const parsedContent = this.parseContent(content);
    if (!parsedContent) {
      return this.createResult(false, null);
    }

    // Step 3: Validate Tiptap structure
    if (!this.validateTiptapStructure(parsedContent)) {
      return this.createResult(false, null);
    }

    return this.createResult(true, parsedContent as JSONContent);
  }

  private validateContent(content: string | null): content is string {
    return content !== null && content.trim().length > 0;
  }

  private validateTiptapStructure(content: unknown): content is JSONContent {
    return (
      content !== null &&
      typeof content === "object" &&
      "type" in content &&
      typeof content.type === "string"
    );
  }

  private parseContent(content: string): unknown {
    try {
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  private createResult(
    isValid: boolean,
    content: JSONContent | null
  ): ContentValidationResult {
    return { isValid, content };
  }
}
