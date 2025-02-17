import { TiptapContentAdapter } from "../TiptapContentAdapter";
import { Todo } from "../../../domain/types";
import { GroupedTodos, FileContents } from "./types";

export class TodoContentAdapter extends TiptapContentAdapter<Todo> {
  /**
   * Extracts todos from content after validation and parsing
   * @param content Raw content string
   * @returns Array of validated and extracted todos
   */
  validateAndExtract(content: string | null): Todo[] {
    const validatedContent = this.validateContent(content);
    if (!validatedContent) {
      return [];
    }

    return this.extract(validatedContent);
  }

  /**
   * Groups todos by a key extractor function
   * @param todos Array of todos to group
   * @param keyExtractor Function to extract the group key from a todo
   * @returns Object with todos grouped by keys
   */
  group(todos: Todo[], keyExtractor: (todo: Todo) => string): GroupedTodos {
    return todos.reduce((groups, todo) => {
      const key = keyExtractor(todo);
      return {
        ...groups,
        [key]: [...(groups[key] || []), todo],
      };
    }, {} as GroupedTodos);
  }

  /**
   * Processes multiple file contents and extracts todos with source information
   * @param fileContents Object containing file contents mapped by their paths
   * @returns Array of todos with source information
   */
  processFiles(fileContents: FileContents): Todo[] {
    return Object.entries(fileContents)
      .filter(([_, content]) => content !== null)
      .flatMap(([date, content]) => {
        const todos = this.validateAndExtract(content);
        return this.addSourceInfo(todos, date);
      });
  }

  /**
   * Adds source information to todos
   * @param todos Array of todos to add source info to
   * @param sourcePath Source file path
   * @returns Array of todos with source information
   */
  private addSourceInfo(todos: Todo[], sourcePath: string): Todo[] {
    const sourceDate = sourcePath.replace(".json", "");
    return todos.map((todo) => ({
      ...todo,
      metadata: {
        ...todo.metadata,
        sourceDate,
      },
    }));
  }
}
