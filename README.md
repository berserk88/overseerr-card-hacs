# Overseerr Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/YOUR_GITHUB_USERNAME/overseerr-card-hacs.svg)](https://github.com/YOUR_GITHUB_USERNAME/overseerr-card-hacs/releases)

A custom Lovelace card for Home Assistant that provides a full graphical interface for searching, browsing, and requesting movies & TV shows through [Overseerr](https://overseerr.dev/).

> **Also install the integration:** [overseerr-hacs](https://github.com/YOUR_GITHUB_USERNAME/overseerr-hacs)

---

## Preview

The card features three tabs:
- **Search** — search any movie or TV show, tap for a detail view with one-click requesting
- **Trending** — browse what's trending right now
- **Requests** — view all requests with live status indicators

---

## Installation via HACS

1. Open HACS in Home Assistant
2. Go to **Frontend**
3. Click the three-dot menu → **Custom repositories**
4. Add: `https://github.com/YOUR_GITHUB_USERNAME/overseerr-card-hacs` — Category: **Frontend**
5. Click **Download** on the Overseerr Card entry
6. Refresh your browser (hard refresh: Ctrl+Shift+R)

---

## Card Configuration

Add a **Manual card** to your Lovelace dashboard:

```yaml
type: custom:overseerr-card
overseerr_url: "http://192.168.1.100:5055"
api_key: "your_overseerr_api_key"
```

### Configuration Options

| Option | Required | Description |
|---|---|---|
| `overseerr_url` | ✅ Yes | Full URL to your Overseerr instance |
| `api_key` | ✅ Yes | Your Overseerr API key |

> Your API Key is in Overseerr under **Settings → General**

---

## Requirements

- Home Assistant with Lovelace
- A running [Overseerr](https://overseerr.dev/) instance accessible from your browser
- The [Overseerr integration](https://github.com/berserk88/overseerr-hacs) (recommended — provides sensor data shown in the card header)

---

## Notes

- The card makes API calls directly from your browser to Overseerr, so Overseerr must be reachable from the device you're viewing the dashboard on
- Poster images are loaded from `image.tmdb.org`
- If your HA is on HTTPS, Overseerr must also be on HTTPS to avoid mixed content errors
