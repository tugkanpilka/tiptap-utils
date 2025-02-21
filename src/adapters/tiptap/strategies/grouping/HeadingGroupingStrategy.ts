import {
  GroupingStrategy,
  GroupKey,
  Todo,
  TodoGroup,
  GroupByField,
} from "../../../../domain/types";

export class HeadingGroupingStrategy
  implements GroupingStrategy<Todo, "heading">
{
  getGroupKey(todo: Todo, field: GroupByField): GroupKey | null {
    if (field !== "heading") return null;
    if (!todo.heading) return null;

    return {
      value: `${todo.heading.id}-${todo.heading.level}`,
      sortValue: todo.heading.level,
    };
  }

  createGroup(todos: Todo[]): TodoGroup {
    const firstTodo = todos[0];
    return {
      heading: firstTodo.heading
        ? {
            id: firstTodo.heading.id,
            content: firstTodo.heading.content,
            level: firstTodo.heading.level,
          }
        : undefined,
      todos,
    };
  }

  compareGroups(a: TodoGroup, b: TodoGroup): number {
    if (!a.heading && !b.heading) return 0;
    if (!a.heading) return 1;
    if (!b.heading) return -1;

    const levelComparison = a.heading.level - b.heading.level;
    if (levelComparison !== 0) return levelComparison;

    return a.heading.content.localeCompare(b.heading.content);
  }
}
