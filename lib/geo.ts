export function getPosition(): Promise<{ lat: number | null; lng: number | null }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ lat: null, lng: null })
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: null, lng: null }),
      { timeout: 5000 }
    )
  })
}

// Opens Google Maps app/web with directions to the outlet.
// Omitting origin lets Google Maps use the device's current location automatically.
export function openDirections(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) {
    alert('Location not available for this outlet')
    return
  }
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
  window.open(url, '_blank')
}
