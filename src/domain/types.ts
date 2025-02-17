/**
 * This file contains the domain model of our documents
 */

export interface ContentItem {
  id: string;
  content: string;
  type: ContentType;
  metadata?: Record<string, any>;
}

export enum ContentType {
  TODO = "todo",
  NOTE = "note",
  CHECKLIST = "checklist",
}

export interface Todo extends ContentItem {
  type: ContentType.TODO;
  isCompleted: boolean;
}
