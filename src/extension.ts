import * as vscode from "vscode";
import * as path from "path";
import fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.batchViewer",
    async (uri: vscode.Uri, selectedFiles: vscode.Uri[]) => {
      if (!selectedFiles || selectedFiles.length === 0) {
        selectedFiles = await getSelectedFilesFromExplorer();
      }

      if (selectedFiles.length === 0) {
        vscode.window.showErrorMessage("Please select files first");
        return;
      }

      const content = await generateMdContent(selectedFiles);

      const virtualDoc = await vscode.workspace.openTextDocument({
        content: content,
        language: "markdown",
      });

      await vscode.window.showTextDocument(virtualDoc);
    }
  );

  context.subscriptions.push(disposable);
}

function generateTreeStructure(files: vscode.Uri[]): string {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(files[0]);
  if (!workspaceFolder) {
    return "";
  }

  // Create a tree structure object
  const tree: any = {};

  for (const file of files) {
    const relativePath = path.relative(workspaceFolder.uri.fsPath, file.fsPath);
    const parts = relativePath.split(path.sep);

    let current = tree;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    });

    // If this is a directory, add all its contents to the tree
    if (fs.statSync(file.fsPath).isDirectory()) {
      addDirectoryContents(file.fsPath, current, workspaceFolder.uri.fsPath);
    }
  }

  // Convert tree object to string representation
  function renderTree(node: any, prefix: string = "", isLast = true): string {
    const entries = Object.entries(node);
    if (entries.length === 0) {
      return "";
    }

    let result = "";
    entries.forEach(([key, value], index) => {
      const isLastItem = index === entries.length - 1;
      const connector = isLastItem ? "└── " : "├── ";
      const childPrefix = isLastItem ? "    " : "│   ";

      result += `${prefix}${connector}${key}\n`;
      result += renderTree(value, prefix + childPrefix, isLastItem);
    });
    return result;
  }

  // Helper function to recursively add directory contents to tree
  function addDirectoryContents(dirPath: string, node: any, rootPath: string) {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = path.relative(dirPath, fullPath);

      if (fs.statSync(fullPath).isDirectory()) {
        node[item] = {};
        addDirectoryContents(fullPath, node[item], rootPath);
      } else {
        node[item] = {};
      }
    }
  }

  // Get root folder name
  const rootFolder = path.basename(workspaceFolder.uri.fsPath);
  return `${rootFolder}\n${renderTree(tree)}`;
}

async function generateMdContent(files: vscode.Uri[]): Promise<string> {
  let content = "# File Structure\n\n```\n";

  // Add tree structure
  content += generateTreeStructure(files);
  content += "```\n\n---\n\n";

  // Add file contents
  for (const file of files) {
    const stat = await vscode.workspace.fs.stat(file);

    if ((stat.type & vscode.FileType.Directory) !== 0) {
      content += await processDirectory(file);
    } else {
      content += await processFile(file);
    }
  }

  return content;
}

// ... rest of the code remains the same (processFile, processDirectory, etc.)

async function getSelectedFilesFromExplorer(): Promise<vscode.Uri[]> {
  const files = await vscode.workspace.findFiles("**/*");
  // Get currently selected files in explorer
  return files.filter((file) => {
    // Implementation depends on VS Code API for getting selected files
    return true; // placeholder
  });
}

function getRelativePath(uri: vscode.Uri): string {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (workspaceFolder) {
    return path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
  }
  return uri.fsPath;
}

async function processFile(uri: vscode.Uri): Promise<string> {
  const fileName = path.basename(uri.fsPath);
  let content = `\n## ${fileName}\n\n`;

  try {
    const fileContent = await vscode.workspace.fs.readFile(uri);
    content += `\`\`\`\n${fileContent.toString()}\n\`\`\`\n\n`;
  } catch (error) {
    content += `Error reading file: ${error}\n\n`;
  }

  return content;
}

async function processDirectory(uri: vscode.Uri): Promise<string> {
  let content = "";
  const files = await vscode.workspace.fs.readDirectory(uri);

  for (const [name, type] of files) {
    const fullPath = vscode.Uri.joinPath(uri, name);
    if (type === vscode.FileType.Directory) {
      content += await processDirectory(fullPath);
    } else {
      content += await processFile(fullPath);
    }
  }

  return content;
}

export function deactivate() {}
