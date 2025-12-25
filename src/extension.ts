import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let config: any;

export function activate(context: vscode.ExtensionContext) {
    // Load config
    loadConfig(context);

    // Register completion provider for gametemplate
    const templateProvider = vscode.languages.registerCompletionItemProvider(
        ['json', 'javascript', 'typescript'],
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const linePrefix = document.lineAt(position).text.substring(0, position.character);
                
                if (/gametemplate$/i.test(linePrefix)) {
                    const completionItem = new vscode.CompletionItem('gametemplate', vscode.CompletionItemKind.Snippet);
                    completionItem.insertText = new vscode.SnippetString(generateTemplateSnippet());
                    completionItem.documentation = new vscode.MarkdownString('Insert game template');
                    
                    const match = linePrefix.match(/gametemplate$/i);
                    if (match) {
                        const startPos = position.character - match[0].length;
                        completionItem.range = new vscode.Range(
                            position.line,
                            startPos,
                            position.line,
                            position.character
                        );
                    }
                    
                    return [completionItem];
                }

                return undefined;
            }
        },
        'g', 'a', 'm', 'e', 't', 'e', 'm', 'p', 'l', 'a', 't', 'e'
    );

    // Register completion providers for property values
    const propertyProvider = vscode.languages.registerCompletionItemProvider(
        ['json', 'javascript', 'typescript'],
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const line = document.lineAt(position).text;
                const linePrefix = line.substring(0, position.character);
                
                // Check for properties that should have suggestions
                const propertyMatch = linePrefix.match(/"(rating|tags|features)":\s*\[/);
                
                if (propertyMatch) {
                    const property = propertyMatch[1];
                    
                    if (property === 'rating') {
                        return getSuggestionsForProperty('rating');
                    } else if (property === 'tags' || property === 'features') {
                        return getSuggestionsForProperty(property);
                    }
                }
                
                // Check if we're on a line with "tags" or "features" property
                const currentLine = document.lineAt(position.line).text;
                if (/"tags":\s*\[/.test(currentLine) || /"features":\s*\[/.test(currentLine)) {
                    const property = /"tags"/.test(currentLine) ? 'tags' : 'features';
                    return getSuggestionsForProperty(property);
                }
                
                // Check if we're continuing to type in an array on subsequent lines
                for (let i = position.line; i >= 0; i--) {
                    const checkLine = document.lineAt(i).text;
                    
                    // If we hit a closing bracket, stop
                    if (/\]/.test(checkLine) && i < position.line) {
                        break;
                    }
                    
                    // Check if this line has tags or features array opening
                    const arrayMatch = checkLine.match(/"(tags|features)":\s*\[/);
                    if (arrayMatch) {
                        const property = arrayMatch[1];
                        
                        // Make sure we haven't closed this array yet
                        let openBrackets = 0;
                        for (let j = i; j <= position.line; j++) {
                            const scanLine = document.lineAt(j).text;
                            openBrackets += (scanLine.match(/\[/g) || []).length;
                            openBrackets -= (scanLine.match(/\]/g) || []).length;
                        }
                        
                        if (openBrackets > 0) {
                            return getSuggestionsForProperty(property);
                        }
                        break;
                    }
                }

                return undefined;
            }
        },
        '"', ',', '[', ' ' // Trigger on quotes, commas, brackets, and spaces
    );

    context.subscriptions.push(templateProvider, propertyProvider);
}

function loadConfig(context: vscode.ExtensionContext) {
    const customConfigPath = vscode.workspace.getConfiguration('gameTemplate').get<string>('configPath');
    
    let configPath: string;
    
    if (customConfigPath && fs.existsSync(customConfigPath)) {
        configPath = customConfigPath;
    } else {
        configPath = path.join(context.extensionPath, 'snippets', 'config.json');
    }

    try {
        const configData = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(configData);
    } catch (error) {
        vscode.window.showErrorMessage('Failed to load game template config');
        config = getDefaultConfig();
    }
}

function getDefaultConfig() {
    return {
        template: {
            name: "",
            icon: "",
            steamUrl: "",
            steamDbUrl: "",
            description: "",
            rating: null,
            developer: "",
            publisher: "",
            releaseYear: null,
            tags: [],
            features: []
        },
        suggestions: {
            rating: [5, 10, 15, 20],
            tags: ["Action", "Adventure", "RPG"],
            features: ["Single-player", "Multiplayer", "Co-op"]
        }
    };
}

function generateTemplateSnippet(): string {
    return `{
  "name": "\${1:}",
  "icon": "\${2:}",
  "steamUrl": "\${3:}",
  "steamDbUrl": "\${4:}",
  "description": "\${5:}",
  "rating": \${6:0},
  "developer": "\${7:}",
  "publisher": "\${8:}",
  "releaseYear": \${9:2024},
  "tags": [\${10:}],
  "features": [\${11:}]
}`;
}

function getSuggestionsForProperty(property: string): vscode.CompletionItem[] | undefined {
    if (!config.suggestions || !config.suggestions[property]) {
        return undefined;
    }

    const suggestions = config.suggestions[property];
    
    return suggestions.map((suggestion: string | number, index: number) => {
        const suggestionStr = String(suggestion);
        const item = new vscode.CompletionItem(suggestionStr, vscode.CompletionItemKind.Value);
        
        // For tags and features (strings), wrap in quotes
        // For rating (numbers), insert as-is
        if (property === 'tags' || property === 'features') {
            item.insertText = `"${suggestionStr}"`;
            // CRITICAL: Set label to show the actual text
            item.label = suggestionStr;
            // Use detail to show it's a suggestion
            item.detail = `${property} suggestion`;
            // filterText helps with search - include the text without quotes
            item.filterText = suggestionStr;
            // sortText ensures consistent ordering (pad index with zeros)
            item.sortText = String(index).padStart(5, '0');
        } else {
            item.insertText = suggestionStr;
            item.label = suggestionStr;
            item.sortText = String(index).padStart(5, '0');
        }
        
        // Force VS Code to keep all items visible
        item.keepWhitespace = true;
        
        return item;
    });
}

export function deactivate() {}
