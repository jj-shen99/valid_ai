# ValidAI VS Code Extension

Test AI-generated code directly in VS Code using ValidAI analysis modules.

## Features

- **Analyze Current File**: Right-click on any file and select "ValidAI: Analyze Current File"
- **Analyze Selection**: Select code and use "ValidAI: Analyze Selection" for targeted analysis
- **Inline Diagnostics**: View findings as VS Code diagnostics in the Problems panel
- **Web UI Integration**: Open the full ValidAI web interface from VS Code

## Installation

1. Install the extension from the VS Code Marketplace
2. Ensure ValidAI web UI is running (default: http://localhost:3000)
3. Right-click on code files to analyze

## Configuration

Open VS Code Settings and search for "ValidAI":

- `validai.webUIUrl`: URL of the ValidAI web interface (default: http://localhost:3000)
- `validai.enableDiagnostics`: Show findings as VS Code diagnostics (default: true)

## Usage

### Analyze a File
1. Open a code file
2. Right-click and select "ValidAI: Analyze Current File"
3. View findings in the Problems panel

### Analyze Selection
1. Select code in the editor
2. Right-click and select "ValidAI: Analyze Selection"
3. Findings appear as diagnostics

### Open Web UI
- Run command "ValidAI: Open Web UI" to open the full testing framework

## Requirements

- VS Code 1.75.0 or higher
- ValidAI web UI running locally or accessible via network

## License

MIT
