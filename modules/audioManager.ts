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

  // Préchargement
  static async preloadAll() {
    for (const key of Object.keys(soundFiles) as SoundKey[]) {
      if (!this.sounds[key]) {
        const sound = new Audio.Sound();
        await sound.loadAsync(soundFiles[key]);
        if (key === 'background' || key === 'backgroundGame') {
          await sound.setIsLoopingAsync(true);
          await sound.setVolumeAsync(this.volume);
        }
        this.sounds[key] = sound;
      }
    }
  }

  // --- Fonction interne : charge un son manquant ---
  private static async loadSound(key: SoundKey) {
    const sound = new Audio.Sound();
    await sound.loadAsync(soundFiles[key]);
    if (key === 'background' || key === 'backgroundGame') {
      await sound.setIsLoopingAsync(true);
      await sound.setVolumeAsync(this.volume);
    }
    this.sounds[key] = sound;
    return sound;
  }

  // --- Fonction interne : stoppe tout sauf une clé donnée ---
  private static async stopAllExcept(exceptKey: SoundKey) {
    for (const key of Object.keys(this.sounds) as SoundKey[]) {
      if (key !== exceptKey) {
        const sound = this.sounds[key];
        if (sound) {
          const status = await sound.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await sound.stopAsync();
          }
        }
      }
    }
  }

  // Musique de fond du menu
  static async playBackground() {
    if (this.musicMuted) return;

    try {
      if (!this.sounds.background) {
        await this.loadSound('background');
      }

      const sound = this.sounds.background!;
      const status = await sound.getStatusAsync();

      if (!status.isLoaded) {
        await this.loadSound('background');
      }

      await this.stopAllExcept('background');

      await sound.setVolumeAsync(this.volume);
      await sound.playAsync();
    } catch (error) {
      console.log('Erreur playBackground :', error);
    }
  }

  static async pauseBackground() {
    const sound = this.sounds.background;
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
      }
    }
  }

  // Musique de fond de la partie
  static async playBackgroundGame() {
    if (this.musicMuted) return;

    try {
      if (!this.sounds.backgroundGame) {
        await this.loadSound('backgroundGame');
      }

      const sound = this.sounds.backgroundGame!;
      const status = await sound.getStatusAsync();

      if (!status.isLoaded) {
        await this.loadSound('backgroundGame');
      }

      await this.stopAllExcept('backgroundGame');

      await sound.setVolumeAsync(this.volume);
      await sound.playAsync();
    } catch (error) {
      console.log('Erreur playBackgroundGame :', error);
    }
  }

  static async pauseBackgroundGame() {
    const sound = this.sounds.backgroundGame;
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
      }
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
      // On redémarre uniquement la musique du menu si on est dans un écran menu
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

  // Nettoyage des sons quand on quitte l'application
  static async unloadAll() {
    for (const key in this.sounds) {
      const sound = this.sounds[key as SoundKey];
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.unloadAsync();
        }
      }
    }
    this.sounds = {};
  }
}

export default AudioManager;
