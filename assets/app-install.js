(() => {
  let pendingPrompt = null;
  let prompting = false;

  window.addEventListener("beforeinstallprompt", (event) => {
    // Only handle Google Play installation, not installation of the website.
    if (!Array.isArray(event.platforms) || !event.platforms.includes("play")) return;
    event.preventDefault();
    pendingPrompt = event;
  });

  window.addEventListener("appinstalled", () => {
    pendingPrompt = null;
  });

  document.addEventListener("click", async (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    const link = event.target instanceof Element
      ? event.target.closest('a[data-store="google-play"]')
      : null;
    if (!link || (!pendingPrompt && !prompting)) return;

    event.preventDefault();
    if (prompting) return;

    // A prompt can only be used once and must start within the user's click.
    const installPrompt = pendingPrompt;
    pendingPrompt = null;
    prompting = true;

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch {
      // If Chrome cannot display its prompt, the same store remains reachable.
      window.location.assign(link.href);
    } finally {
      prompting = false;
    }
  });
})();
