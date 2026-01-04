/**
 * UI Manager - Handles all UI elements and interactions
 */

import type { ButtonConfig } from '@/types';

export class UIManager {
  // UI Elements
  private loadingEl: HTMLElement;
  private sceneLoadingEl: HTMLElement;
  private backgroundImgEl: HTMLImageElement;
  private instructionsEl: HTMLElement;
  private startButtonEl: HTMLButtonElement;
  private modelLabelEl: HTMLElement;
  private modelToggleButtons: HTMLButtonElement[];
  private leftHtmlPanel: HTMLElement;
  private rightHtmlPanel: HTMLElement;
  private descriptionEl: HTMLElement;

  private infoButtons: HTMLButtonElement[];
  private infoPanels: HTMLElement[];

  constructor() {
    // Get references to UI elements
    this.loadingEl = this.getElement('loading');
    this.sceneLoadingEl = this.getElement('sceneLoadingIndicator');
    this.backgroundImgEl = this.getElement('backgroundImg') as HTMLImageElement;
    this.instructionsEl = this.getElement('instructions');
    this.startButtonEl = this.getElement('startButton') as HTMLButtonElement;
    this.modelLabelEl = this.getElement('modelLabel');
    this.leftHtmlPanel = this.getElement('leftHtmlPanel');
    this.rightHtmlPanel = this.getElement('rightHtmlPanel');
    this.descriptionEl = this.getElement('description');

    this.modelToggleButtons = [
      this.getElement('modelToggleBtn1') as HTMLButtonElement,
      this.getElement('modelToggleBtn2') as HTMLButtonElement,
      this.getElement('modelToggleBtn3') as HTMLButtonElement,
      this.getElement('modelToggleBtn4') as HTMLButtonElement,
      this.getElement('modelToggleBtn5') as HTMLButtonElement,
      this.getElement('modelToggleBtn6') as HTMLButtonElement,
    ];

    this.infoButtons = [
      this.getElement('fullscreenButton') as HTMLButtonElement,
      this.getElement('projectInfoButton') as HTMLButtonElement,
      this.getElement('studioInfoButton') as HTMLButtonElement,
      this.getElement('hintButton') as HTMLButtonElement,
      this.getElement('creatorsNoteButton') as HTMLButtonElement,
    ];

    this.infoPanels = [
      this.getElement('projectInfoPanel'),
      this.getElement('studioInfoPanel'),
      this.getElement('hintPanel'),
      this.getElement('creatorsNotePanel'),
    ];

    this.setupInfoPanelListeners();
  }

  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id "${id}" not found`);
    }
    return element;
  }

  private setupInfoPanelListeners(): void {
    const buttonPanelPairs = [
      { button: 'projectInfoButton', panel: 'projectInfoPanel', close: 'closeButton' },
      { button: 'studioInfoButton', panel: 'studioInfoPanel', close: 'studioCloseButton' },
      { button: 'hintButton', panel: 'hintPanel', close: 'hintCloseButton' },
      { button: 'creatorsNoteButton', panel: 'creatorsNotePanel', close: 'creatorsCloseButton' },
    ];

    buttonPanelPairs.forEach(({ button, panel, close }) => {
      const buttonEl = document.getElementById(button);
      const panelEl = document.getElementById(panel);
      const closeEl = document.getElementById(close);

      if (buttonEl && panelEl && closeEl) {
        buttonEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const isPanelOpen = panelEl.style.display === 'block';

          // Close all panels
          this.infoPanels.forEach((p) => (p.style.display = 'none'));
          this.infoButtons.forEach((b) => (b.style.opacity = '1'));

          if (!isPanelOpen) {
            panelEl.style.display = 'block';
            buttonEl.style.opacity = '0.5';
          }
        });

        closeEl.addEventListener('click', (e) => {
          e.stopPropagation();
          panelEl.style.display = 'none';
          buttonEl.style.opacity = '1';
        });

        panelEl.addEventListener('click', (e) => e.stopPropagation());
      }
    });

    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenButton');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFullscreen();
      });
    }
  }

  hideLoading(): void {
    this.loadingEl.style.display = 'none';
  }

  showSceneLoading(): void {
    this.sceneLoadingEl.style.display = 'block';
  }

  hideSceneLoading(): void {
    this.sceneLoadingEl.style.display = 'none';
  }

  showBackgroundImage(): void {
    this.backgroundImgEl.style.display = 'block';
  }

  hideBackgroundImage(): void {
    this.backgroundImgEl.style.display = 'none';
  }

  showInstructions(): void {
    this.instructionsEl.style.display = 'block';
  }

  hideInstructions(): void {
    this.instructionsEl.style.display = 'none';
  }

  showStartButton(text: string = 'Start'): void {
    this.startButtonEl.textContent = text;
    this.startButtonEl.style.display = 'block';
  }

  hideStartButton(): void {
    this.startButtonEl.style.display = 'none';
  }

  updateToggleButtons(buttons: ButtonConfig[] | null): void {
    const showLabel = buttons && buttons.length > 0;
    this.modelLabelEl.style.display = showLabel ? 'block' : 'none';

    this.modelToggleButtons.forEach((btn, index) => {
      if (buttons && index < buttons.length) {
        const config = buttons[index];
        btn.textContent = config.name;
        btn.dataset.id = config.id;
        btn.style.display = 'block';
        btn.classList.remove('selected');
      } else {
        btn.style.display = 'none';
      }
    });

    if (buttons && buttons.length > 0) {
      this.modelToggleButtons[0].classList.add('selected');
    }
  }

  selectToggleButton(index: number): void {
    this.modelToggleButtons.forEach((btn, i) => {
      btn.classList.toggle('selected', i === index);
    });
  }

  updateHtmlPanels(leftId: string | null, rightId: string | null): void {
    const leftContent = leftId ? document.getElementById(leftId) : null;
    if (leftContent) {
      this.leftHtmlPanel.innerHTML = leftContent.innerHTML;
      this.leftHtmlPanel.style.display = 'block';
      this.leftHtmlPanel.scrollTop = 0;
    } else {
      this.leftHtmlPanel.innerHTML = '';
      this.leftHtmlPanel.style.display = 'none';
    }

    const rightContent = rightId ? document.getElementById(rightId) : null;
    if (rightContent) {
      this.rightHtmlPanel.innerHTML = rightContent.innerHTML;
      this.rightHtmlPanel.style.display = 'block';
      this.rightHtmlPanel.scrollTop = 0;
    } else {
      this.rightHtmlPanel.innerHTML = '';
      this.rightHtmlPanel.style.display = 'none';
    }
  }

  showDescription(text: string): void {
    this.descriptionEl.textContent = text;
    this.descriptionEl.style.display = 'block';
  }

  hideDescription(): void {
    this.descriptionEl.style.display = 'none';
  }

  showInfoButtons(show: boolean): void {
    const display = show ? 'block' : 'none';
    this.infoButtons.forEach((btn) => {
      btn.style.display = display;
    });
  }

  hideFullscreenButton(): void {
    const fsBtn = document.getElementById('fullscreenButton');
    if (fsBtn) fsBtn.style.display = 'none';
  }

  onStartButtonClick(callback: () => void): void {
    this.startButtonEl.addEventListener('click', (e) => {
      e.stopPropagation();
      callback();
    });
  }

  onToggleButtonClick(callback: (index: number) => void): void {
    this.modelToggleButtons.forEach((btn, index) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        callback(index);
      });
    });
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Exit fullscreen error:', err);
      });
    }
  }

  getModelToggleButtons(): HTMLButtonElement[] {
    return this.modelToggleButtons;
  }
}
