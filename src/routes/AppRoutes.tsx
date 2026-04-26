import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AppLayout } from '../components/shell/AppLayout'

// Route-level code splitting — every page is lazy-loaded.
const Home = lazy(() => import('../pages/Home'))
const Venues = lazy(() => import('../pages/Venues'))
const VenueDetail = lazy(() => import('../pages/VenueDetail'))
const Hosts = lazy(() => import('../pages/Hosts'))
const Atlas = lazy(() => import('../pages/Atlas'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const Profile = lazy(() => import('../pages/Profile'))
const ProfileBookings = lazy(() => import('../pages/ProfileBookings'))
const ProfileAvatar = lazy(() => import('../pages/ProfileAvatar'))
const ProfileVenues = lazy(() => import('../pages/ProfileVenues'))
const ProfileVenuesNew = lazy(() => import('../pages/ProfileVenuesNew'))
const ProfileVenuesEdit = lazy(() => import('../pages/ProfileVenuesEdit'))
const ProfileVenuesBookings = lazy(() => import('../pages/ProfileVenuesBookings'))
const BookingReceipt = lazy(() => import('../pages/BookingReceipt'))
const NotFound = lazy(() => import('../pages/NotFound'))

// PageFallback — single hairline progress hint shown while a route chunk loads.
function PageFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="w-full h-1 bg-ivory-deep overflow-hidden"
    >
      <div className="h-full bg-cinnabar animate-pulse w-1/3" />
    </div>
  )
}

// AppRoutes — React Router v6 tree. The 404 route lives as a sibling of the
// layout route so it renders without the Topbar/Footer chrome.
export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/venues/:id" element={<VenueDetail />} />
          <Route path="/hosts" element={<Hosts />} />
          <Route path="/atlas" element={<Atlas />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/bookings" element={<ProfileBookings />} />
          <Route path="/profile/avatar" element={<ProfileAvatar />} />
          <Route path="/profile/venues" element={<ProfileVenues />} />
          <Route path="/profile/venues/new" element={<ProfileVenuesNew />} />
          <Route path="/profile/venues/:id/edit" element={<ProfileVenuesEdit />} />
          <Route path="/profile/venues/:id/bookings" element={<ProfileVenuesBookings />} />
          <Route path="/bookings/:id" element={<BookingReceipt />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
