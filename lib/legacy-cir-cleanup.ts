// Retire only the four-field report's dated caches. Never touch cir_* data.
export function removeLegacyCIRCache(storage: Storage) {
  const keys: string[] = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (key && /^(?:stepjourney-v2:[\s\S]*:)?comp_intel_\d{4}-\d{2}-\d{2}$/.test(key)) keys.push(key)
  }
  for (const key of keys) storage.removeItem(key)
  return keys.length
}
