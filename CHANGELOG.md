# Batch Viewer for VS Code

A Visual Studio Code extension that allows you to merge multiple files into a single virtual Markdown document, complete with directory structure visualization.

## Features

- Merge multiple files into a single preview
- Generate ASCII tree structure of selected files and folders
- Include full folder contents in structure when a folder is selected
- Results displayed in a virtual Markdown document
- Code syntax highlighting in the merged view
- Non-destructive (creates virtual file only)

## Usage

1. Select multiple files and/or folders in VS Code's explorer
2. Right-click on the selection
3. Choose "Batch View Files" from the context menu
4. A new virtual markdown document will open containing:
   - ASCII tree structure of selected items
   - Contents of all selected files, with filenames as headers

### Example

If you have this structure:

```
project/
├── src/
│   ├── components/
│   │   └── Button.tsx
│   └── app.ts
└── config.json
```

And you select `src` folder and `config.json`, you'll get a virtual markdown document with:

- Complete folder structure visualization
- Content of all files organized with headers

## Extension Settings

This extension contributes the following commands:

- `extension.batchViewer`: Merge selected files into virtual markdown document

## Known Issues

- Currently does not handle binary files
- Large files or many files at once may impact performance

## Release Notes

### 1.0.0

Initial release of Batch Viewer

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
