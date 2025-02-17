"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoContentAdapter = void 0;
const TiptapContentAdapter_1 = require("../TiptapContentAdapter");
class TodoContentAdapter extends TiptapContentAdapter_1.TiptapContentAdapter {
    /**
     * Extracts todos from content after validation and parsing
     * @param content Raw content string
     * @returns Array of validated and extracted todos
     */
    validateAndExtract(content) {
        const validatedContent = this.validateContent(content);
        if (!validatedContent) {
            return [];
        }
        return this.extract(validatedContent);
    }
    /**
     * Groups todos by a key extractor function
     * @param todos Array of todos to group
     * @param keyExtractor Function to extract the group key from a todo
     * @returns Object with todos grouped by keys
     */
    group(todos, keyExtractor) {
        return todos.reduce((groups, todo) => {
            const key = keyExtractor(todo);
            return Object.assign(Object.assign({}, groups), { [key]: [...(groups[key] || []), todo] });
        }, {});
    }
    /**
     * Processes multiple file contents and extracts todos with source information
     * @param fileContents Object containing file contents mapped by their paths
     * @returns Array of todos with source information
     */
    processFiles(fileContents) {
        return Object.entries(fileContents)
            .filter(([_, content]) => content !== null)
            .flatMap(([date, content]) => {
            const todos = this.validateAndExtract(content);
            return this.addSourceInfo(todos, date);
        });
    }
    /**
     * Adds source information to todos
     * @param todos Array of todos to add source info to
     * @param sourcePath Source file path
     * @returns Array of todos with source information
     */
    addSourceInfo(todos, sourcePath) {
        const sourceDate = sourcePath.replace(".json", "");
        return todos.map((todo) => (Object.assign(Object.assign({}, todo), { metadata: Object.assign(Object.assign({}, todo.metadata), { sourceDate }) })));
    }
}
exports.TodoContentAdapter = TodoContentAdapter;
