// Libraries
import { JSONContent } from "@tiptap/core";

// Types
import type {
  ContentAdapter,
  NodeTraversalStrategy,
  NodeCreationStrategy,
  ContentFilter,
} from "../types";
import type { ContentItem } from "../../domain/types";
import type { ContentValidator } from "./validation/ContentValidator";

// Visitors
import { BaseContentVisitor } from "./visitors/BaseContentVisitor";

// Strategies
import { DefaultNodeCreationStrategy } from "./strategies/DefaultNodeCreationStrategy";

export class TiptapContentAdapter<T extends ContentItem = ContentItem>
  implements ContentAdapter<JSONContent, T>
{
  private readonly defaultStrategy: NodeCreationStrategy =
    new DefaultNodeCreationStrategy();

  constructor(
    private traversalStrategy: NodeTraversalStrategy,
    private visitor: BaseContentVisitor<T>,
    private nodeStrategies: NodeCreationStrategy[] = [],
    private filters: ContentFilter<T>[] = [],
    private validator: ContentValidator
  ) {}

  extract(content: JSONContent): T[] {
    this.traversalStrategy.traverse(content, this.visitor);
    let items = this.visitor.getItems();

    // Apply all filters in sequence
    for (const filter of this.filters) {
      items = filter.filter(items);
    }

    return items;
  }

  create(items: T[]): JSONContent {
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
  protected validateContent(content: string | null): JSONContent | null {
    const result = this.validator.validate(content);
    return result.isValid ? result.content : null;
  }

  private createNode(item: ContentItem): JSONContent {
    const strategy =
      this.nodeStrategies.find((s) => s.canHandle(item)) ||
      this.defaultStrategy;
    return strategy.createNode(item);
  }
}
