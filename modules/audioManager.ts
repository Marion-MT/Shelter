import { Audio } from 'expo-av';

type SoundKey = 'background' | 'scroll' | 'validate' | 'click' | 'backgroundGame';

const soundFiles: Record<SoundKey, any> = {
  background: require('../assets/sounds/background.mp3'),
  scroll: require('../assets/sounds/scroll.mp3'),
  validate: require('../assets/sounds/validate.mp3'),
  click: require('../assets/sounds/click.mp3'),
  backgroundGame: require('../assets/sounds/backgroundGame.mp3'),
};

class AudioManager {
  private static sounds: Partial<Record<SoundKey, Audio.Sound>> = {};
  private static musicMuted = false;
  private static effectsMuted = false;
  private static volume = 0.2;
  private static fadeDuration = 1000; // ms

  // Précharge tous les sons
  static async preloadAll() {
    for (const key of Object.keys(soundFiles) as SoundKey[]) {
      if (!this.sounds[key]) {
        const sound = new Audio.Sound();
        await sound.loadAsync(soundFiles[key]);
        if (key === 'background' || key === 'backgroundGame') {
          await sound.setIsLoopingAsync(true);
          await sound.setVolumeAsync(0); // démarrage muet
        }
        this.sounds[key] = sound;
      }
    }
  }

  // Permet la fondu du son lors des transitions
  private static async fadeSound(sound: Audio.Sound, from: number, to: number, duration: number) {
    const steps = 10;
    const stepTime = duration / steps;
    const stepVolume = (to - from) / steps;

    for (let i = 0; i <= steps; i++) {
      await sound.setVolumeAsync(from + stepVolume * i);
      await new Promise((r) => setTimeout(r, stepTime));
    }
  }

  // Musique de fond du menu
  static async playBackground() {
    if (this.musicMuted) return;
    await this.crossFade('backgroundGame', 'background');
  }

  static async pauseBackground() {
    const sound = this.sounds.background;
    if (sound) {
      await this.fadeSound(sound, this.volume, 0, this.fadeDuration);
      const status = await sound.getStatusAsync();
      if (status.isPlaying) await sound.pauseAsync();
    }
  }

  // Musique de fond pendant une partie
  static async playBackgroundGame() {
    if (this.musicMuted) return;
    await this.crossFade('background', 'backgroundGame');
  }

  static async pauseBackgroundGame() {
    const sound = this.sounds.backgroundGame;
    if (sound) {
      await this.fadeSound(sound, this.volume, 0, this.fadeDuration);
      const status = await sound.getStatusAsync();
      if (status.isPlaying) await sound.pauseAsync();
    }
  }

  // Fondu entre deux musiques
  private static async crossFade(fromKey: SoundKey, toKey: SoundKey) {
    const fromSound = this.sounds[fromKey];
    const toSound = this.sounds[toKey];

    if (fromSound) {
      const status = await fromSound.getStatusAsync();
      if (status.isPlaying) {
        await this.fadeSound(fromSound, this.volume, 0, this.fadeDuration);
        await fromSound.pauseAsync();
      }
    }

    if (toSound) {
      const status = await toSound.getStatusAsync();
      if (!status.isPlaying) {
        await toSound.setPositionAsync(0);
        await toSound.playAsync();
      }
      await this.fadeSound(toSound, 0, this.volume, this.fadeDuration);
    }
  }

  // Bruitages
  static async playEffect(type: Exclude<SoundKey, 'background' | 'backgroundGame'>) {
    if (this.effectsMuted) return;
    const effect = new Audio.Sound();
    try {
      await effect.loadAsync(soundFiles[type]);
      await effect.setVolumeAsync(this.volume);
      await effect.playAsync();
      effect.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          effect.unloadAsync();
        }
      });
    } catch (e) {
      console.log(`Erreur lecture du son ${type}:`, e);
    }
  }

  // --- Réglages dynamiques ---
  static async setMusicMuted(muted: boolean) {
    this.musicMuted = muted;
    if (muted) {
      await this.pauseBackground();
      await this.pauseBackgroundGame();
    } else {
      await this.playBackground();
    }
  }

  static setEffectsMuted(muted: boolean) {
    this.effectsMuted = muted;
  }

  static async setMusicVolume(value: number) {
    this.volume = value / 100;
    const bg = this.sounds.background;
    const bgGame = this.sounds.backgroundGame;
    if (bg) await bg.setVolumeAsync(this.volume);
    if (bgGame) await bgGame.setVolumeAsync(this.volume);
  }

  // Nettoyage des son a la fermeture de l'apllication
  static async unloadAll() {
    for (const key in this.sounds) {
      await this.sounds[key as SoundKey]?.unloadAsync();
    }
    this.sounds = {};
  }
}

export default AudioManager;
