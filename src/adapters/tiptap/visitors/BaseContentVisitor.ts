import { JSONContent } from "@tiptap/core";
import { TaskItem, TaskList, NodeVisitor } from "../../types";
import { ContentItem } from "../../../domain/types";

export abstract class BaseContentVisitor<T extends ContentItem = ContentItem>
  implements NodeVisitor
{
  protected items: T[] = [];

  abstract visitTaskList(node: typeof TaskList): void;
  abstract visitTaskItem(node: typeof TaskItem): void;
  abstract visitText(node: JSONContent): void;

  getItems(): T[] {
    return this.items;
  }

  protected reset(): void {
    this.items = [];
  }
}
