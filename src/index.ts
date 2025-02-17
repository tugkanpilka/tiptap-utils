// Export types
export * from "./domain/types";
export * from "./adapters/types";
export {
  type GroupedTodos,
  type FileContents,
} from "./adapters/tiptap/adapters/types";

// Export adapters
export { TiptapContentAdapter } from "./adapters/tiptap/TiptapContentAdapter";
export { TodoContentAdapter } from "./adapters/tiptap/adapters/TodoContentAdapter";

// Export strategies
export { DefaultNodeCreationStrategy } from "./adapters/tiptap/strategies/DefaultNodeCreationStrategy";
export { TodoNodeCreationStrategy } from "./adapters/tiptap/strategies/TodoNodeCreationStrategy";

// Export visitors
export { BaseContentVisitor } from "./adapters/tiptap/visitors/BaseContentVisitor";
export { TodoVisitor } from "./adapters/tiptap/visitors/TodoVisitor";

// Export traversers
export { BaseContentTraverser } from "./adapters/tiptap/traversers/BaseContentTraverser";
export { TodoTraverser } from "./adapters/tiptap/traversers/TodoTraverser";

// Export filters
export { UncompletedTodoFilter } from "./adapters/tiptap/filters/UncompletedTodoFilter";

// Export validators
export {
  TiptapContentValidator,
  type ContentValidationResult,
} from "./adapters/tiptap/validation/ContentValidator";
