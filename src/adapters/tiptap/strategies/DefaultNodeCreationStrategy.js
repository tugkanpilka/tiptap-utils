"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultNodeCreationStrategy = void 0;
class DefaultNodeCreationStrategy {
    canHandle(item) {
        return true; // Default strategy handles all content types
    }
    createNode(item) {
        return {
            type: "paragraph",
            content: [
                {
                    type: "text",
                    text: item.content,
                },
            ],
        };
    }
}
exports.DefaultNodeCreationStrategy = DefaultNodeCreationStrategy;
