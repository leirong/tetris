export type AudioType =
  | "gameStart"
  | "gameOver"
  | "clear"
  | "move"
  | "fastMove"
  | "rotate";

type AudioInterval = [offset: number, start: number, duration: number];

class Music {
  private audioContext: AudioContext;
  private buffer: AudioBuffer | null = null;
  private audioInterval: Record<AudioType, AudioInterval> = {
    gameStart: [0, 3.7202, 3.6224],
    gameOver: [0, 8.1276, 1.1437],
    clear: [0, 0, 0.7675],
    move: [0, 2.9088, 0.1437],
    fastMove: [0, 1.2558, 0.3546],
    rotate: [0, 2.2471, 0.0807],
  };

  constructor() {
    const w = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
      mozAudioContext?: typeof AudioContext;
      msAudioContext?: typeof AudioContext;
      oAudioContext?: typeof AudioContext;
    };
    const AudioContextClass =
      window.AudioContext ||
      w.webkitAudioContext ||
      w.mozAudioContext ||
      w.msAudioContext ||
      w.oAudioContext;
    this.audioContext = new AudioContextClass();
    fetch("./music.mp3")
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        this.audioContext.decodeAudioData(arrayBuffer, (buffer) => {
          this.buffer = buffer;
        });
      });
  }

  play(type: AudioType) {
    const v = this.audioInterval[type];
    if (!v) return;
    this.getSource().start(v[0], v[1], v[2]);
  }

  getType(): Record<AudioType, AudioType> {
    return (Object.keys(this.audioInterval) as AudioType[]).reduce(
      (sum, cur) => {
        return { ...sum, [cur]: cur };
      },
      {} as Record<AudioType, AudioType>
    );
  }

  getSource(): AudioBufferSourceNode {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.audioContext.destination);
    return source;
  }
}

export default Music;
