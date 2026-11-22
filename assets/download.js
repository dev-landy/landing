(() => {
  function getDownloadLinkId({ userAgent, maxTouchPoints }) {
    // Both iPhone and iPad Safari can request desktop sites with a Mac UA.
    const isIOSInDesktopMode = /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
    if (/iPhone|iPad|iPod/i.test(userAgent) || isIOSInDesktopMode) return "app-store";
    if (/Android/i.test(userAgent)) return "google-play";
    return "homepage";
  }

  const link = document.getElementById(getDownloadLinkId(navigator));
  window.location.replace(link.href);
})();
