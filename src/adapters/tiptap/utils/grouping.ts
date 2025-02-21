import {
  GroupByField,
  GroupingOptions,
  TodoGroup,
} from "../../../domain/types";

/**
 * Generic grouping function that can work with any type of items and grouping strategies
 * @param items Items to group
 * @param options Grouping options including fields and strategies
 * @returns Array of groups
 */
export function groupItems<T, K extends GroupByField>(
  items: T[],
  options: GroupingOptions<T, K>
): TodoGroup[] {
  const { fields, strategies } = options;

  // If no items, return empty array
  if (!items.length) {
    return [];
  }

  // If no fields provided, return a single group with all items
  if (!fields.length) {
    return [
      {
        todos: items as any[],
      },
    ];
  }

  // Create a map to store unique groups
  const groupMap = new Map<string, T[]>();

  // Group items by generating composite keys
  items.forEach((item) => {
    const keyParts = fields.map((field) => {
      const strategy = strategies[field];
      if (!strategy) return "undefined";

      const groupKey = strategy.getGroupKey(item, field);
      return groupKey?.value || "undefined";
    });

    const key = keyParts.join("|");
    const group = groupMap.get(key) || [];
    group.push(item);
    groupMap.set(key, group);
  });

  // Convert grouped items to TodoGroups using strategies
  const groups = Array.from(groupMap.entries()).map(([key, groupItems]) => {
    // Create a base group
    let resultGroup: TodoGroup = {
      todos: groupItems as any[],
    };

    // Apply each strategy in order
    fields.forEach((field) => {
      const strategy = strategies[field];
      if (!strategy) return;

      const groupKey = strategy.getGroupKey(groupItems[0], field);
      if (!groupKey) return;

      const strategyGroup = strategy.createGroup(groupItems);
      resultGroup = {
        ...resultGroup,
        ...strategyGroup,
      };
    });

    return resultGroup;
  });

  // Sort groups using strategy comparators
  return groups.sort((a, b) => {
    for (const field of fields) {
      const strategy = strategies[field];
      if (!strategy) continue;

      const comparison = strategy.compareGroups(a, b);
      if (comparison !== 0) return comparison;
    }
    return 0;
  });
}
