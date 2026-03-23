const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCMDY6S7AgtosHBC1rQ8T-8kKvvsBF1DlU",
  authDomain: "friday-eb632.firebaseapp.com",
  databaseURL: "https://friday-eb632-default-rtdb.firebaseio.com",
  projectId: "friday-eb632",
  storageBucket: "friday-eb632.firebasestorage.app",
  messagingSenderId: "1091246673138",
  appId: "1:1091246673138:web:5b296ec6869acd6d4cd46b",
  measurementId: "G-21EBRXW1CF",
};

async function initFirebase() {
  try {
    const [{ initializeApp }, { getAnalytics, isSupported }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js"),
    ]);

    const app = initializeApp(FIREBASE_CONFIG);
    window.firebaseApp = app;

    if (await isSupported()) {
      window.firebaseAnalytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn("Firebase initialization skipped.", error);
  }
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
  } catch (error) {
    console.warn("Service worker registration failed.", error);
  }
}

function setupNetworkStatus() {
  const status = document.createElement("div");
  status.className = "network-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const title = document.createElement("strong");
  const detail = document.createElement("span");
  status.append(title, detail);
  document.body.append(status);

  let hideTimer;
  const syncStatus = () => {
    const online = navigator.onLine;
    document.body.classList.toggle("is-online", online);
    title.textContent = online ? "Back online" : "Offline mode";
    detail.textContent = online ? "Live updates restored." : "Showing cached content when available.";
    status.classList.add("is-visible");

    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (online) {
        status.classList.remove("is-visible");
      }
    }, online ? 2400 : 0);
  };

  syncStatus();
  window.addEventListener("online", syncStatus);
  window.addEventListener("offline", syncStatus);
}

window.addEventListener("DOMContentLoaded", () => {
  setupNetworkStatus();
  registerServiceWorker();
  initFirebase();
});
