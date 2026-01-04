/**
 * Audio Manager - Handles audio loading and playback
 */

import * as THREE from 'three';
import { APP_CONFIG } from '@/config/app.config';

export class AudioManager {
  private audioLoader: THREE.AudioLoader;
  private audioListener: THREE.AudioListener;
  private soundBuffers: (AudioBuffer | null)[] = [];
  private activeSounds: THREE.Audio[] = [];

  constructor(audioListener: THREE.AudioListener) {
    this.audioListener = audioListener;
    this.audioLoader = new THREE.AudioLoader();
  }

  async loadAllSounds(): Promise<void> {
    const soundUrls = APP_CONFIG.assets.sounds;
    
    const promises = soundUrls.map((url, index) => {
      if (!url) {
        this.soundBuffers[index] = null;
        return Promise.resolve();
      }
      
      return new Promise<void>((resolve, reject) => {
        this.audioLoader.load(
          url,
          (buffer) => {
            this.soundBuffers[index] = buffer;
            console.log(`Sound ${index} loaded`);
            resolve();
          },
          undefined,
          (error) => {
            console.error(`Error loading sound ${index}:`, error);
            this.soundBuffers[index] = null;
            resolve(); // Don't reject, just continue
          }
        );
      });
    });
    
    await Promise.all(promises);
  }

  playAudio(index: number, loop: boolean = false, volume: number = 0.5): void {
    const buffer = this.soundBuffers[index];
    if (!buffer) {
      console.warn(`Sound buffer ${index} not ready.`);
      return;
    }
    
    // Resume audio context if suspended
    if (this.audioListener.context.state === 'suspended') {
      this.audioListener.context.resume().catch((e) => {
        console.error('AudioContext resume failed:', e);
      });
    }
    
    // Stop previous sounds
    this.stopAll();
    
    // Create and play new sound
    const sound = new THREE.Audio(this.audioListener);
    sound.setBuffer(buffer);
    sound.setLoop(loop);
    sound.setVolume(volume);
    sound.play();
    
    this.activeSounds.push(sound);
    console.log(`Playing sound ${index}`);
  }

  stopAll(): void {
    this.activeSounds.forEach((sound) => {
      if (sound.isPlaying) {
        sound.stop();
      }
    });
    this.activeSounds = [];
  }

  fadeOut(duration: number = 4): void {
    this.activeSounds.forEach((sound) => {
      if (sound.isPlaying && sound.gain) {
        const currentTime = this.audioListener.context.currentTime;
        sound.gain.gain.linearRampToValueAtTime(0, currentTime + duration);
        setTimeout(() => sound.stop(), duration * 1000);
      }
    });
    this.activeSounds = [];
  }

  dispose(): void {
    this.stopAll();
    this.soundBuffers = [];
  }
}
