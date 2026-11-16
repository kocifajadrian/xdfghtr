import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Bell, GraduationCap, Leaf } from 'lucide-react'
import { ROUTES } from '@/config/navigation'
import { RequireAuth } from '@/features/auth'
import type { MessageKey } from '@/i18n'
import CardsPage from '@/pages/CardsPage'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import OrdersPage from '@/pages/OrdersPage'
import PlaceholderPage from '@/pages/PlaceholderPage'
import TimetablesPage from '@/pages/TimetablesPage'

type PlaceholderRoute = {
  path: string
  title: MessageKey
  text: MessageKey
  icon: ReactNode
  /** Needs a login. Signed-out visitors see the home page and the login popup. */
  protected: boolean
}

// Screens that are not built yet. Replace an entry with a real page when it exists.
const PLACEHOLDER_ROUTES: PlaceholderRoute[] = [
  {
    path: ROUTES.pass,
    title: 'nav.pass',
    text: 'placeholder.pass',
    icon: <GraduationCap className="size-5" />,
    protected: true,
  },
  {
    path: ROUTES.notifications,
    title: 'account.notifications',
    text: 'placeholder.notifications',
    icon: <Bell className="size-5" />,
    protected: true,
  },
  {
    path: ROUTES.greenKm,
    title: 'account.greenKm',
    text: 'placeholder.greenKm',
    icon: <Leaf className="size-5" />,
    protected: true,
  },
]

function renderPlaceholder(route: PlaceholderRoute) {
  const page = <PlaceholderPage icon={route.icon} title={route.title} text={route.text} />
  return route.protected ? <RequireAuth fallback={<HomePage />}>{page}</RequireAuth> : page
}

/** All pages of the app. Pages that need a login are wrapped in RequireAuth. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.timetables} element={<TimetablesPage />} />
      <Route
        path={ROUTES.orders}
        element={
          <RequireAuth fallback={<HomePage />}>
            <OrdersPage />
          </RequireAuth>
        }
      />
      {PLACEHOLDER_ROUTES.map((route) => (
        <Route key={route.path} path={route.path} element={renderPlaceholder(route)} />
      ))}
      <Route
        path={ROUTES.card.root}
        element={
          <RequireAuth fallback={<HomePage />}>
            <CardsPage />
          </RequireAuth>
        }
      />
      {/* The login is a popup now. Old links to /login go home. */}
      <Route path="/login" element={<Navigate to={ROUTES.home} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
