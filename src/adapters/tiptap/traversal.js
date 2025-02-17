"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiptapNodeTraversal = void 0;
const types_1 = require("../types");
class TiptapNodeTraversal {
    traverse(node, visitor) {
        if (!node)
            return;
        // First traverse the current node
        switch (node.type) {
            case "taskList":
                visitor.visitTaskList(types_1.TaskList);
                break;
            case "taskItem":
                visitor.visitTaskItem(node);
                break;
            case "text":
                visitor.visitText(node);
                break;
        }
        // Then traverse its children
        if (node.content) {
            node.content.forEach((child) => this.traverse(child, visitor));
        }
    }
}
exports.TiptapNodeTraversal = TiptapNodeTraversal;
