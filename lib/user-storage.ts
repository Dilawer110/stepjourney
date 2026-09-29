// Business caches are separated by user and access assignment. Legacy shared
// caches remain untouched, but are never read under a newly scoped account.
let namespace: string | null = null
export function setStorageIdentity(userId: string | null, scope = '') {
 namespace = userId ? `stepjourney-v2:${userId}:${scope}:` : null
}
function scopedKey(key: string) {
 if (!namespace) throw new Error('Sign in before reading or saving app data.')
 return namespace + key
}
export const userStorage = {
 getItem(key: string) { return localStorage.getItem(scopedKey(key)) },
 setItem(key: string, value: string) { localStorage.setItem(scopedKey(key), value) },
 removeItem(key: string) { localStorage.removeItem(scopedKey(key)) },
}

