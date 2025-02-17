import { JSONContent } from "@tiptap/core";
import { ContentItem } from "../../../domain/types";
import { NodeCreationStrategy } from "../../types";

export class DefaultNodeCreationStrategy implements NodeCreationStrategy {
  canHandle(item: ContentItem): boolean {
    return true; // Default strategy handles all content types
  }

  createNode(
    item: ContentItem
  ): Required<Pick<JSONContent, "type" | "content">> {
    return {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: item.content,
        },
      ],
    };
  }
}
