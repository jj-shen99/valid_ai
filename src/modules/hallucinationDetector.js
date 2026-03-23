export const hallucinationDetector = (code, language) => {
  const findings = []
  const lines = code.split('\n')

  const commonAPIs = {
    javascript: {
      'Array.prototype': ['map', 'filter', 'reduce', 'forEach', 'find', 'includes', 'push', 'pop', 'shift', 'unshift'],
      'String.prototype': ['charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'slice', 'substring', 'substr', 'toLowerCase', 'toUpperCase'],
      'Object': ['keys', 'values', 'entries', 'assign', 'create', 'defineProperty'],
      'Math': ['abs', 'ceil', 'floor', 'round', 'max', 'min', 'random', 'sqrt', 'pow'],
      'JSON': ['parse', 'stringify'],
      'console': ['log', 'error', 'warn', 'info', 'debug'],
    },
    python: {
      'builtins': ['len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sum', 'max', 'min', 'sorted', 'reversed', 'all', 'any'],
      'str': ['split', 'join', 'strip', 'replace', 'find', 'startswith', 'endswith', 'upper', 'lower', 'format'],
      'list': ['append', 'extend', 'insert', 'remove', 'pop', 'clear', 'index', 'count', 'sort', 'reverse'],
      'dict': ['keys', 'values', 'items', 'get', 'pop', 'update', 'clear'],
      'os': ['path', 'getcwd', 'listdir', 'mkdir', 'remove'],
      're': ['match', 'search', 'findall', 'sub', 'split', 'compile'],
    },
  }

  const apiMap = commonAPIs[language] || {}
  const allValidAPIs = new Set()
  Object.values(apiMap).forEach(methods => {
    methods.forEach(m => allValidAPIs.add(m))
  })

  const functionCallPattern = /(\w+)\.(\w+)\s*\(/g
  const methodCallPattern = /\.(\w+)\s*\(/g

  lines.forEach((line, idx) => {
    let match
    
    while ((match = functionCallPattern.exec(line)) !== null) {
      const [, obj, method] = match
      
      if (!allValidAPIs.has(method) && !isCommonMethod(method)) {
        findings.push({
          id: `hall-${idx}-${method}`,
          module: 'hallucination',
          moduleName: 'Hallucination Detector',
          severity: 'High',
          category: 'Non-existent API call',
          description: `Detected call to potentially non-existent method: ${obj}.${method}()`,
          lineNumber: idx + 1,
          suggestion: `Verify that ${method} is a valid method on ${obj}. Check the official documentation for the correct API.`,
          timestamp: new Date().toISOString(),
        })
      }
    }
  })

  return findings
}

function isCommonMethod(method) {
  const commonMethods = new Set([
    'then', 'catch', 'finally', 'async', 'await',
    'constructor', 'toString', 'valueOf', 'hasOwnProperty',
    'call', 'apply', 'bind', 'prototype',
    'render', 'setState', 'componentDidMount', 'componentWillUnmount',
    'addEventListener', 'removeEventListener', 'dispatch',
    'emit', 'on', 'off', 'once', 'pipe', 'subscribe', 'unsubscribe',
    'get', 'set', 'has', 'delete', 'add', 'remove', 'update', 'create',
    'open', 'close', 'read', 'write', 'send', 'receive',
    'start', 'stop', 'reset', 'init', 'destroy', 'dispose',
    'mount', 'unmount', 'connect', 'disconnect',
    'use', 'run', 'execute', 'process', 'handle',
    'map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every',
    'push', 'pop', 'shift', 'unshift', 'splice', 'slice',
    'test', 'match', 'replace', 'search', 'split', 'trim',
    'parse', 'stringify', 'encode', 'decode',
    'log', 'warn', 'error', 'info', 'debug',
    'resolve', 'reject', 'all', 'race', 'any', 'allSettled',
    'configure', 'setup', 'register', 'middleware',
    'query', 'insert', 'select', 'from', 'where', 'join',
    'fetch', 'abort', 'cancel', 'retry',
    'validate', 'sanitize', 'normalize', 'format',
    'getItem', 'setItem', 'removeItem', 'clear',
    'getElementById', 'querySelector', 'querySelectorAll',
    'appendChild', 'removeChild', 'createElement',
    'click', 'focus', 'blur', 'submit',
    'next', 'prev', 'done', 'return', 'throw',
    'entries', 'keys', 'values', 'size', 'length',
  ])
  return commonMethods.has(method)
}
