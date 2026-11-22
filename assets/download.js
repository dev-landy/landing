(() => {
  function getDownloadLinkId({ userAgent, maxTouchPoints, userAgentData }) {
    // Both iPhone and iPad Safari can request desktop sites with a Mac UA.
    const isIOSInDesktopMode = /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
    if (/iPhone|iPad|iPod/i.test(userAgent) || isIOSInDesktopMode) return "app-store";
    if (/Android/i.test(userAgent)) return "google-play";

    // Use explicit mobile identifiers when the UA otherwise looks like a desktop.
    const platform = userAgentData && userAgentData.platform;
    if (/(?:^|\s)CriOS\/\d/i.test(userAgent)) {
      return !platform || platform === "iOS" ? "app-store" : "homepage";
    }
    if (platform === "Android") return "google-play";
    return "homepage";
  }

  const link = document.getElementById(getDownloadLinkId(navigator));
  window.location.replace(link.href);
})();
