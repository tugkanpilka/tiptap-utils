"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoNodeCreationStrategy = void 0;
const types_1 = require("../../../domain/types");
const types_2 = require("../../types");
class TodoNodeCreationStrategy {
    canHandle(item) {
        return item.type === types_1.ContentType.TODO;
    }
    createNode(item) {
        const todoItem = item;
        return {
            type: types_2.TaskList.name,
            content: [
                {
                    type: types_2.TaskItem.name,
                    attrs: Object.assign({ checked: todoItem.isCompleted }, todoItem.metadata),
                    content: [
                        {
                            type: "text",
                            text: todoItem.content,
                        },
                    ],
                },
            ],
        };
    }
}
exports.TodoNodeCreationStrategy = TodoNodeCreationStrategy;
