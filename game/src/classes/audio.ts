export class AudioPlayer {
    private audio: HTMLAudioElement;
    private isLooping: boolean = false;
    private isMuted: boolean = false;

    constructor(url?: string, options?: { loop?: boolean, volume?: number }) {
        this.audio = new Audio(url || '');
        if (options?.loop !== undefined) {
            this.isLooping = options.loop;
            this.audio.loop = this.isLooping;
        }
        if (options?.volume !== undefined) {
            this.setVolume(options.volume);
        }

        // 반복 설정
        if (this.isLooping) {
            this.audio.loop = true;
        }
    }

    // 오디오 파일 로드
    public load(url: string): void {
        this.audio.src = url;
        this.audio.load();
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
}
