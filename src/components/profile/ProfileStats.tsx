interface ProfileStatsCell {
  label: string
  value: number | string
}

interface ProfileStatsProps {
  cells: ProfileStatsCell[]
}

export function ProfileStats({ cells }: ProfileStatsProps) {
  return (
    <dl className="profile-stats">
      {cells.map((cell) => (
        <div key={cell.label} className="profile-stats__cell">
          <dt className="profile-stats__label mono">{cell.label}</dt>
          <dd className="profile-stats__num">
            <em>{cell.value}</em>
          </dd>
        </div>
      ))}
    </dl>
  )
}
