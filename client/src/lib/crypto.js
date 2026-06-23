// ── crypto.js ─────────────────────────────────────────────────────────────
// End-to-end encryption via ECDH (P-256) + AES-256-GCM.
//
// How it works:
//   1. Each user generates a P-256 keypair on first use.
//   2. The PUBLIC key is uploaded to the server (user_keys collection).
//   3. The PRIVATE key never leaves the browser — stored in localStorage.
//   4. To send a DM:  derive a shared AES key via ECDH(myPriv, theirPub).
//   5. Encrypt with AES-GCM (random 12-byte IV prepended to ciphertext).
//   6. The recipient does the same ECDH derivation → identical shared key → decrypts.
//
// Both sides arrive at the same shared secret without ever transmitting it.

const toBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

// ── Key generation ─────────────────────────────────────────────────────────

/**
 * Generate a P-256 ECDH keypair.
 * Returns { pubKey, privKey } as base64 strings.
 * pubKey  → 'raw' export  (65 bytes uncompressed, safe to share)
 * privKey → 'pkcs8' export (private, never leaves browser)
 */
export async function generateKeyPair() {
  const kp = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits']
  );
  const pubBuf  = await crypto.subtle.exportKey('raw',   kp.publicKey);
  const privBuf = await crypto.subtle.exportKey('pkcs8', kp.privateKey);
  return { pubKey: toBase64(pubBuf), privKey: toBase64(privBuf) };
}

// ── Key import helpers ─────────────────────────────────────────────────────

/** Import a base64 'pkcs8' private key → CryptoKey usable for ECDH */
async function importPrivateKey(b64) {
  return crypto.subtle.importKey(
    'pkcs8',
    fromBase64(b64),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveKey', 'deriveBits']
  );
}

/** Import a base64 'raw' public key → CryptoKey usable for ECDH */
async function importPublicKey(b64) {
  return crypto.subtle.importKey(
    'raw',
    fromBase64(b64),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
}

// ── ECDH shared key derivation ─────────────────────────────────────────────

/**
 * Derive a shared AES-256-GCM key from:
 *   myPrivKeyB64   — the current user's base64 private key (from localStorage)
 *   theirPubKeyB64 — the contact's base64 public key (from server)
 *
 * Both sides (sender + receiver) call this with their own priv + other's pub
 * and arrive at the identical AES key — that's the ECDH magic.
 */
export async function deriveSharedKey(myPrivKeyB64, theirPubKeyB64) {
  const myPriv   = await importPrivateKey(myPrivKeyB64);
  const theirPub = await importPublicKey(theirPubKeyB64);

  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: theirPub },
    myPriv,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ── AES-GCM encrypt / decrypt ──────────────────────────────────────────────

/**
 * Encrypt plaintext with a CryptoKey (AES-GCM).
 * Returns base64 string: [ 12-byte IV | ciphertext ].
 */
export async function encryptMessage(plaintext, aesKey) {
  const iv        = crypto.getRandomValues(new Uint8Array(12));
  const encoded   = new TextEncoder().encode(plaintext);
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoded);

  const combined = new Uint8Array(12 + cipherBuf.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuf), 12);
  return toBase64(combined.buffer);
}

/**
 * Decrypt a base64 ciphertext (produced by encryptMessage) with a CryptoKey.
 * Returns the original plaintext string, or null on failure.
 */
export async function decryptMessage(ciphertextB64, aesKey) {
  try {
    const combined = fromBase64(ciphertextB64);
    const iv         = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plainBuf   = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ciphertext);
    return new TextDecoder().decode(plainBuf);
  } catch {
    // Decryption failure — wrong key or corrupted data
    return null;
  }
}

// ── Private key storage ────────────────────────────────────────────────────

/**
 * Get this user's private key from localStorage.
 * If missing (new browser / cleared storage), generates a new keypair and
 * returns the private key — caller is responsible for uploading the new pubKey.
 */
export async function getOrCreatePrivKey(userId) {
  const key = `privKey_${userId}`;
  let b64   = localStorage.getItem(key);
  if (!b64) {
    const kp  = await generateKeyPair();
    localStorage.setItem(key, kp.privKey);
    // Also cache the public key so callers can upload it if needed
    localStorage.setItem(`pubKey_${userId}`, kp.pubKey);
    b64 = kp.privKey;
    console.info('%c🔑 New keypair generated and cached.', 'color:#00a884');
  }
  return b64;
}

// ── Room ID helper ─────────────────────────────────────────────────────────

/**
 * Deterministic DM roomId — always lower Clerk ID first.
 * Both participants compute the same string independently.
 */
export function dmRoomId(idA, idB) {
  return idA < idB ? `dm_${idA}_${idB}` : `dm_${idB}_${idA}`;
}
