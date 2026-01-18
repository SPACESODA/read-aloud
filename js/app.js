import { uiMethods } from './ui.js';
import { storageMethods } from './storage.js';
import { speechMethods } from './speech.js';

class SpeechApp {
    constructor() {
        // Core runtime state
        this.synth = window.speechSynthesis || null;
        this.isSpeechSupported = Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);
        this.voices = [];
        this.chunks = [];
        this.currentChunkIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null; // Track active utterance for robust cancellation
        this.activeUtteranceId = 0;
        this.utteranceIdCounter = 0;
        this.speakTimeoutId = null;
        this.speakRequestId = 0;
        this.detectTimeoutId = null;
        this.selectedVoiceKey = '';
        this.voiceFilterLang = '';
        this.detectedLang = '';
        this.lastVoiceRefreshAt = 0;
        // Clear-confirm state for the Paste/Clear button.
        this.isClearConfirm = false;
        this.clearConfirmTimeoutId = null;
        this.clearConfirmStartedAt = 0;
        this.clearConfirmRemainingMs = 0;
        // Multi-slot storage (1-5) for independent text/progress.
        this.slotCount = 5;
        this.activeSlot = 1;
        this.slots = this.createDefaultSlots();

        this.storage = this.getStorage();
        this.storageEnabled = Boolean(this.storage);
        this.storageKeys = {
            slots: 'speechApp:slots',
            activeSlot: 'speechApp:activeSlot',
            voicePrefs: 'speechApp:voicePrefs'
        };
        this.voicePreferences = {};
        this.lastStoredText = '';

        // DOM elements
        this.textInput = document.getElementById('text-input');
        this.voiceSelect = document.getElementById('voice-select');
        this.autoDetectToggle = document.getElementById('auto-detect');
        this.autoDetectText = document.getElementById('auto-detect-text');
        this.chromeTip = document.getElementById('chrome-tip');
        this.btnPaste = document.getElementById('btn-paste');
        this.chunkDisplay = document.getElementById('chunk-display');
        this.btnPlayPause = document.getElementById('btn-play-pause');
        this.btnRewind = document.getElementById('btn-rewind');
        this.btnForward = document.getElementById('btn-forward');
        this.btnStop = document.getElementById('btn-stop');
        this.iconPlay = this.btnPlayPause ? this.btnPlayPause.querySelector('.icon-play') : null;
        this.iconPause = this.btnPlayPause ? this.btnPlayPause.querySelector('.icon-pause') : null;
        this.autoDetectLabelText = this.autoDetectText ? this.autoDetectText.textContent.trim() : 'Auto-detect language';
        // Slot buttons are optional if markup is removed.
        this.slotButtons = Array.from(document.querySelectorAll('.slot-button'));

        this.init();
    }
}

Object.assign(SpeechApp.prototype, uiMethods, storageMethods, speechMethods);

// Initialize on load (supports async script injection).
const startApp = () => {
    if (!window.app) {
        window.app = new SpeechApp();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}
