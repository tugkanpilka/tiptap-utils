import { JSONContent } from "@tiptap/core";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { ContentItem } from "../domain/types";

// Base Content Adapter Types
export interface ContentAdapter<
  TEditorContent,
  TContentItem extends ContentItem = ContentItem,
> {
  extract(content: TEditorContent): TContentItem[];
  create(items: TContentItem[]): TEditorContent;
}

// Content Filter Types
export interface ContentFilter<T extends ContentItem> {
  filter(items: T[]): T[];
}

export interface ContentExtractor<T extends ContentItem> {
  extractFromMultiple(contents: Record<string, string | null>): T[];
}

// Tiptap Specific Types
export interface NodeVisitor {
  visitTaskList(node: JSONContent): void;
  visitTaskItem(node: JSONContent): void;
  visitText(node: JSONContent): void;
}

export interface NodeTraversalStrategy {
  traverse(content: JSONContent, visitor: NodeVisitor): void;
}

export interface NodeCreationStrategy {
  canHandle(item: ContentItem): boolean;
  createNode(
    item: ContentItem
  ): Required<Pick<JSONContent, "type" | "content">>;
}

export interface ContentVisitor {
  visit(node: JSONContent): ContentItem[];
}

export interface ContentValidator {
  validate(content: JSONContent): boolean;
}

// Re-export Tiptap's node types for convenience
export { TaskItem, TaskList };
