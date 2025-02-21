/**
 * This file contains the domain model of our documents
 */

export enum ContentType {
  TODO = "todo",
  NOTE = "note",
  CHECKLIST = "checklist",
  HEADING = "heading",
}

export interface ContentItem {
  id: string;
  content: string;
  type: ContentType;
  metadata?: Record<string, any>;
}

export interface Todo extends ContentItem {
  type: ContentType.TODO;
  isCompleted: boolean;
  metadata?: Record<string, any>;
  heading?: {
    id: string;
    content: string;
    level: number;
  };
}

export interface Note extends ContentItem {
  type: ContentType.NOTE;
}

export interface Heading extends ContentItem {
  type: ContentType.HEADING;
  level: number;
}
