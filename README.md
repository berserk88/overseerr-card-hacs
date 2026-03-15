# Overseerr Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/YOUR_GITHUB_USERNAME/overseerr-card-hacs.svg)](https://github.com/YOUR_GITHUB_USERNAME/overseerr-card-hacs/releases)

A custom Lovelace card for Home Assistant that provides a full graphical interface for searching, browsing, and requesting movies & TV shows through [Overseerr](https://overseerr.dev/).

> **Also install the integration:** [overseerr-hacs](https://github.com/YOUR_GITHUB_USERNAME/overseerr-hacs) — **required** for the card to function.

---

## How it works

All API calls are **proxied through the HA backend** — the integration registers a `/api/overseerr_proxy/` endpoint on Home Assistant's HTTP server and forwards requests to Overseerr server-side. The card uses `hass.fetchWithAuth()` so:

- ✅ No CORS issues (no direct browser-to-Overseerr traffic)
- ✅ No API key or URL stored in the card config
- ✅ All requests are authenticated via your HA session

---

## Preview

The card features three tabs:
- **Search** — search any movie or TV show, tap for a detail view with one-click requesting
- **Trending** — browse what's trending right now
- **Requests** — view all requests with live status indicators (Pending / Processing / Available)

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
```

That's it — no URL or API key needed in the card config. Everything is handled by the integration's proxy.

> **The Overseerr integration must be installed and configured first.** The integration registers the `/api/overseerr_proxy/` endpoint the card depends on.

---

## Requirements

- Home Assistant with Lovelace
- The [Overseerr integration](https://github.com/YOUR_GITHUB_USERNAME/overseerr-hacs) installed and configured
- A running [Overseerr](https://overseerr.dev/) instance reachable from your HA server
