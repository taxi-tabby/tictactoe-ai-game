class AudioPlayer {
    private audio: HTMLAudioElement;
    private isLooping: boolean = false;
    private isMuted: boolean = false;
    private audioContext: AudioContext;
    private sourceNode: MediaElementAudioSourceNode;
    private analyserNode: AnalyserNode;
    private dataArray: Uint8Array;
    private bufferLength: number;

    constructor(url?: string, options?: { loop?: boolean, volume?: number }) {
        this.audio = new Audio();
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.sourceNode = this.audioContext.createMediaElementSource(this.audio);


        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 256;

        this.sourceNode.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        if (options?.loop !== undefined) {
            this.isLooping = options.loop;
            this.audio.loop = this.isLooping;
        }
        if (options?.volume !== undefined) {
            this.setVolume(options.volume);
        }

        // Load the audio file if URL is provided
        if (url) {
            this.load(url).catch(error => {
                console.error('Failed to load audio:', error);
            });
        }
    }

    // 오디오 파일 로드
    public async load(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.audio.src = url;
            this.audio.load();
            this.audio.addEventListener('canplaythrough', () => {
                console.info(`Audio loaded from ${url}`);
                resolve();
            }, { 
                once: true 
            });
            this.audio.addEventListener('error', (e) => reject(e), { once: true });
        });
    }

    // 오디오 재생
    public play(): void {
        if (this.audio.paused || this.audio.ended) {
            this.audio.play();
        }
    }

    // 오디오 정지
    public stop(): void {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    // 볼륨 설정
    public setVolume(volume: number): void {
        this.audio.volume = volume; // 0.0 ~ 1.0 범위로 설정
    }

    // 음소거
    public mute(): void {
        this.isMuted = true;
        this.audio.muted = true;
    }

    // 음소거 해제
    public unmute(): void {
        this.isMuted = false;
        this.audio.muted = false;
    }

    // 반복 설정
    public enableLoop(): void {
        this.isLooping = true;
        this.audio.loop = true;
    }

    // 반복 해제
    public disableLoop(): void {
        this.isLooping = false;
        this.audio.loop = false;
    }

    // 음소거 상태 확인
    public isAudioMuted(): boolean {
        return this.isMuted;
    }

    // 현재 오디오 상태 (재생 중 여부)
    public isPlaying(): boolean {
        return !this.audio.paused && !this.audio.ended;
    }

    public getBufferLength(): number {
        return this.bufferLength;
    }

    // 실시간 주파수 데이터 가져오기
    public getFrequencyData(): Uint8Array {
        this.analyserNode.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    // 실시간 파형 데이터 가져오기
    public getWaveformData(): Uint8Array {
        this.analyserNode.getByteTimeDomainData(this.dataArray);
        return this.dataArray;
    }

    // 스펙트럼 분석 데이터 가져오기
    public getSpectrumData(): Uint8Array {
        this.analyserNode.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    // 현재 재생 시간 가져오기
    public getCurrentTime(): number {
        return this.audio.currentTime;
    }

    // 총 재생 시간 가져오기
    public getDuration(): number {
        return this.audio.duration;
    }
}

class AudioManager {
    private players: Map<string, AudioPlayer> = new Map();

    public async addAudio(key: string, url: string, options?: { loop?: boolean, volume?: number }): Promise<void> {
        const player = new AudioPlayer(url, options);
        await player.load(url);
        this.players.set(key, player);
    }

    public removeAudio(key: string): void {
        this.players.delete(key);
    }

    public play(key: string): void {
        const player = this.players.get(key);
        if (player) {
            player.play();
        }
    }

    public stop(key: string): void {
        const player = this.players.get(key);
        if (player) {
            player.stop();
        }
    }

    public setVolume(key: string, volume: number): void {
        const player = this.players.get(key);
        if (player) {
            player.setVolume(volume);
        }
    }

    public mute(key: string): void {
        const player = this.players.get(key);
        if (player) {
            player.mute();
        }
    }

    public unmute(key: string): void {
        const player = this.players.get(key);
        if (player) {
            player.unmute();
        }
    }

    public enableLoop(key: string): void {
        const player = this.players.get(key);
        if (player) {
            player.enableLoop();
        }
    }

    public disableLoop(key: string): void {
        const player = this.players.get(key);
        if (player) {
            player.disableLoop();
        }
    }

    public isAudioMuted(key: string): boolean {
        const player = this.players.get(key);
        return player ? player.isAudioMuted() : false;
    }

    public isPlaying(key: string): boolean {
        const player = this.players.get(key);
        return player ? player.isPlaying() : false;
    }

    public getFrequencyData(key: string): Uint8Array | null {
        const player = this.players.get(key);
        return player ? player.getFrequencyData() : null;
    }

    public getWaveformData(key: string): Uint8Array | null {
        const player = this.players.get(key);
        return player ? player.getWaveformData() : null;
    }

    public getSpectrumData(key: string): Uint8Array | null {
        const player = this.players.get(key);
        return player ? player.getSpectrumData() : null;
    }

    public getBufferLength(key: string): number | null {
        const player = this.players.get(key);
        return player ? player.getBufferLength() : null;
    }

    public getCurrentTime(key: string): number | null {
        const player = this.players.get(key);
        return player ? player.getCurrentTime() : null;
    }

    public getDuration(key: string): number | null {
        const player = this.players.get(key);
        return player ? player.getDuration() : null;
    }
}

export { AudioPlayer, AudioManager };
