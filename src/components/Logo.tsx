/**
 * KANAZAWA STARTUS SPORTS ACADEMY ロゴ
 * ブランドガイドライン準拠: 5枚花弁マーク + テキスト
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

  // 5枚の丸みのある花弁 — 画像準拠
  // 各花弁は中心から外へ広がる涙型のパス
  const petalAngles = [0, 72, 144, 216, 288]
  // 丸みのある涙型花弁: 中心付近から外側に膨らみ、先端で丸く閉じる
  const petalPath =
    'M0,0 C-10,-8 -14,-22 -10,-34 C-7,-42 0,-46 0,-46 C0,-46 7,-42 10,-34 C14,-22 10,-8 0,0Z'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(50,50)">
          {petalAngles.map((angle) => (
            <path
              key={angle}
              d={petalPath}
              fill={markColor}
              transform={`rotate(${angle})`}
            />
          ))}
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col" style={{ gap: size * 0.015 }}>
          <span
            className="font-bold leading-none"
            style={{
              fontSize: size * 0.22,
              letterSpacing: '0.14em',
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
              fontSize: size * 0.135,
              letterSpacing: '0.22em',
              color: textColor,
              opacity: 0.6,
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
