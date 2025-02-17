"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoVisitor = void 0;
const BaseContentVisitor_1 = require("./BaseContentVisitor");
const types_1 = require("../../../domain/types");
class TodoVisitor extends BaseContentVisitor_1.BaseContentVisitor {
    visitTaskList(node) {
        // Reset items when entering a new task list
        this.reset();
    }
    visitTaskItem(node) {
        const attrs = node.attrs || {};
        // Extract text from the nested structure
        let content = "";
        if (node.content && node.content.length > 0) {
            const paragraph = node.content[0];
            if (paragraph.type === "paragraph" &&
                paragraph.content &&
                paragraph.content.length > 0) {
                const textNode = paragraph.content[0];
                if (textNode.type === "text") {
                    content = textNode.text || "";
                }
            }
        }
        this.items.push({
            id: attrs.id || String(Math.random()),
            type: types_1.ContentType.TODO,
            content,
            isCompleted: attrs.checked || false,
            metadata: Object.assign({}, attrs),
        });
    }
    visitText(node) {
        // Text nodes don't create todo items
    }
}
exports.TodoVisitor = TodoVisitor;
