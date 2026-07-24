(() => {
  const DISMISSED_KEY = "wrc-install-hint-dismissed";
  const DISMISS_TIME = 30 * 24 * 60 * 60 * 1000;
  let installPrompt = null;
  let installHint = null;

  const isInstalled = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = () => /android/i.test(navigator.userAgent);

  const wasRecentlyDismissed = () => {
    const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY));
    return dismissedAt && Date.now() - dismissedAt < DISMISS_TIME;
  };

  const hideInstallHint = () => {
    installHint?.remove();
    installHint = null;
  };

  const createInstallHint = () => {
    if (installHint || isInstalled() || wasRecentlyDismissed()) return;

    installHint = document.createElement("aside");
    installHint.className = "pwa-install-hint";
    installHint.setAttribute("aria-label", "App installieren");

    const message = document.createElement("p");
    message.innerHTML = "<strong>📱 Tipp:</strong> Installiere die WRC auf deinem Startbildschirm. Sie fühlt sich dann wie eine richtige App an.";

    const actions = document.createElement("div");
    actions.className = "pwa-install-actions";

    if (installPrompt) {
      const installButton = document.createElement("button");
      installButton.type = "button";
      installButton.className = "pwa-install-button";
      installButton.textContent = "Installieren";
      installButton.addEventListener("click", async () => {
        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        hideInstallHint();
      });
      actions.appendChild(installButton);
    } else if (isIos()) {
      const iosHelp = document.createElement("span");
      iosHelp.className = "pwa-install-help";
      iosHelp.textContent = "In Safari: Teilen → Zum Home-Bildschirm";
      actions.appendChild(iosHelp);
    } else if (isAndroid()) {
      const androidHelp = document.createElement("span");
      androidHelp.className = "pwa-install-help";
      androidHelp.textContent = "Im Browser-Menü: App installieren";
      actions.appendChild(androidHelp);
    } else {
      return;
    }

    const dismissButton = document.createElement("button");
    dismissButton.type = "button";
    dismissButton.className = "pwa-install-dismiss";
    dismissButton.setAttribute("aria-label", "Installationshinweis schließen");
    dismissButton.textContent = "×";
    dismissButton.addEventListener("click", () => {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
      hideInstallHint();
    });

    actions.appendChild(dismissButton);
    installHint.append(message, actions);
    document.body.appendChild(installHint);
  };

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(error => {
        console.warn("WRC Service Worker konnte nicht registriert werden:", error);
      });
    });
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    hideInstallHint();
    createInstallHint();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    localStorage.removeItem(DISMISSED_KEY);
    hideInstallHint();
  });

  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", event => {
    if (event.matches) hideInstallHint();
  });

  if (isIos() || isAndroid()) {
    window.addEventListener("load", () => {
      window.setTimeout(createInstallHint, 1500);
    });
  }
})();
