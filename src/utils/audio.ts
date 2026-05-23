class AudioManager {
  private static instance: AudioManager;
  private currentBgm: HTMLAudioElement | null = null;
  private currentTrackName: string = '';
  private isMuted: boolean = false;

  private constructor() {
    this.isMuted = localStorage.getItem('honghua_bgm_muted') === 'true';
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public playBgm(trackName: string) {
    const base = import.meta.env.BASE_URL || '/';
    const prefix = base.endsWith('/') ? base : `${base}/`;
    const trackUrl = `${prefix}${trackName}`;

    if (this.currentTrackName === trackUrl) {
      if (this.currentBgm && this.currentBgm.paused && !this.isMuted) {
        this.currentBgm.play().catch(() => {});
      }
      return;
    }

    if (this.currentBgm) {
      this.currentBgm.pause();
    }

    this.currentTrackName = trackUrl;
    this.currentBgm = new Audio(trackUrl);
    this.currentBgm.loop = true;
    this.currentBgm.volume = 0.4; // 溫和的主音量
    this.currentBgm.muted = this.isMuted;

    if (!this.isMuted) {
      this.currentBgm.play().catch(() => {
        // 若遭瀏覽器阻擋自動播放，註冊全域點擊事件解鎖
        const playOnGesture = () => {
          if (this.currentBgm && this.currentBgm.paused && !this.isMuted) {
            this.currentBgm.play().catch(() => {});
          }
          window.removeEventListener('click', playOnGesture);
          window.removeEventListener('keydown', playOnGesture);
        };
        window.addEventListener('click', playOnGesture);
        window.addEventListener('keydown', playOnGesture);
      });
    }
  }

  public stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.pause();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('honghua_bgm_muted', String(this.isMuted));
    if (this.currentBgm) {
      this.currentBgm.muted = this.isMuted;
      if (!this.isMuted) {
        this.currentBgm.play().catch(() => {});
      } else {
        this.currentBgm.pause();
      }
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }
}

export const audioManager = AudioManager.getInstance();
