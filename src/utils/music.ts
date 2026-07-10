import { Howl } from 'howler'

export type AudioType = 'gameStart' | 'gameOver' | 'clear' | 'move' | 'fastMove' | 'rotate'

/** 每种音效在 music.mp3 中的时间切片 [startMs, durationMs] */
type AudioSprite = Record<AudioType, [start: number, duration: number]>

const AUDIO_SPRITE: AudioSprite = {
  gameStart: [3720.2, 3622.4],
  gameOver: [8127.6, 1143.7],
  clear: [0, 767.5],
  move: [2908.8, 143.7],
  fastMove: [1255.8, 354.6],
  rotate: [2247.1, 80.7],
}

class Music {
  private sound = new Howl({
    src: ['./music.mp3'],
    sprite: AUDIO_SPRITE,
  })

  play(type: AudioType) {
    this.sound.play(type)
  }

  destroy() {
    this.sound.unload()
  }
}

export default Music
