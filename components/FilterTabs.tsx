const TABS = ['All', 'Remaining', 'Visited', 'Billed'] as const
export default function FilterTabs({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex gap-2 mb-3 overflow-x-auto">
      {TABS.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
            active === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'
          }`}>
          {t}
        </button>
      ))}
    </div>
  )
}
