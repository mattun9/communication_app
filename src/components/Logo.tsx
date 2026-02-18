/**
 * KANAZAWA STARTUS SPORTS ACADEMY ロゴ
 * ブランドガイドライン準拠
 */
interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
  variant?: 'color' | 'white' | 'black'
}

export function Logo({ size = 40, showText = true, className = '', variant = 'color' }: LogoProps) {
  const markColor = variant === 'white' ? '#ffffff' : variant === 'black' ? '#000000' : '#ed6c00'
  const textColor = variant === 'white' ? '#ffffff' : '#000000'

  // 6枚花弁の星型マーク — 各花弁は菱形（尖った楕円）
  // 画像の形状を再現: 先端が鋭く、付け根はやや丸みを帯びる
  const petals = [0, 60, 120, 180, 240, 300]
  const petalPath = 'M0,-4 C6,-14 8,-30 0,-42 C-8,-30 -6,-14 0,-4Z'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Star-flower mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(50,50)">
          {petals.map((angle) => (
            <path
              key={angle}
              d={petalPath}
              fill={markColor}
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="6" fill={markColor} />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col" style={{ gap: size * 0.02 }}>
          <span
            className="font-bold leading-none"
            style={{
              fontSize: size * 0.22,
              letterSpacing: '0.12em',
              color: textColor,
            }}
          >
            KANAZAWA
          </span>
          <span
            className="font-black leading-none"
            style={{
              fontSize: size * 0.42,
              letterSpacing: '0.06em',
              color: textColor,
            }}
          >
            STARTUS
          </span>
          <span
            className="font-semibold leading-none"
            style={{
              fontSize: size * 0.14,
              letterSpacing: '0.22em',
              color: textColor,
              opacity: 0.65,
            }}
          >
            SPORTS ACADEMY
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoMark({ size = 40, variant = 'color', className = '' }: Omit<LogoProps, 'showText'>) {
  return <Logo size={size} showText={false} variant={variant} className={className} />
}
