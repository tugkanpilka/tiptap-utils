"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TodoVisitor_1 = require("../TodoVisitor");
const extension_task_item_1 = require("@tiptap/extension-task-item");
const types_1 = require("../../../../domain/types");
describe("TodoVisitor", () => {
    let visitor;
    beforeEach(() => {
        visitor = new TodoVisitor_1.TodoVisitor();
    });
    describe("visitTaskItem", () => {
        it("should create todo item from task item node", () => {
            const node = {
                type: extension_task_item_1.TaskItem.name,
                attrs: {
                    id: "test-id",
                    checked: true,
                    priority: "high",
                },
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Test todo",
                            },
                        ],
                    },
                ],
            };
            visitor.visitTaskItem(node);
            const todos = visitor.getItems();
            expect(todos).toHaveLength(1);
            expect(todos[0]).toEqual({
                id: "test-id",
                type: types_1.ContentType.TODO,
                content: "Test todo",
                isCompleted: true,
                metadata: {
                    id: "test-id",
                    checked: true,
                    priority: "high",
                },
            });
        });
        it("should generate id if not provided", () => {
            const node = {
                type: extension_task_item_1.TaskItem.name,
                attrs: {
                    checked: false,
                },
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: "Test todo",
                            },
                        ],
                    },
                ],
            };
            visitor.visitTaskItem(node);
            const todos = visitor.getItems();
            expect(todos[0].id).toBeDefined();
            expect(typeof todos[0].id).toBe("string");
        });
    });
    describe("visitTaskList and visitText", () => {
        it("should not create todos for task list container", () => {
            visitor.visitTaskList({});
            expect(visitor.getItems()).toHaveLength(0);
        });
        it("should not create todos for text nodes", () => {
            visitor.visitText({ text: "Test" });
            expect(visitor.getItems()).toHaveLength(0);
        });
    });
});
