const DB_NAME = 'validai'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      if (!db.objectStoreNames.contains('submissions')) {
        const submissionStore = db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true })
        submissionStore.createIndex('timestamp', 'timestamp', { unique: false })
        submissionStore.createIndex('language', 'language', { unique: false })
      }

      if (!db.objectStoreNames.contains('findings')) {
        const findingStore = db.createObjectStore('findings', { keyPath: 'id', autoIncrement: true })
        findingStore.createIndex('submissionId', 'submissionId', { unique: false })
        findingStore.createIndex('severity', 'severity', { unique: false })
        findingStore.createIndex('module', 'module', { unique: false })
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function tx(storeName, mode = 'readonly') {
  return openDB().then(db => {
    const transaction = db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  })
}

export async function addSubmission(submission) {
  const store = await tx('submissions', 'readwrite')
  return new Promise((resolve, reject) => {
    const req = store.add({ ...submission, timestamp: submission.timestamp || new Date().toISOString() })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getAllSubmissions() {
  const store = await tx('submissions')
  return new Promise((resolve, reject) => {
    const req = store.index('timestamp').openCursor(null, 'prev')
    const results = []
    req.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        results.push(cursor.value)
        cursor.continue()
      } else {
        resolve(results)
      }
    }
    req.onerror = () => reject(req.error)
  })
}

export async function addFindings(findings, submissionId) {
  const store = await tx('findings', 'readwrite')
  const promises = findings.map(f => {
    return new Promise((resolve, reject) => {
      const req = store.add({ ...f, submissionId, timestamp: f.timestamp || new Date().toISOString() })
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  })
  return Promise.all(promises)
}

export async function getFindingsBySubmission(submissionId) {
  const store = await tx('findings')
  return new Promise((resolve, reject) => {
    const req = store.index('submissionId').getAll(submissionId)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getAllFindings() {
  const store = await tx('findings')
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function setSetting(key, value) {
  const store = await tx('settings', 'readwrite')
  return new Promise((resolve, reject) => {
    const req = store.put({ key, value })
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function getSetting(key) {
  const store = await tx('settings')
  return new Promise((resolve, reject) => {
    const req = store.get(key)
    req.onsuccess = () => resolve(req.result?.value ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function clearAllData() {
  const db = await openDB()
  const storeNames = ['submissions', 'findings']
  for (const name of storeNames) {
    const transaction = db.transaction(name, 'readwrite')
    transaction.objectStore(name).clear()
  }
}

export async function getStats() {
  const submissions = await getAllSubmissions()
  const findings = await getAllFindings()

  return {
    totalSubmissions: submissions.length,
    totalFindings: findings.length,
    criticalCount: findings.filter(f => f.severity === 'Critical').length,
    highCount: findings.filter(f => f.severity === 'High').length,
    mediumCount: findings.filter(f => f.severity === 'Medium').length,
    infoCount: findings.filter(f => f.severity === 'Info').length,
    avgScore: submissions.length > 0
      ? Math.round(submissions.reduce((a, s) => a + (s.score || 0), 0) / submissions.length)
      : 0,
    submissions,
    findings,
  }
}
