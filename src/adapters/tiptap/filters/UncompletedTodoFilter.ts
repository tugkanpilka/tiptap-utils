import { ContentFilter } from "../../types";
import { Todo } from "../../../domain/types";

export class UncompletedTodoFilter implements ContentFilter<Todo> {
  filter(items: Todo[]): Todo[] {
    return items.filter((todo) => !todo.isCompleted);
  }
}
