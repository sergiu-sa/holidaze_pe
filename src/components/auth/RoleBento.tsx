export type Role = 'guest' | 'host'

interface RoleBentoProps {
  value: Role
  onChange: (role: Role) => void
}

export function RoleBento({ value, onChange }: RoleBentoProps) {
  return (
    <div className="auth-roles" role="radiogroup" aria-label="Account role">
      <input
        type="radio"
        id="role-guest"
        name="role"
        value="guest"
        checked={value === 'guest'}
        onChange={() => {
          onChange('guest')
        }}
      />
      <label htmlFor="role-guest">
        <span className="auth-roles__role">guest</span>
        <span className="auth-roles__desc">book a stay</span>
        <span className="auth-roles__check" aria-hidden="true" />
      </label>

      <input
        type="radio"
        id="role-host"
        name="role"
        value="host"
        checked={value === 'host'}
        onChange={() => {
          onChange('host')
        }}
      />
      <label htmlFor="role-host">
        <span className="auth-roles__role">host</span>
        <span className="auth-roles__desc">keep the kettle on</span>
        <span className="auth-roles__check" aria-hidden="true" />
      </label>
    </div>
  )
}
