class Music {
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext || window.oAudioContext;
        this.audioContext = new AudioContext();
        this.audioInterval = {
            gameStart: [0, 3.7202, 3.6224],
            gameOver: [0, 8.1276, 1.1437],
            clear: [0, 0, 0.7675],
            move: [0, 2.9088, 0.1437],
            fastMove: [0, 1.2558, 0.3546],
            rotate: [0, 2.2471, 0.0807]
        }
        fetch('./music.mp3').then((response) => response.arrayBuffer()).then((arrayBuffer) => {
            this.audioContext.decodeAudioData(arrayBuffer, (buffer) => {
                this.buffer = buffer;
            });
        });
    }
    play(type) {
        const v = this.audioInterval[type]
        if (!v) return
        this.getSource().start(v[0], v[1], v[2])
    }
    getType() {
        return Object.keys(this.audioInterval).reduce((sum, cur) => {
            return { ...sum, [cur]: cur }
        }, {})
    }

    getSource() {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffer
        source.connect(this.audioContext.destination);
        return source;
    }
}

export default Music;