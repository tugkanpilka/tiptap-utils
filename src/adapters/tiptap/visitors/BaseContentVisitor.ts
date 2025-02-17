import { JSONContent } from "@tiptap/core";
import { ContentItem } from "../../../domain/types";
import { NodeVisitor } from "../../types";

export abstract class BaseContentVisitor<T extends ContentItem>
  implements NodeVisitor
{
  protected items: T[] = [];

  visitTaskList(node: JSONContent): void {
    // Base implementation does nothing
  }

  visitTaskItem(node: JSONContent): void {
    // Base implementation does nothing
  }

  visitText(node: JSONContent): void {
    // Base implementation does nothing
  }

  getItems(): T[] {
    return this.items;
  }

  clearItems(): void {
    this.items = [];
  }
}
