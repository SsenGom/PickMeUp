declare module 'react-confetti' {
  import { Component } from 'react'

  interface ConfettiProps {
    width?: number
    height?: number
    numberOfPieces?: number
    recycle?: boolean
    run?: boolean
    wind?: number
    gravity?: number
    colors?: string[]
    opacity?: number
    tweenDuration?: number
    tweenFunction?: (currentTime: number, currentValue: number, targetValue: number, duration: number, s?: number) => number
    drawShape?: (ctx: CanvasRenderingContext2D) => void
    onConfettiComplete?: (confetti: Confetti) => void
    style?: React.CSSProperties
    className?: string
  }

  class Confetti extends Component<ConfettiProps> {}
  
  export default Confetti
}
