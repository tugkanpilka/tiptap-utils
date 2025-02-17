"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TiptapContentAdapter_1 = require("../TiptapContentAdapter");
const BaseContentVisitor_1 = require("../visitors/BaseContentVisitor");
const types_1 = require("../../../domain/types");
const ContentValidator_1 = require("../validation/ContentValidator");
// Mock implementations
const mockEditor = {};
class MockVisitor extends BaseContentVisitor_1.BaseContentVisitor {
    constructor() {
        super(...arguments);
        this.visitTaskList = jest.fn();
        this.visitTaskItem = jest.fn();
        this.visitText = jest.fn();
    }
}
class MockTraversalStrategy {
    constructor() {
        this.traverse = jest.fn();
    }
}
class MockNodeStrategy {
    constructor() {
        this.canHandle = jest.fn().mockReturnValue(true);
        this.createNode = jest.fn().mockReturnValue({
            type: "taskList",
            content: [{ type: "taskItem" }],
        });
    }
}
describe("TiptapContentAdapter", () => {
    let adapter;
    let visitor;
    let traversalStrategy;
    let nodeStrategy;
    beforeEach(() => {
        visitor = new MockVisitor();
        traversalStrategy = new MockTraversalStrategy();
        nodeStrategy = new MockNodeStrategy();
        adapter = new TiptapContentAdapter_1.TiptapContentAdapter(traversalStrategy, visitor, [nodeStrategy], [], new ContentValidator_1.TiptapContentValidator());
    });
    describe("extract", () => {
        it("should use traversal strategy and visitor to extract content", () => {
            const content = { type: "doc", content: [] };
            const mockTodos = [
                {
                    id: "1",
                    type: types_1.ContentType.TODO,
                    content: "Test",
                    isCompleted: false,
                },
            ];
            jest.spyOn(visitor, "getItems").mockReturnValue(mockTodos);
            const result = adapter.extract(content);
            expect(traversalStrategy.traverse).toHaveBeenCalledWith(content, visitor);
            expect(result).toEqual(mockTodos);
        });
    });
    describe("create", () => {
        it("should create document with nodes using strategy", () => {
            const todos = [
                {
                    id: "1",
                    type: types_1.ContentType.TODO,
                    content: "Test todo",
                    isCompleted: false,
                },
            ];
            const result = adapter.create(todos);
            expect(nodeStrategy.canHandle).toHaveBeenCalledWith(todos[0]);
            expect(nodeStrategy.createNode).toHaveBeenCalledWith(todos[0]);
            expect(result).toEqual({
                type: "doc",
                content: [
                    {
                        type: "taskList",
                        content: [{ type: "taskItem" }],
                    },
                ],
            });
        });
        it("should use default strategy when no matching strategy found", () => {
            nodeStrategy.canHandle.mockReturnValue(false);
            const todos = [
                {
                    id: "1",
                    type: types_1.ContentType.TODO,
                    content: "Test todo",
                    isCompleted: false,
                },
            ];
            adapter.create(todos);
            expect(nodeStrategy.createNode).not.toHaveBeenCalled();
        });
    });
});
