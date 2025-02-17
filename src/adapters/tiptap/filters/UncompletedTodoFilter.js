"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UncompletedTodoFilter = void 0;
class UncompletedTodoFilter {
    filter(items) {
        return items.filter((todo) => !todo.isCompleted);
    }
}
exports.UncompletedTodoFilter = UncompletedTodoFilter;
