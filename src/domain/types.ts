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

export type GroupByField = "date" | "heading";

export interface GroupKey {
  value: string;
  sortValue: string | number;
}

export interface GroupingStrategy<T, K extends GroupByField> {
  getGroupKey(item: T, field: K): GroupKey | null;
  createGroup(items: T[]): TodoGroup;
  compareGroups(a: TodoGroup, b: TodoGroup): number;
}

export interface GroupingOptions<T, K extends GroupByField> {
  fields: K[];
  strategies: Record<K, GroupingStrategy<T, K>>;
}

export interface TodoGroup {
  date?: string;
  heading?: {
    id: string;
    content: string;
    level: number;
  };
  todos: Todo[];
}

export interface TodoGroupOptions {
  fields: GroupByField[];
}
