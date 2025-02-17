import { Todo } from "../../../domain/types";

export interface GroupedTodos {
  [key: string]: Todo[];
}

export interface FileContents {
  [key: string]: string | null;
}
