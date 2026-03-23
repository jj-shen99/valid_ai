const ALGO = 'AES-GCM'
const KEY_NAME = 'validai_enc_key'

async function getOrCreateKey() {
  const stored = localStorage.getItem(KEY_NAME)
  if (stored) {
    const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0))
    return crypto.subtle.importKey('raw', raw, ALGO, false, ['encrypt', 'decrypt'])
  }
  const key = await crypto.subtle.generateKey({ name: ALGO, length: 256 }, true, ['encrypt', 'decrypt'])
  const exported = await crypto.subtle.exportKey('raw', key)
  localStorage.setItem(KEY_NAME, btoa(String.fromCharCode(...new Uint8Array(exported))))
  return key
}

export async function encrypt(plaintext) {
  if (!plaintext) return ''
  const key = await getOrCreateKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded)
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.length)
  return btoa(String.fromCharCode(...combined))
}

export async function decrypt(base64) {
  if (!base64) return ''
  try {
    const key = await getOrCreateKey()
    const combined = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ciphertext)
    return new TextDecoder().decode(decrypted)
  } catch {
    return ''
  }
}
