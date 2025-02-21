import {
  GroupingStrategy,
  GroupKey,
  Todo,
  TodoGroup,
  GroupByField,
} from "../../../../domain/types";

export class DateGroupingStrategy implements GroupingStrategy<Todo, "date"> {
  getGroupKey(todo: Todo, field: GroupByField): GroupKey | null {
    if (field !== "date") return null;

    const sourceDate = todo.metadata?.sourceDate;
    if (!sourceDate) return null;

    return {
      value: sourceDate,
      sortValue: sourceDate,
    };
  }

  createGroup(todos: Todo[]): TodoGroup {
    const firstTodo = todos[0];
    return {
      date: firstTodo.metadata?.sourceDate,
      todos,
    };
  }

  compareGroups(a: TodoGroup, b: TodoGroup): number {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  }
}
