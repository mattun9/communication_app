interface HeaderProps {
  title: string
  right?: React.ReactNode
}

export function Header({ title, right }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-bg-card px-4">
      <h1 className="text-lg font-bold text-text">{title}</h1>
      {right && <div>{right}</div>}
    </header>
  )
}
