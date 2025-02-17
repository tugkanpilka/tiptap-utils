"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseContentVisitor = void 0;
class BaseContentVisitor {
    constructor() {
        this.items = [];
    }
    getItems() {
        return this.items;
    }
    reset() {
        this.items = [];
    }
}
exports.BaseContentVisitor = BaseContentVisitor;
