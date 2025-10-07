const { app, BrowserWindow, session, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let warningCount = 0;
const MAX_WARNINGS = 2;
let violationTimeout = null; // to debounce blur/focus
let allowTemporaryBlur = false; // prevent triggering on dialogs

/**
 * Application mode configuration with validation and type safety.
 * Supported modes: 'student' for exam mode, 'instructor' for admin access.
 * Controlled by APP_MODE environment variable, defaults to 'student'.
 */
const VALID_APP_MODES = Object.freeze(['student', 'instructor']);
const DEFAULT_APP_MODE = 'student';

/**
 * Validates and returns the application mode from environment variables.
 * @returns {string} Valid application mode ('student' or 'instructor')
 * @throws {Error} If an invalid mode is provided
 */
function getValidatedAppMode() {
  const envMode = process.env.APP_MODE?.trim().toLowerCase();
  
  // Return default if no environment variable is set
  if (!envMode) {
    console.info(`APP_MODE not set, using default: '${DEFAULT_APP_MODE}'`);
    return DEFAULT_APP_MODE;
  }
  
  // Validate the provided mode
  if (!VALID_APP_MODES.includes(envMode)) {
    const validModes = VALID_APP_MODES.join(', ');
    const errorMsg = `Invalid APP_MODE '${envMode}'. Valid modes: ${validModes}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  
  console.info(`APP_MODE set to: '${envMode}'`);
  return envMode;
}

const APP_MODE = getValidatedAppMode();

/**
 * Returns window configuration based on application mode.
 * In student mode: fullscreen kiosk for exam security.
 * In instructor mode: normal window for admin access.
 * @returns {Object} Window configuration object.
 */
function getWindowConfig() {
  const isStudentMode = APP_MODE === 'student';
  return {
    width: 1280,
    height: 800,
    fullscreen: isStudentMode,
    kiosk: isStudentMode,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // Added preload script for security
    },
  };
}

/**
 * Determines the start URL based on the environment and application mode.
 * In student mode: starts at login page.
 * In instructor mode: starts at instructor dashboard.
 * In development, uses localhost; in production, assumes a built version or different host.
 * TODO: Update production URL as needed.
 */
function getStartURL() {
  const isDevelopment = process.env.NODE_ENV === "development";
  const baseURL = isDevelopment
    ? "http://localhost:3000"
    : "http://localhost:3000"; // Placeholder: Update for production build

  return APP_MODE === 'instructor'
    ? `${baseURL}/instructor`
    : `${baseURL}/login`;
}

/**
 * Sets up security measures for the session, including blocking unauthorized routes.
 * Only applies blocking in student mode for exam security.
 * @param {Object} session - The Electron session object.
 * @param {string} fallbackURL - URL to redirect blocked requests to.
 * @param {boolean} isInstructorMode - Whether the app is running in instructor mode.
 */
function setupSecurity(session, fallbackURL, isInstructorMode) {
  if (isInstructorMode) {
    // No route blocking in instructor mode
    return;
  }

  const blockedPaths = ["/instructor", "/admin", "/setup"];

  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url.toLowerCase();
    if (blockedPaths.some((path) => url.includes(path))) {
      console.log("Blocked access to:", url);
      callback({ redirectURL: fallbackURL });
    } else {
      callback({});
    }
  });
}

/**
 * Sets up violation handling for the main window, monitoring minimize and blur events.
 * Only used in student mode for exam security.
 * @param {BrowserWindow} mainWindow - The main Electron window instance.
 */
function setupViolationHandling(mainWindow) {
  // Detect minimize or switching apps
  mainWindow.on("minimize", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      handleViolation();
    }
  });

  mainWindow.on("blur", () => {
    // If blur happens immediately after a dialog or submission, skip it
    if (allowTemporaryBlur) return;

    // Debounce in case of short blurs
    clearTimeout(violationTimeout);
    violationTimeout = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        handleViolation();
      }
    }, 500);
  });

  mainWindow.on("focus", () => {
    clearTimeout(violationTimeout);
    allowTemporaryBlur = false;
  });

  // Cleanup on close to prevent memory leaks
  mainWindow.on("closed", () => {
    mainWindow = null;
    clearTimeout(violationTimeout);
  });
}

/**
 * Creates and configures the main application window.
 * Behavior varies based on APP_MODE:
 * - Student mode: fullscreen kiosk with exam security and violation monitoring.
 * - Instructor mode: normal window with admin access.
 */
function createWindow() {
  const isInstructorMode = APP_MODE === 'instructor';
  mainWindow = new BrowserWindow(getWindowConfig());

  const startURL = getStartURL();
  console.log("Loading URL:", startURL);

  // Load the URL with error handling
  mainWindow.loadURL(startURL).catch((err) => {
    console.error("Failed to load URL:", err);
    // Optional: Show error dialog or fallback
    // dialog.showErrorBox('Loading Error', 'Failed to load the application. Please check your connection.');
  });

  // Setup security measures (route blocking only in student mode)
  const fallbackURL = isInstructorMode ? startURL : startURL.replace("/login", "/dashboard");
  setupSecurity(session, fallbackURL, isInstructorMode);

  // Setup violation handling only in student mode
  if (!isInstructorMode) {
    setupViolationHandling(mainWindow);
  }
}

/**
 * Handles exam violations such as minimizing or switching apps.
 * Increments warning count and quits the app after max warnings.
 */
function handleViolation() {
  warningCount++;
  if (warningCount <= MAX_WARNINGS) {
    console.warn(
      `⚠️ Exam Violation ${warningCount}/${MAX_WARNINGS}: Minimize or switch detected.`
    );
  } else {
    console.error("❌ Too many violations — exam locked.");
    // Optional: Save state before quitting (e.g., to a file or DB)
    // saveExamState();
    app.quit();
  }
}

app.whenReady().then(() => {
  createWindow();

  // IPC handler to expose APP_MODE to renderer process
  ipcMain.handle('get-app-mode', () => {
    return APP_MODE;
  });

  // Listen for dialogs triggered by your app to avoid false blurs
  app.on("browser-window-focus", () => {
    allowTemporaryBlur = false;
  });

  app.on("browser-window-blur", () => {
    // When alert/confirm/prompt pops up
    allowTemporaryBlur = true;
    setTimeout(() => {
      allowTemporaryBlur = false;
    }, 1000); // Allow short blur window
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
