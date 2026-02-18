/**
 * STARTUS sports academy ロゴ
 * ロゴマークは /public/logo-mark.svg を使用
 */
interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
  variant?: 'color' | 'white' | 'black'
}

export function Logo({ size = 40, showText = true, className = '', variant = 'color' }: LogoProps) {
  const textColor = variant === 'white' ? '#ffffff' : '#000000'
  const src = variant === 'white' ? '/logo-mark-white.svg' : '/logo-mark.svg'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={src}
        alt="STARTUS"
        width={size}
        height={size}
        className={variant === 'black' ? 'brightness-0' : ''}
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
