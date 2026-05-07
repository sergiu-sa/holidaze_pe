import { Outlet } from 'react-router-dom'

import { ProfileSidebar } from './ProfileSidebar'

export function ProfileShell() {
  return (
    <main id="main" className="profile">
      <ProfileSidebar />
      <div className="profile__main">
        <Outlet />
      </div>
    </main>
  )
}
