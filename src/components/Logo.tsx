/**
 * STARTUS sports academy ロゴ
 * ロゴマークは /logo-mark.png（1ファイル）を使用
 * variant で色を切り替え（CSSフィルター）
 */
interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
  variant?: 'color' | 'white' | 'black'
}

export function Logo({ size = 40, showText = true, className = '', variant = 'color' }: LogoProps) {
  const textColor = variant === 'white' ? '#ffffff' : '#000000'
  // color: そのまま, white: 白に変換, black: 黒に変換
  const imgFilter =
    variant === 'white' ? 'brightness(0) invert(1)' :
    variant === 'black' ? 'brightness(0)' :
    undefined

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo-mark.png"
        alt="STARTUS"
        width={size}
        height={size}
        style={imgFilter ? { filter: imgFilter } : undefined}
      />
      {showText && (
        <div className="flex flex-col" style={{ gap: size * 0.01 }}>
          <span
            className="font-black leading-none"
            style={{
              fontSize: size * 0.42,
              letterSpacing: '0.04em',
              color: textColor,
            }}
          >
            STARTUS
          </span>
          <span
            className="font-medium leading-none"
            style={{
              fontSize: size * 0.17,
              letterSpacing: '0.1em',
              color: textColor,
              opacity: 0.55,
            }}
          >
            sports academy
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoMark({ size = 40, variant = 'color', className = '' }: Omit<LogoProps, 'showText'>) {
  return <Logo size={size} showText={false} variant={variant} className={className} />
}
