"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TodoNodeCreationStrategy_1 = require("../TodoNodeCreationStrategy");
const types_1 = require("../../../../domain/types");
const extension_task_item_1 = require("@tiptap/extension-task-item");
const extension_task_list_1 = require("@tiptap/extension-task-list");
describe("TodoNodeStrategy", () => {
    let strategy;
    beforeEach(() => {
        strategy = new TodoNodeCreationStrategy_1.TodoNodeCreationStrategy();
    });
    describe("canHandle", () => {
        it("should return true for TODO type content", () => {
            const todoItem = {
                id: "1",
                type: types_1.ContentType.TODO,
                content: "Test todo",
                isCompleted: false,
            };
            expect(strategy.canHandle(todoItem)).toBe(true);
        });
        it("should return false for non-TODO type content", () => {
            const noteItem = {
                id: "1",
                type: types_1.ContentType.NOTE,
                content: "Test note",
            };
            expect(strategy.canHandle(noteItem)).toBe(false);
        });
    });
    describe("createNode", () => {
        it("should create correct node structure for a todo item", () => {
            const todoItem = {
                id: "1",
                type: types_1.ContentType.TODO,
                content: "Test todo",
                isCompleted: true,
                metadata: { priority: "high" },
            };
            const expectedNode = {
                type: extension_task_list_1.TaskList.name,
                content: [
                    {
                        type: extension_task_item_1.TaskItem.name,
                        attrs: {
                            checked: true,
                            priority: "high",
                        },
                        content: [
                            {
                                type: "text",
                                text: "Test todo",
                            },
                        ],
                    },
                ],
            };
            expect(strategy.createNode(todoItem)).toEqual(expectedNode);
        });
        it("should handle todo item without metadata", () => {
            const todoItem = {
                id: "1",
                type: types_1.ContentType.TODO,
                content: "Test todo",
                isCompleted: false,
            };
            const node = strategy.createNode(todoItem);
            expect(node.type).toBe(extension_task_list_1.TaskList.name);
            expect(node.content[0].type).toBe(extension_task_item_1.TaskItem.name);
            expect(node.content[0].attrs.checked).toBe(false);
        });
    });
});
