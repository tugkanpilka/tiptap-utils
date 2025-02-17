"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultNodeCreationStrategy_1 = require("../DefaultNodeCreationStrategy");
const types_1 = require("../../../../domain/types");
describe("DefaultNodeCreationStrategy", () => {
    let strategy;
    beforeEach(() => {
        strategy = new DefaultNodeCreationStrategy_1.DefaultNodeCreationStrategy();
    });
    describe("canHandle", () => {
        it("should return true for any content type", () => {
            const items = [
                { id: "1", type: types_1.ContentType.NOTE, content: "Test note" },
                { id: "2", type: types_1.ContentType.TODO, content: "Test todo" },
                { id: "3", type: types_1.ContentType.CHECKLIST, content: "Test checklist" },
            ];
            items.forEach((item) => {
                expect(strategy.canHandle(item)).toBe(true);
            });
        });
    });
    describe("createNode", () => {
        it("should create paragraph node with text content", () => {
            const item = {
                id: "1",
                type: types_1.ContentType.NOTE,
                content: "Test content",
            };
            const expectedNode = {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Test content",
                    },
                ],
            };
            expect(strategy.createNode(item)).toEqual(expectedNode);
        });
        it("should handle content with metadata", () => {
            const item = {
                id: "1",
                type: types_1.ContentType.NOTE,
                content: "Test content",
                metadata: { color: "red" },
            };
            const node = strategy.createNode(item);
            expect(node.type).toBe("paragraph");
            expect(node.content[0].type).toBe("text");
            expect(node.content[0].text).toBe("Test content");
        });
    });
});
