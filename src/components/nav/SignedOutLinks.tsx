import { NavLink } from 'react-router-dom'

interface SignedOutLinksProps {
  onLinkClick?: () => void
}

export function SignedOutLinks({ onLinkClick }: SignedOutLinksProps) {
  return (
    <>
      <NavLink to="/login" className="account__link" onClick={onLinkClick}>
        Sign in
      </NavLink>
      <NavLink
        to="/register"
        className="account__link account__link--cta"
        onClick={onLinkClick}
      >
        Register<span aria-hidden="true"> →</span>
      </NavLink>
    </>
  )
}
