import { describe, it, expect, beforeEach } from 'vitest'
import { encrypt, decrypt } from '../../src/utils/crypto'

beforeEach(() => {
  localStorage.clear()
})

describe('encrypt / decrypt', () => {
  it('encrypts and decrypts a string', async () => {
    const plaintext = 'sk-ant-api-key-12345'
    const encrypted = await encrypt(plaintext)
    expect(encrypted).not.toBe(plaintext)
    expect(encrypted.length).toBeGreaterThan(0)

    const decrypted = await decrypt(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('returns empty string for empty input', async () => {
    const enc = await encrypt('')
    expect(enc).toBe('')

    const dec = await decrypt('')
    expect(dec).toBe('')
  })

  it('produces different ciphertexts for same input (random IV)', async () => {
    const plaintext = 'test-token-abc'
    const enc1 = await encrypt(plaintext)
    const enc2 = await encrypt(plaintext)
    expect(enc1).not.toBe(enc2)

    // But both decrypt to same value
    expect(await decrypt(enc1)).toBe(plaintext)
    expect(await decrypt(enc2)).toBe(plaintext)
  })

  it('handles special characters', async () => {
    const plaintext = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./~`'
    const encrypted = await encrypt(plaintext)
    const decrypted = await decrypt(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('handles unicode content', async () => {
    const plaintext = '🔑 密码 пароль'
    const encrypted = await encrypt(plaintext)
    const decrypted = await decrypt(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('decrypt returns empty string for invalid input', async () => {
    const result = await decrypt('not-valid-base64!!!')
    expect(result).toBe('')
  })

  it('uses consistent key across calls', async () => {
    const plaintext = 'consistent-key-test'
    const encrypted = await encrypt(plaintext)
    // Key should be stored in localStorage now
    expect(localStorage.getItem('validai_enc_key')).toBeTruthy()

    const decrypted = await decrypt(encrypted)
    expect(decrypted).toBe(plaintext)
  })
})
