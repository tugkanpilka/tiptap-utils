import { TiptapContentAdapter } from "../TiptapContentAdapter";
import {
  Todo,
  TodoGroup,
  TodoGroupOptions,
  GroupByField,
} from "../../../domain/types";
import { GroupedTodos, FileContents } from "./types";
import { DateGroupingStrategy } from "../strategies/grouping/DateGroupingStrategy";
import { HeadingGroupingStrategy } from "../strategies/grouping/HeadingGroupingStrategy";
import { groupItems } from "../utils/grouping";
import {
  NodeTraversalStrategy,
  ContentFilter,
  NodeCreationStrategy,
} from "../../types";
import { TodoTraverser } from "../traversers/TodoTraverser";
import { TodoVisitor } from "../visitors/TodoVisitor";
import {
  ContentValidator,
  TiptapContentValidator,
} from "../validation/ContentValidator";
import { DefaultNodeCreationStrategy } from "../strategies/DefaultNodeCreationStrategy";

export class TodoContentAdapter extends TiptapContentAdapter<Todo> {
  protected items: Todo[] = [];

  constructor(
    traverser: TodoTraverser = new TodoTraverser(),
    visitor: TodoVisitor = new TodoVisitor(),
    nodeStrategies: NodeCreationStrategy[] = [
      new DefaultNodeCreationStrategy(),
    ],
    filters: ContentFilter<Todo>[] = [],
    validator: ContentValidator = new TiptapContentValidator()
  ) {
    super(traverser, visitor, nodeStrategies, filters, validator);
  }

  // Initialize strategies
  private readonly groupingStrategies = {
    date: new DateGroupingStrategy(),
    heading: new HeadingGroupingStrategy(),
  };

  /**
   * Adds a todo item to the adapter's items list
   * @param todo The todo item to add
   */
  addItem(todo: Todo): void {
    this.items.push(todo);
  }

  /**
   * Gets all todo items
   * @returns Array of todos
   */
  getItems(): Todo[] {
    return this.items;
  }

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
   * Groups todos by specified fields (date and/or heading)
   * @param options Grouping options containing fields to group by
   * @returns Array of todo groups
   */
  groupBy(options: TodoGroupOptions): TodoGroup[] {
    return groupItems(this.items, {
      fields: options.fields,
      strategies: this.groupingStrategies,
    });
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
    const todos = Object.entries(fileContents)
      .filter(([_, content]) => content !== null)
      .flatMap(([date, content]) => {
        const todos = this.validateAndExtract(content);
        return this.addSourceInfo(todos, date);
      });

    // Update the items array
    this.items = todos;
    return todos;
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
