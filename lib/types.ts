export type VisitStatus = 'visited' | 'billed' | 'returned' | 'not_found' | 'closed' | 'shifted'

export interface Outlet {
  id: string
  code: string
  name: string
  alternate_name: string | null
  channel: string | null
  sub_channel: string | null
  day: string
  is_new: boolean
  latitude: number | null
  longitude: number | null
}

export interface OutletWithStatus extends Outlet {
  status: VisitStatus | 'remaining'
}

export interface OutletAssets {
  outlet_id: string
  stand: boolean
  countertop: boolean
  wall_hanging_basket: boolean
  other: boolean
}
