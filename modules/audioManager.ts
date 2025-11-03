import { Audio } from 'expo-av';

type SoundKey = 'background' | 'scroll' | 'validate' | 'click';

const soundFiles: Record<SoundKey, any> = {
  background: require('../assets/sounds/background.mp3'),
  scroll: require('../assets/sounds/scroll.mp3'),
  validate: require('../assets/sounds/validate.mp3'),
  click: require('../assets/sounds/click.mp3'),
};

class AudioManager {
  private static sounds: Partial<Record<SoundKey, Audio.Sound>> = {};
  private static isMuted = false;

// Charge tous les son
  static async preloadAll() {
    for (const key of Object.keys(soundFiles) as SoundKey[]) {
      if (!this.sounds[key]) {
        const sound = new Audio.Sound();
        await sound.loadAsync(soundFiles[key]);
        if (key === 'background') {
          await sound.setIsLoopingAsync(true);
          await sound.setVolumeAsync(0.4);
        }
        this.sounds[key] = sound;
      }
    }
  }

// Lance la musique de fond
  static async playBackground() {
    if (this.isMuted) return;
    const sound = this.sounds.background;
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isPlaying) {
        await sound.stopAsync();
      }
      
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  }

 // mets la musique en pause
  static async pauseBackground() {
    const sound = this.sounds.background;
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isPlaying) await sound.pauseAsync();
    }
  }

// Joue un des bruitages
  static async playEffect(type: Exclude<SoundKey, 'background'>) {
    if (this.isMuted) return;
    const effect = new Audio.Sound();
    try {
      await effect.loadAsync(soundFiles[type]);
      await effect.playAsync();
      // déchargement automatique après la lecture
      effect.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          effect.unloadAsync();
        }
      });
    } catch (e) {
      console.log(`Erreur lecture du son ${type}:`, e);
    }
  }

// Mute démute a impémenter 
  static setMuted(mute: boolean) {
    this.isMuted = mute;
    if (mute) this.pauseBackground();
    else this.playBackground();
  }

// Décharge tous les sons a la fermeture de l'application
  static async unloadAll() {
    for (const key in this.sounds) {
      await this.sounds[key as SoundKey]?.unloadAsync();
    }
    this.sounds = {};
  }
}

export default AudioManager;
