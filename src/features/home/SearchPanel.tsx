import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/navigation'
import { SearchForm } from '@/features/timetables/SearchForm'
import { EMPTY_QUERY, type SearchQuery } from '@/features/timetables/types'

/**
 * The real timetable search, placed in the "Timetables" section of the home page. Searching opens the timetables page,
 * which fills in the same search and shows the connections.
 */
export function SearchPanel() {
  const navigate = useNavigate()
  return (
    <div className="bg-card mx-auto w-full max-w-sm rounded-3xl border p-4 shadow-xl">
      <SearchForm
        query={EMPTY_QUERY}
        loading={false}
        onSearch={(query: SearchQuery) => navigate(ROUTES.timetables, { state: { query } })}
      />
    </div>
  )
}
