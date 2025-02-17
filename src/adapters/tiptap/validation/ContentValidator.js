"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiptapContentValidator = void 0;
class TiptapContentValidator {
    validate(content) {
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
        return this.createResult(true, parsedContent);
    }
    validateContent(content) {
        return content !== null && content.trim().length > 0;
    }
    validateTiptapStructure(content) {
        return (content !== null &&
            typeof content === "object" &&
            "type" in content &&
            typeof content.type === "string");
    }
    parseContent(content) {
        try {
            return JSON.parse(content);
        }
        catch (error) {
            return null;
        }
    }
    createResult(isValid, content) {
        return { isValid, content };
    }
}
exports.TiptapContentValidator = TiptapContentValidator;
