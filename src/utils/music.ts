export type AudioType = 'gameStart' | 'gameOver' | 'clear' | 'move' | 'fastMove' | 'rotate'

/** 每种音效在 music.mp3 中的时间切片 [offset, start, duration] */
type AudioInterval = [offset: number, start: number, duration: number]

class Music {
  private audioContext: AudioContext
  private buffer: AudioBuffer | null = null
  private audioInterval: Record<AudioType, AudioInterval> = {
    gameStart: [0, 3.7202, 3.6224],
    gameOver: [0, 8.1276, 1.1437],
    clear: [0, 0, 0.7675],
    move: [0, 2.9088, 0.1437],
    fastMove: [0, 1.2558, 0.3546],
    rotate: [0, 2.2471, 0.0807],
  }

  constructor() {
    this.audioContext = new AudioContext()
    fetch('./music.mp3')
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        this.buffer = buffer
      })
  }

  play(type: AudioType) {
    const [offset, start, duration] = this.audioInterval[type]
    const source = this.audioContext.createBufferSource()
    source.buffer = this.buffer
    source.connect(this.audioContext.destination)
    source.start(offset, start, duration)
  }
}

export default Music
