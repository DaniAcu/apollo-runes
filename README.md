# Svelte Apollo Workspace

This workspace contains the Svelte Apollo library and its documentation.

## Packages

- **`packages/svelte-apollo`** - The main Svelte Apollo library
- **`packages/docs`** - VitePress documentation site

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install all dependencies
pnpm install

# Or install dependencies for all packages
pnpm install:all
```

### Development

```bash
# Start the documentation site in development mode
pnpm dev

# Build the library
pnpm build:lib

# Build the documentation
pnpm build:docs

# Build everything
pnpm build
```

### Testing

```bash
# Run tests for the library
pnpm test

# Run tests with coverage
pnpm test:coverage
```

### Linting

```bash
# Lint the library
pnpm lint

# Type check the library
pnpm type-check
```

## Workspace Scripts

- `pnpm dev` - Start docs development server
- `pnpm build` - Build both library and docs
- `pnpm build:lib` - Build only the library
- `pnpm build:docs` - Build only the documentation
- `pnpm preview:docs` - Preview built documentation
- `pnpm test` - Run library tests
- `pnpm lint` - Lint library code
- `pnpm type-check` - Type check library
- `pnpm clean` - Clean all build artifacts
- `pnpm install:all` - Install dependencies for all packages

## Package Structure

```
packages/
├── svelte-apollo/          # Main library
│   ├── src/               # Source code
│   ├── package.json       # Library package.json
│   └── ...                # Library config files
└── docs/                  # Documentation site
    ├── .vitepress/        # VitePress config
    ├── guide/             # Documentation pages
    ├── api/               # API reference
    └── package.json       # Docs package.json
```

## Contributing

1. Make changes to the library in `packages/svelte-apollo/`
2. Update documentation in `packages/docs/`
3. Test your changes: `pnpm test`
4. Build everything: `pnpm build`
5. Preview docs: `pnpm preview:docs`