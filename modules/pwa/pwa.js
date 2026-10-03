(() => {
  let installPrompt = null;
  let installHint = null;
  let installed = false;
  const standalone = window.matchMedia("(display-mode: standalone)");
  const isInstalled = () => installed || standalone.matches || navigator.standalone === true;
  const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  const installHelp = () => {
    if (isIos()) return "Öffne die WRC in Safari. Tippe auf Teilen → Zum Home-Bildschirm → Hinzufügen.";
    if (/android/i.test(navigator.userAgent)) {
      return "Öffne das Browser-Menü und wähle „App installieren“ oder „Zum Startbildschirm hinzufügen“, falls angeboten. Fehlt der Eintrag, versuche es in Chrome.";
    }
    return "Öffne das Browser-Menü und suche nach „Installieren“ oder „Als App installieren“. Falls dein Browser dies nicht anbietet, öffne die WRC in Chrome oder Edge.";
  };

  const hideInstallHint = () => {
    installHint?.remove();
    installHint = null;
  };

  const createInstallHint = () => {
    const dashboard = document.getElementById("dashboard");
    if (!dashboard || installHint || isInstalled()) return;

    installHint = document.createElement("aside");
    installHint.className = "pwa-install-hint";
    installHint.setAttribute("aria-label", "WRC auf diesem Gerät installieren");

    const message = document.createElement("p");
    message.innerHTML = "<strong>📲 WRC auf diesem Gerät installieren</strong><br>Die Wurstrand Challenge wie eine App direkt vom Startbildschirm öffnen.";
    const installButton = document.createElement("button");
    installButton.type = "button";
    installButton.className = "pwa-install-button";
    installButton.textContent = "WRC installieren";
    installButton.setAttribute("aria-controls", "wrcInstallHelp");
    const help = document.createElement("p");
    help.id = "wrcInstallHelp";
    help.className = "pwa-install-help";
    help.setAttribute("role", "status");
    help.hidden = true;

    installButton.addEventListener("click", async () => {
      if (isInstalled()) { hideInstallHint(); return; }
      if (!installPrompt) {
        help.textContent = installHelp();
        help.hidden = false;
        return;
      }
      const prompt = installPrompt;
      installPrompt = null; // Browser events can only be prompted once.
      installButton.disabled = true;
      help.hidden = true;
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === "accepted") {
          installed = true;
          hideInstallHint();
        } else {
          help.textContent = "Installation abgebrochen. Du kannst es später erneut versuchen. " + installHelp();
          help.hidden = false;
        }
      } catch {
        help.textContent = "Der Installationsdialog ist gerade nicht verfügbar. " + installHelp();
        help.hidden = false;
      } finally {
        installButton.disabled = false;
      }
    });

    installHint.append(message, installButton, help);
    dashboard.appendChild(installHint);
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
    createInstallHint();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    installPrompt = null;
    hideInstallHint();
  });
  standalone.addEventListener?.("change", () => {
    if (isInstalled()) hideInstallHint();
    else createInstallHint();
  });
  window.addEventListener("load", createInstallHint);
})();
