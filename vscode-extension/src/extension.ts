import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const analyzeFileCommand = vscode.commands.registerCommand('validai.analyzeFile', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage('No active editor')
      return
    }

    const code = editor.document.getText()
    const language = editor.document.languageId
    const fileName = editor.document.fileName

    await analyzeCode(code, language, fileName)
  })

  const analyzeSelectionCommand = vscode.commands.registerCommand('validai.analyzeSelection', async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage('No active editor')
      return
    }

    const selection = editor.selection
    const code = editor.document.getText(selection)
    const language = editor.document.languageId
    const fileName = editor.document.fileName

    await analyzeCode(code, language, fileName)
  })

  const openWebUICommand = vscode.commands.registerCommand('validai.openWebUI', async () => {
    const config = vscode.workspace.getConfiguration('validai')
    const webUIUrl = config.get<string>('webUIUrl') || 'http://localhost:3600'
    vscode.env.openExternal(vscode.Uri.parse(webUIUrl))
  })

  context.subscriptions.push(analyzeFileCommand, analyzeSelectionCommand, openWebUICommand)
}

async function analyzeCode(code: string, language: string, fileName: string) {
  const config = vscode.workspace.getConfiguration('validai')
  const webUIUrl = config.get<string>('webUIUrl') || 'http://localhost:3600'

  try {
    vscode.window.showInformationMessage('Analyzing code with ValidAI...')

    const response = await fetch(`${webUIUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language,
        fileName,
        modules: ['failureMode', 'security', 'hallucination'],
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const findings = await response.json()

    if (findings.length === 0) {
      vscode.window.showInformationMessage('No issues found!')
      return
    }

    const diagnostics: vscode.Diagnostic[] = findings.map((finding: any) => {
      const range = new vscode.Range(
        new vscode.Position(finding.lineNumber - 1, 0),
        new vscode.Position(finding.lineNumber - 1, 100)
      )

      const severity = finding.severity === 'Critical' ? vscode.DiagnosticSeverity.Error :
                       finding.severity === 'High' ? vscode.DiagnosticSeverity.Warning :
                       vscode.DiagnosticSeverity.Information

      return new vscode.Diagnostic(
        range,
        `${finding.category}: ${finding.description}`,
        severity
      )
    })

    const editor = vscode.window.activeTextEditor
    if (editor) {
      const collection = vscode.languages.createDiagnosticCollection('validai')
      collection.set(editor.document.uri, diagnostics)
    }

    vscode.window.showInformationMessage(
      `Found ${findings.length} issues. Check the Problems panel.`
    )
  } catch (error) {
    vscode.window.showErrorMessage(
      `ValidAI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export function deactivate() {}
