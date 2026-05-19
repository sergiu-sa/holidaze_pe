import { Link } from 'react-router-dom'

import { AvatarEditor } from '../components/profile'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function ProfileAvatar() {
  useDocumentTitle('Edit avatar')
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol className="crumbs__list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <span aria-current="page">Avatar</span>
          </li>
        </ol>
      </nav>

      <AvatarEditor />
    </>
  )
}
