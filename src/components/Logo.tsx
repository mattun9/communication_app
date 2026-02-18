/**
 * STARTUS sports academy ロゴ
 * ロゴマークは /logo-mark.png（1ファイル）を使用
 * variant で色を切り替え（CSSフィルター）
 */
interface LogoProps {
  size?: number
  className?: string
  variant?: 'color' | 'white' | 'black'
}

export function Logo({ size = 40, className = '', variant = 'color' }: LogoProps) {
  const imgFilter =
    variant === 'white' ? 'brightness(0) invert(1)' :
    variant === 'black' ? 'brightness(0)' :
    undefined

  return (
    <img
      src="/logo-mark.png"
      alt="STARTUS sports academy"
      width={size}
      height={size}
      className={className}
      style={imgFilter ? { filter: imgFilter } : undefined}
    />
  )
}
