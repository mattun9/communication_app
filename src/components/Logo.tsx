/**
 * KANAZAWA STARTUS SPORTS ACADEMY ロゴ
 * ブランドガイドライン準拠: 星型花マーク + テキスト
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
        {/* 6-petal star-flower */}
        <g transform="translate(50,50)">
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-22"
              rx="14"
              ry="22"
              fill={markColor}
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="10" fill={markColor} />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="text-[0.7em] font-bold tracking-wider"
            style={{ fontSize: size * 0.25, color: textColor }}
          >
            KANAZAWA
          </span>
          <span
            className="font-extrabold tracking-wide"
            style={{ fontSize: size * 0.38, color: textColor }}
          >
            STARTUS
          </span>
          <span
            className="text-[0.45em] font-semibold tracking-widest"
            style={{ fontSize: size * 0.15, color: textColor, opacity: 0.7 }}
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
