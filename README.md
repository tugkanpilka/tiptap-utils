# Tiptap Utils

A collection of utility functions and helpers for the Tiptap editor.

## Installation

```bash
npm install @tugkanpilka/tiptap-utils
# or
yarn add @tugkanpilka/tiptap-utils
# or
pnpm add @tugkanpilka/tiptap-utils
```

## Requirements

This package has the following peer dependencies:

- `@tiptap/core`: ^2.0.0
- `@tiptap/pm`: ^2.0.0
- `@tiptap/extension-task-item`: ^2.0.0
- `@tiptap/extension-task-list`: ^2.0.0
- `@tiptap/react`: ^2.0.0

## Usage

```typescript
import { 
  TiptapContentAdapter,
  TodoContentAdapter,
  DefaultNodeCreationStrategy,
  TodoNodeCreationStrategy,
  BaseContentVisitor,
  TodoVisitor,
  UncompletedTodoFilter,
  TiptapContentValidator
} from '@tugkanpilka/tiptap-utils';

// Create a content adapter
const adapter = new TiptapContentAdapter(
  traversalStrategy,
  visitor,
  [new TodoNodeCreationStrategy()],
  [new UncompletedTodoFilter()],
  new TiptapContentValidator()
);

// Extract content
const items = adapter.extract(tiptapContent);

// Create content
const content = adapter.create(items);
```

## Features

- Content Adapters for converting between Tiptap and domain models
- Node Creation Strategies for different content types
- Content Visitors for traversing Tiptap document structure
- Content Filters for filtering content items
- Content Validation for ensuring valid Tiptap JSON structure

## Documentation

Detailed documentation for each utility can be found in the [docs](./docs) directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

- Tuğkan Pilka (tugkanpilka@gmail.com) 