export default function SummaryBar({ day, routeName, planned, visited, remaining, billed, newCount }: {
  day: string; routeName: string; planned: number; visited: number; remaining: number; billed: number; newCount: number
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-3">
      <h2 className="font-bold text-lg mb-2">{day} – {routeName}</h2>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <Stat label="Planned" value={planned} />
        <Stat label="Visited" value={visited} color="text-blue-600" />
        <Stat label="Remaining" value={remaining} color="text-orange-600" />
        <Stat label="Billed" value={billed} color="text-green-600" />
        <Stat label="New" value={newCount} color="text-purple-600" />
      </div>
    </div>
  )
}
function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className={`text-xl font-bold ${color || ''}`}>{value}</div>
      <div className="text-gray-500">{label}</div>
    </div>
  )
}
