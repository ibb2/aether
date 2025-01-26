// utils/encryption.js

// Derive a file-specific encryption key from the mnemonic
export async function deriveFileKey(mnemonic, salt) {
    const encoder = new TextEncoder()
    const mnemonicBytes = encoder.encode(mnemonic)

    const baseKey = await crypto.subtle.importKey(
        'raw',
        mnemonicBytes,
        'PBKDF2',
        false,
        ['deriveKey']
    )

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    )
}

// Encrypt a file and prepend salt/IV
export async function encryptFile(mnemonic, file) {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const fileData = await file.arrayBuffer()

    const derivedKey = await deriveFileKey(mnemonic, salt)
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        fileData
    )

    // Combine salt + IV + encrypted data
    const combined = new Uint8Array(
        salt.length + iv.length + encryptedData.byteLength
    )
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length)

    return combined
}

// Decrypt a file (used when retrieving files)
export async function decryptFile(mnemonic, combinedData) {
    const salt = combinedData.slice(0, 16)
    const iv = combinedData.slice(16, 28)
    const encryptedData = combinedData.slice(28)

    const derivedKey = await deriveFileKey(mnemonic, salt)
    return crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        encryptedData
    )
}
