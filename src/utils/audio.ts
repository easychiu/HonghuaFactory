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

  private playSynthesizedSfx(name: string) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (name.includes('click')) {
        // Crisp UI click pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
      } 
      else if (name.includes('coin')) {
        // Double ding (retro coin get)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.type = 'square';
        osc2.type = 'triangle';
        
        osc1.frequency.setValueAtTime(987.77, now); // B5
        osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        
        osc2.frequency.setValueAtTime(987.77 * 1.2, now);
        osc2.frequency.setValueAtTime(1318.51 * 1.2, now + 0.08);
        
        gain.gain.setValueAtTime(0.10, now);
        gain.gain.setValueAtTime(0.10, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc1.start(now);
        osc1.stop(now + 0.3);
        osc2.start(now);
        osc2.stop(now + 0.3);
      }
      else if (name.includes('hit')) {
        // Combat slash/hit impact
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        gain.gain.setValueAtTime(0.20, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
        
        // Add quick white noise crash
        const bufferSize = ctx.sampleRate * 0.06;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 350;
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.06);
      }
      else if (name.includes('crit')) {
        // Critical burst + metallic sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
        
        gain.gain.setValueAtTime(0.30, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        
        osc.start(now);
        osc.stop(now + 0.22);
        
        // White noise explosion
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 250;
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.22, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.15);
      }
      else if (name.includes('heal')) {
        // Rising magical sparkles arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.04 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.2);
          
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.2);
        });
      }
      else if (name.includes('level_up') || name.includes('levelup')) {
        // Classic triumphant level-up chime melody
        const notes = [523.25, 659.25, 783.99, 523.25 * 2]; // C5, E5, G5, C6
        const dur = 0.10;
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = idx === notes.length - 1 ? 'square' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * dur);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.1, now + idx * dur + 0.01);
          
          const end = idx === notes.length - 1 ? 0.35 : 0.09;
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * dur + end);
          
          osc.start(now + idx * dur);
          osc.stop(now + idx * dur + end);
        });
      }
    } catch (e) {
      console.warn('Synthesized SFX playback failed:', e);
    }
  }

  public playSfx(trackName: string) {
    if (this.isMuted) return;

    // 優先使用 Web Audio API 合成經典 JRPG 音效，避免音頻檔加載延遲或 404 錯誤
    const nameLower = trackName.toLowerCase();
    const isStandardSfx = ['click', 'coin', 'hit', 'crit', 'heal', 'level_up', 'levelup'].some(keyword => nameLower.includes(keyword));
    if (isStandardSfx) {
      this.playSynthesizedSfx(nameLower);
      return;
    }

    const base = import.meta.env.BASE_URL || '/';
    const prefix = base.endsWith('/') ? base : `${base}/`;
    const trackUrl = `${prefix}${trackName}`;
    const audio = new Audio(trackUrl);
    audio.volume = 0.5; // 音效中等音量
    audio.play().catch(() => {});
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }
}

export const audioManager = AudioManager.getInstance();
