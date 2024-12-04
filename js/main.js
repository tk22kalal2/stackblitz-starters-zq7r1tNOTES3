import { splitPdf } from './pdfSplitter.js';
import { performOCR } from './ocrProcessor.js';
import { generateNotes } from './notesGenerator.js';
import { showLoading, hideLoading, updatePreview, showError } from './utils/uiHelpers.js';
import { readFileAsArrayBuffer } from './services/pdfService.js';
import { setupEventListeners } from './utils/eventHandlers.js';

export function initializeApp() {
  // Ensure DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupApplication);
  } else {
    setupApplication();
  }
}

function setupApplication() {
  const elements = getElements();
  if (!validateElements(elements)) {
    console.error('Required DOM elements not found');
    return;
  }
  
  setupEventListeners(elements);
}

function getElements() {
  return {
    pdfUpload: document.getElementById("pdfUpload"),
    splitButton: document.getElementById("splitButton"),
    notesButton: document.getElementById("notesButton"),
    startPage: document.getElementById("startPage"),
    endPage: document.getElementById("endPage"),
    ocrTextPreview: document.getElementById("ocrTextPreview"),
    loadingIndicator: document.getElementById("loadingIndicator"),
    notesControls: document.querySelector(".notes-controls")
  };
}

function validateElements(elements) {
  return Object.values(elements).every(element => element !== null);
}