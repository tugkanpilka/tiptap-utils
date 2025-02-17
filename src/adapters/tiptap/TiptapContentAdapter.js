"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiptapContentAdapter = void 0;
// Strategies
const DefaultNodeCreationStrategy_1 = require("./strategies/DefaultNodeCreationStrategy");
class TiptapContentAdapter {
    constructor(traversalStrategy, visitor, nodeStrategies = [], filters = [], validator) {
        this.traversalStrategy = traversalStrategy;
        this.visitor = visitor;
        this.nodeStrategies = nodeStrategies;
        this.filters = filters;
        this.validator = validator;
        this.defaultStrategy = new DefaultNodeCreationStrategy_1.DefaultNodeCreationStrategy();
    }
    extract(content) {
        this.traversalStrategy.traverse(content, this.visitor);
        let items = this.visitor.getItems();
        // Apply all filters in sequence
        for (const filter of this.filters) {
            items = filter.filter(items);
        }
        return items;
    }
    create(items) {
        return {
            type: "doc",
            content: items.map((item) => this.createNode(item)),
        };
    }
    /**
     * Validates and processes the content
     * @param content The content string to validate
     * @returns The validated content if valid, null if invalid
     */
    validateContent(content) {
        const result = this.validator.validate(content);
        return result.isValid ? result.content : null;
    }
    createNode(item) {
        const strategy = this.nodeStrategies.find((s) => s.canHandle(item)) ||
            this.defaultStrategy;
        return strategy.createNode(item);
    }
}
exports.TiptapContentAdapter = TiptapContentAdapter;
