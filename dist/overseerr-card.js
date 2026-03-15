/**
 * Overseerr Card for Home Assistant
 * https://github.com/berserk88/overseerr-card-hacs
 *
 * All API calls proxy through the HA backend (/api/overseerr_proxy/)
 * to avoid CORS. No credentials needed in the card config.
 */

const STATUS_MAP = {
  1: { label: "Unknown",    color: "#6b7280", icon: "❓" },
  2: { label: "Pending",    color: "#f59e0b", icon: "⏳" },
  3: { label: "Processing", color: "#3b82f6", icon: "⚙️" },
  4: { label: "Partial",    color: "#8b5cf6", icon: "◑"  },
  5: { label: "Available",  color: "#10b981", icon: "✓"  },
};

// Request approval status (separate from media availability status)
const REQ_STATUS_MAP = {
  1: { label: "Pending",   color: "#f59e0b" },
  2: { label: "Approved",  color: "#3b82f6" },
  3: { label: "Declined",  color: "#ef4444" },
  4: { label: "Available", color: "#10b981" },
};

const CARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :host {
    --os-bg: #0a0a0f;
    --os-surface: #111118;
    --os-surface2: #1a1a24;
    --os-border: rgba(255,255,255,0.07);
    --os-accent: #e85d3f;
    --os-accent2: #7c5cbf;
    --os-text: #f0eff8;
    --os-muted: #6b6a80;
    --os-card-radius: 16px;
    --os-font-display: 'Syne', sans-serif;
    --os-font-body: 'DM Sans', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .card-root {
    background: var(--os-bg); border-radius: var(--os-card-radius);
    overflow: hidden; font-family: var(--os-font-body);
    color: var(--os-text); min-height: 480px; position: relative;
  }

  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px 14px; border-bottom: 1px solid var(--os-border);
    background: linear-gradient(135deg, rgba(232,93,63,0.08) 0%, rgba(124,92,191,0.06) 100%);
  }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .header-logo {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, var(--os-accent), var(--os-accent2));
    border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 17px;
  }
  .header-title { font-family: var(--os-font-display); font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
  .header-subtitle { font-size: 11px; color: var(--os-muted); margin-top: 1px; }
  .header-stats { display: flex; gap: 12px; align-items: center; }
  .stat-pill {
    background: var(--os-surface2); border: 1px solid var(--os-border);
    border-radius: 20px; padding: 4px 10px; font-size: 11px; font-weight: 500;
    display: flex; align-items: center; gap: 5px;
  }
  .stat-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--os-accent); }

  .tabs {
    display: flex; background: var(--os-surface);
    border-bottom: 1px solid var(--os-border); padding: 0 20px; gap: 4px;
  }
  .tab-btn {
    background: none; border: none; color: var(--os-muted);
    font-family: var(--os-font-body); font-size: 12px; font-weight: 500;
    padding: 12px 14px 10px; cursor: pointer;
    border-bottom: 2px solid transparent; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px; margin-bottom: -1px; letter-spacing: 0.3px;
  }
  .tab-btn:hover { color: var(--os-text); }
  .tab-btn.active { color: var(--os-accent); border-bottom-color: var(--os-accent); }

  .search-panel { padding: 16px 20px 20px; }
  .search-bar { display: flex; gap: 8px; margin-bottom: 16px; }
  .search-input {
    flex: 1; background: var(--os-surface2); border: 1px solid var(--os-border);
    border-radius: 10px; padding: 10px 14px; color: var(--os-text);
    font-family: var(--os-font-body); font-size: 14px; outline: none; transition: border-color 0.2s;
  }
  .search-input:focus { border-color: var(--os-accent); }
  .search-input::placeholder { color: var(--os-muted); }
  .search-btn {
    background: linear-gradient(135deg, var(--os-accent), #d44f33);
    border: none; border-radius: 10px; padding: 10px 18px; color: white;
    font-family: var(--os-font-display); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: opacity 0.2s, transform 0.1s; white-space: nowrap;
  }
  .search-btn:hover { opacity: 0.9; }
  .search-btn:active { transform: scale(0.97); }
  .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .filter-row { display: flex; gap: 8px; margin-bottom: 14px; }
  .filter-chip {
    background: var(--os-surface2); border: 1px solid var(--os-border);
    border-radius: 20px; padding: 5px 13px; font-size: 12px; font-weight: 500;
    color: var(--os-muted); cursor: pointer; transition: all 0.2s;
  }
  .filter-chip.active { background: rgba(232,93,63,0.15); border-color: rgba(232,93,63,0.4); color: var(--os-accent); }

  .results-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px; max-height: 320px; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: var(--os-border) transparent;
  }
  .results-grid::-webkit-scrollbar { width: 4px; }
  .results-grid::-webkit-scrollbar-thumb { background: var(--os-border); border-radius: 2px; }

  .media-card {
    background: var(--os-surface2); border: 1px solid var(--os-border);
    border-radius: 10px; overflow: hidden; cursor: pointer; transition: all 0.2s; position: relative;
  }
  .media-card:hover { border-color: rgba(232,93,63,0.4); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
  .media-card-poster { width: 100%; aspect-ratio: 2/3; object-fit: cover; background: #1a1a24; display: block; }
  .media-card-no-poster {
    width: 100%; aspect-ratio: 2/3; background: var(--os-surface);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 28px; color: var(--os-muted); gap: 6px;
  }
  .media-card-no-poster span { font-size: 10px; text-align: center; padding: 0 8px; color: var(--os-muted); }
  .media-card-info { padding: 7px 8px; }
  .media-card-title {
    font-size: 11px; font-weight: 500; line-height: 1.3;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px;
  }
  .media-card-meta { font-size: 10px; color: var(--os-muted); display: flex; align-items: center; justify-content: space-between; }
  .media-type-badge {
    background: rgba(124,92,191,0.25); color: #b09de0; border-radius: 4px; padding: 1px 5px;
    font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .media-status-badge {
    position: absolute; top: 6px; right: 6px; border-radius: 6px; padding: 2px 6px;
    font-size: 9px; font-weight: 700; backdrop-filter: blur(8px);
  }

  .detail-panel { padding: 16px 20px; animation: slideIn 0.2s ease; }
  @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
  .detail-back {
    background: none; border: none; color: var(--os-muted); font-family: var(--os-font-body);
    font-size: 13px; cursor: pointer; padding: 0; margin-bottom: 14px;
    display: flex; align-items: center; gap: 6px; transition: color 0.2s;
  }
  .detail-back:hover { color: var(--os-text); }
  .detail-layout { display: flex; gap: 16px; margin-bottom: 16px; }
  .detail-poster { width: 110px; min-width: 110px; border-radius: 10px; overflow: hidden; }
  .detail-poster img { width: 100%; height: auto; display: block; }
  .detail-poster-placeholder {
    width: 110px; height: 165px; border-radius: 10px; background: var(--os-surface2);
    display: flex; align-items: center; justify-content: center; font-size: 32px;
  }
  .detail-info { flex: 1; }
  .detail-title { font-family: var(--os-font-display); font-size: 18px; font-weight: 700; line-height: 1.2; margin-bottom: 6px; }
  .detail-year { font-size: 13px; color: var(--os-muted); margin-bottom: 10px; }
  .detail-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .detail-badge { background: var(--os-surface2); border: 1px solid var(--os-border); border-radius: 6px; padding: 3px 8px; font-size: 11px; }
  .detail-overview {
    font-size: 12px; line-height: 1.6; color: rgba(240,239,248,0.7); margin-bottom: 16px;
    display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
  }
  .request-btn {
    width: 100%; background: linear-gradient(135deg, var(--os-accent), #d44f33);
    border: none; border-radius: 10px; padding: 12px; color: white;
    font-family: var(--os-font-display); font-size: 14px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.3px; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .request-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .request-btn:active { transform: translateY(0); }
  .request-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .request-btn.already { background: var(--os-surface2); border: 1px solid rgba(16,185,129,0.4); color: #10b981; }
  .request-btn.success { background: linear-gradient(135deg, #10b981, #059669); }

  .requests-panel { padding: 16px 20px; }
  .requests-list {
    display: flex; flex-direction: column; gap: 8px; max-height: 340px; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: var(--os-border) transparent;
  }
  .request-item {
    background: var(--os-surface2); border: 1px solid var(--os-border);
    border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; gap: 12px;
  }
  .request-thumb { width: 36px; height: 54px; border-radius: 6px; object-fit: cover; background: var(--os-surface); flex-shrink: 0; }
  .request-thumb-placeholder {
    width: 36px; height: 54px; border-radius: 6px; background: var(--os-surface);
    display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;
  }
  .request-details { flex: 1; min-width: 0; }
  .request-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
  .request-meta { font-size: 11px; color: var(--os-muted); display: flex; align-items: center; gap: 8px; }
  .status-pill {
    display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600;
    padding: 2px 7px; border-radius: 20px; flex-shrink: 0;
  }
  .status-dot { width: 5px; height: 5px; border-radius: 50%; }

  .trending-panel { padding: 16px 20px; }
  .section-label {
    font-family: var(--os-font-display); font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.5px; color: var(--os-muted); margin-bottom: 10px;
  }

  .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: var(--os-muted); gap: 12px; }
  .spinner { width: 28px; height: 28px; border: 2px solid var(--os-border); border-top-color: var(--os-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 13px; }
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; color: var(--os-muted); gap: 10px; font-size: 13px; }
  .empty-icon { font-size: 32px; }
  .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 30px 20px; gap: 8px; font-size: 12px; text-align: center; }
  .error-title { color: var(--os-accent); font-weight: 600; font-size: 13px; }
  .error-msg { color: var(--os-muted); max-width: 240px; line-height: 1.5; }
  .retry-btn {
    background: var(--os-surface2); border: 1px solid var(--os-border); border-radius: 8px;
    padding: 6px 14px; color: var(--os-text); font-family: var(--os-font-body); font-size: 12px;
    cursor: pointer; transition: border-color 0.2s; margin-top: 4px;
  }
  .retry-btn:hover { border-color: var(--os-accent); }

  .toast {
    position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%) translateY(60px);
    background: var(--os-surface2); border: 1px solid var(--os-border); border-radius: 10px;
    padding: 10px 18px; font-size: 13px; font-weight: 500; white-space: nowrap;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 10;
    pointer-events: none; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .toast.show { transform: translateX(-50%) translateY(0); }
  .toast.success { border-color: rgba(16,185,129,0.4); color: #10b981; }
  .toast.error   { border-color: rgba(232,93,63,0.4);  color: var(--os-accent); }
`;

class OverseerrCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config          = null;
    this._hass            = null;
    this._activeTab       = "search";
    this._searchResults   = [];
    this._trendingResults = [];
    this._requestsList    = [];
    this._selectedMedia   = null;
    this._searchQuery     = "";
    this._searchFilter    = "all";
    this._loading         = false;
    this._pendingCount    = 0;
    this._totalCount      = 0;
    this._initialized     = false;
    this._trendingError   = null;
    this._requestsError   = null;
    this._requestsLoading = false;
  }

  static getConfigElement() { return document.createElement("overseerr-card-editor"); }
  static getStubConfig()    { return {}; }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized && this._config) {
      this._initialized = true;
      this._loadTrending();
      this._loadRequests();
      this._updateStats();
    } else {
      this._updateStats();
    }
  }

  _updateStats() {
    if (!this._hass) return;
    const pendingEntity = Object.values(this._hass.states).find(
      (s) => s.entity_id.startsWith("sensor.overseerr") && s.entity_id.includes("pending")
    );
    const totalEntity = Object.values(this._hass.states).find(
      (s) => s.entity_id.startsWith("sensor.overseerr") && s.entity_id.includes("total")
    );
    if (pendingEntity) this._pendingCount = parseInt(pendingEntity.state) || 0;
    if (totalEntity)   this._totalCount   = parseInt(totalEntity.state)   || 0;
    this._updateHeader();
  }

  _updateHeader() {
    const p = this.shadowRoot.querySelector(".stat-pending");
    const t = this.shadowRoot.querySelector(".stat-total");
    if (p) p.textContent = this._pendingCount;
    if (t) t.textContent = this._totalCount;
  }

  // ── API proxy ─────────────────────────────────────────────────────────────
  // Routes through /api/overseerr_proxy/ on the HA server.
  // The integration's http_api.py forwards these to Overseerr server-side,
  // bypassing CORS entirely. GET requests do NOT send Content-Type headers.

  async _apiGet(path, params = {}) {
    const url = new URL("/api/overseerr_proxy" + path, window.location.origin);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const res = await this._hass.fetchWithAuth(url.pathname + url.search);
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const j = await res.json(); msg = j.message || j.error || msg; } catch {}
      throw new Error(msg);
    }
    return res.json();
  }

  async _apiPost(path, body = {}) {
    const res = await this._hass.fetchWithAuth("/api/overseerr_proxy" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const j = await res.json(); msg = j.message || j.error || msg; } catch {}
      throw new Error(msg);
    }
    return res.json();
  }

  // ── Data loaders ──────────────────────────────────────────────────────────

  async _search() {
    const input = this.shadowRoot.querySelector(".search-input");
    const query = input?.value.trim();
    if (!query) return;
    this._searchQuery   = query;
    this._loading       = true;
    this._selectedMedia = null;
    this._renderSearchResults();
    try {
      // Only pass 'query' and 'page' — Overseerr rejects unknown params with HTTP 400
      const data = await this._apiGet("/search", { query, page: 1 });
      let results = (data.results || []).filter(
        (r) => r.mediaType === "movie" || r.mediaType === "tv"
      );
      if (this._searchFilter === "movie") results = results.filter((r) => r.mediaType === "movie");
      if (this._searchFilter === "tv")    results = results.filter((r) => r.mediaType === "tv");
      this._searchResults = results;
    } catch (e) {
      this._showToast("Search failed: " + e.message, "error");
      this._searchResults = [];
    } finally {
      this._loading = false;
      this._renderSearchResults();
    }
  }

  async _loadTrending() {
    this._trendingError = null;
    try {
      const data = await this._apiGet("/discover/trending");
      this._trendingResults = (data.results || []).slice(0, 12);
    } catch (e) {
      this._trendingError = e.message;
    }
    if (this._activeTab === "trending") this._renderContent();
  }

  async _loadRequests() {
    this._requestsError   = null;
    this._requestsLoading = true;
    if (this._activeTab === "requests") this._renderContent();
    try {
      const data = await this._apiGet("/request", { take: 20, skip: 0, filter: "all" });
      const rawRequests = data.results || [];

      // Overseerr's /request endpoint only returns tmdbId + mediaType on the media
      // object — no title or poster. We enrich each entry by fetching /movie/{id}
      // or /tv/{id} in parallel (max 20 requests, batched).
      const enriched = await Promise.all(
        rawRequests.map(async (req) => {
          const media = req.media || {};
          const tmdbId = media.tmdbId;
          const mediaType = req.type || media.mediaType;
          try {
            if (tmdbId && mediaType === "movie") {
              const details = await this._apiGet(`/movie/${tmdbId}`);
              return { ...req, _details: details };
            } else if (tmdbId && mediaType === "tv") {
              const details = await this._apiGet(`/tv/${tmdbId}`);
              return { ...req, _details: details };
            }
          } catch {}
          return req;
        })
      );
      this._requestsList = enriched;
    } catch (e) {
      this._requestsError = e.message;
    } finally {
      this._requestsLoading = false;
    }
    if (this._activeTab === "requests") this._renderContent();
  }

  async _requestMedia(media) {
    const btn = this.shadowRoot.querySelector(".request-btn");
    if (btn) {
      btn.disabled  = true;
      btn.innerHTML = `<div class="spinner" style="width:18px;height:18px;margin:0 auto"></div>`;
    }
    try {
      const payload = { mediaType: media.mediaType, mediaId: media.id };
      if (media.mediaType === "tv") payload.seasons = "all";
      await this._apiPost("/request", payload);
      this._showToast(`✓ "${media.title || media.name}" requested!`, "success");
      if (btn) { btn.classList.add("success"); btn.innerHTML = `✓ Request Sent!`; }
      this._loadRequests();
    } catch (e) {
      this._showToast("Request failed: " + e.message, "error");
      if (btn) { btn.disabled = false; btn.innerHTML = `🎬 Request This`; }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  _showDetail(media) { this._selectedMedia = media; this._renderContent(); }

  _showToast(msg, type = "success") {
    const toast = this.shadowRoot.querySelector(".toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.className   = `toast ${type}`;
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
    setTimeout(() => toast.classList.remove("show"), 3500);
  }

  _posterUrl(path, size = "w300") {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
  }

  _getYear(item) {
    const d = item.releaseDate || item.firstAirDate || "";
    return d ? d.slice(0, 4) : "—";
  }

  _statusBadge(mediaInfo) {
    if (!mediaInfo) return "";
    const s = STATUS_MAP[mediaInfo.status] || STATUS_MAP[1];
    return `<div class="media-status-badge" style="background:${s.color}22;color:${s.color};border:1px solid ${s.color}44">${s.icon} ${s.label}</div>`;
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  _renderMediaCard(item) {
    const poster    = this._posterUrl(item.posterPath);
    const year      = this._getYear(item);
    const typeLabel = item.mediaType === "movie" ? "Film" : "TV";
    const noImg     = item.mediaType === "movie" ? "🎬" : "📺";
    return `
      <div class="media-card" data-id="${item.id}" data-type="${item.mediaType}">
        ${this._statusBadge(item.mediaInfo)}
        ${poster
          ? `<img class="media-card-poster" src="${poster}" alt="" loading="lazy">`
          : `<div class="media-card-no-poster">${noImg}<span>${item.title || item.name || ""}</span></div>`}
        <div class="media-card-info">
          <div class="media-card-title">${item.title || item.name || "Unknown"}</div>
          <div class="media-card-meta">
            <span>${year}</span>
            <span class="media-type-badge">${typeLabel}</span>
          </div>
        </div>
      </div>`;
  }

  _renderGrid(items, emptyMsg, errorMsg, retryKey) {
    if (errorMsg) {
      return `
        <div class="error-state">
          <div style="font-size:28px">⚠️</div>
          <div class="error-title">Could not load content</div>
          <div class="error-msg">${errorMsg}</div>
          <button class="retry-btn" data-retry="${retryKey}">↺ Retry</button>
        </div>`;
    }
    if (this._loading) {
      return `<div class="loading-state"><div class="spinner"></div><span class="loading-text">Searching...</span></div>`;
    }
    if (!items || !items.length) {
      return `<div class="empty-state"><div class="empty-icon">🔍</div>${emptyMsg}</div>`;
    }
    return `<div class="results-grid">${items.map((i) => this._renderMediaCard(i)).join("")}</div>`;
  }

  _renderDetail(media) {
    const poster      = this._posterUrl(media.posterPath, "w300");
    const year        = this._getYear(media);
    const statusInfo  = media.mediaInfo ? STATUS_MAP[media.mediaInfo.status] : null;
    const isAvailable = media.mediaInfo?.status === 5;
    const isRequested = !isAvailable && media.mediaInfo?.status >= 2;
    const btnClass    = (isAvailable || isRequested) ? "already" : "";
    const btnLabel    = isAvailable ? "✓ Already in Library"
                      : isRequested ? "⏳ Already Requested"
                      : "🎬 Request This";
    return `
      <div class="detail-panel">
        <button class="detail-back">← Back to results</button>
        <div class="detail-layout">
          <div class="detail-poster">
            ${poster
              ? `<img src="${poster}" alt="" loading="lazy">`
              : `<div class="detail-poster-placeholder">${media.mediaType === "movie" ? "🎬" : "📺"}</div>`}
          </div>
          <div class="detail-info">
            <div class="detail-title">${media.title || media.name || "Unknown"}</div>
            <div class="detail-year">${year} · ${media.mediaType === "movie" ? "Movie" : "TV Series"}</div>
            <div class="detail-badges">
              ${media.voteAverage ? `<div class="detail-badge">⭐ ${Number(media.voteAverage).toFixed(1)}</div>` : ""}
              ${statusInfo ? `<div class="detail-badge" style="color:${statusInfo.color}">${statusInfo.icon} ${statusInfo.label}</div>` : ""}
            </div>
            <div class="detail-overview">${media.overview || "No description available."}</div>
          </div>
        </div>
        <button class="request-btn ${btnClass}" ${isAvailable ? "disabled" : ""}>${btnLabel}</button>
      </div>`;
  }

  _renderSearchPanel() {
    if (this._selectedMedia) return this._renderDetail(this._selectedMedia);
    const filters = [
      { key: "all",   label: "All" },
      { key: "movie", label: "🎬 Movies" },
      { key: "tv",    label: "📺 TV" },
    ];
    return `
      <div class="search-panel">
        <div class="search-bar">
          <input class="search-input" type="text" placeholder="Search movies & TV shows..." value="${this._searchQuery}">
          <button class="search-btn">Search</button>
        </div>
        <div class="filter-row">
          ${filters.map((f) => `<div class="filter-chip ${this._searchFilter === f.key ? "active" : ""}" data-filter="${f.key}">${f.label}</div>`).join("")}
        </div>
        ${this._renderGrid(this._searchResults, "Search for movies or TV shows above", null, null)}
      </div>`;
  }

  _renderRequestsPanel() {
    if (this._requestsError) {
      return `<div class="requests-panel">${this._renderGrid([], "", this._requestsError, "requests")}</div>`;
    }
    if (this._requestsLoading) {
      return `<div class="requests-panel"><div class="loading-state"><div class="spinner"></div><span class="loading-text">Loading requests...</span></div></div>`;
    }
    if (!this._requestsList.length) {
      return `<div class="requests-panel"><div class="empty-state"><div class="empty-icon">📋</div>No requests yet</div></div>`;
    }

    const items = this._requestsList.map((req) => {
      // _details comes from the enrichment fetch (/movie/{id} or /tv/{id})
      const details = req._details || {};
      const media   = req.media   || {};
      const title   = details.title || details.name || "Unknown Title";
      const poster  = this._posterUrl(details.posterPath);
      const type    = (req.type || media.mediaType) === "movie" ? "Movie" : "TV";
      const year    = this._getYear(details);
      // Use request status (pending/approved) not media availability status
      const reqStatus = REQ_STATUS_MAP[req.status] || REQ_STATUS_MAP[1];
      const date    = req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "";
      return `
        <div class="request-item">
          ${poster
            ? `<img class="request-thumb" src="${poster}" alt="" loading="lazy">`
            : `<div class="request-thumb-placeholder">${type === "Movie" ? "🎬" : "📺"}</div>`}
          <div class="request-details">
            <div class="request-title">${title}${year !== "—" ? ` (${year})` : ""}</div>
            <div class="request-meta"><span>${type}</span>${date ? `<span>${date}</span>` : ""}</div>
          </div>
          <div class="status-pill" style="background:${reqStatus.color}18;color:${reqStatus.color}">
            <div class="status-dot" style="background:${reqStatus.color}"></div>
            ${reqStatus.label}
          </div>
        </div>`;
    });
    return `<div class="requests-panel"><div class="requests-list">${items.join("")}</div></div>`;
  }

  _renderTrendingPanel() {
    return `
      <div class="trending-panel">
        <div class="section-label">Trending Now</div>
        ${this._renderGrid(this._trendingResults, "No trending content available", this._trendingError, "trending")}
      </div>`;
  }

  _renderContent() {
    const panel = this.shadowRoot.querySelector(".tab-content");
    if (!panel) return;
    switch (this._activeTab) {
      case "search":
        panel.innerHTML = this._renderSearchPanel();
        this._attachSearchListeners();
        break;
      case "requests":
        panel.innerHTML = this._renderRequestsPanel();
        this._attachRetryListeners();
        break;
      case "trending":
        panel.innerHTML = this._renderTrendingPanel();
        this._attachMediaCardListeners();
        this._attachRetryListeners();
        break;
    }
  }

  _renderSearchResults() {
    if (this._activeTab !== "search") return;
    const panel = this.shadowRoot.querySelector(".tab-content");
    if (!panel) return;
    panel.innerHTML = this._renderSearchPanel();
    this._attachSearchListeners();
  }

  // ── Listeners ─────────────────────────────────────────────────────────────

  _attachSearchListeners() {
    const root  = this.shadowRoot;
    const btn   = root.querySelector(".search-btn");
    const input = root.querySelector(".search-input");
    btn?.addEventListener("click",    () => this._search());
    input?.addEventListener("keydown", (e) => { if (e.key === "Enter") this._search(); });

    root.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        this._searchFilter = chip.dataset.filter;
        if (this._searchQuery) this._search();
        else {
          root.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");
        }
      });
    });

    root.querySelector(".detail-back")?.addEventListener("click", () => {
      this._selectedMedia = null; this._renderContent();
    });

    const reqBtn = root.querySelector(".request-btn");
    if (reqBtn && this._selectedMedia && !reqBtn.disabled) {
      reqBtn.addEventListener("click", () => this._requestMedia(this._selectedMedia));
    }

    this._attachMediaCardListeners();
  }

  _attachMediaCardListeners() {
    this.shadowRoot.querySelectorAll(".media-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id    = parseInt(card.dataset.id);
        const type  = card.dataset.type;
        const all   = [...this._searchResults, ...this._trendingResults];
        const media = all.find((m) => m.id === id && m.mediaType === type);
        if (media) { this._activeTab = "search"; this._updateTabs(); this._showDetail(media); }
      });
    });
  }

  _attachRetryListeners() {
    this.shadowRoot.querySelectorAll(".retry-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.retry === "trending") {
          this._trendingError = null; this._trendingResults = [];
          this._renderContent(); this._loadTrending();
        }
        if (btn.dataset.retry === "requests") {
          this._requestsError = null; this._requestsList = [];
          this._renderContent(); this._loadRequests();
        }
      });
    });
  }

  _updateTabs() {
    this.shadowRoot.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === this._activeTab);
    });
  }

  // ── Root render ───────────────────────────────────────────────────────────

  _render() {
    const tabs = [
      { key: "search",   icon: "🔍", label: "Search"   },
      { key: "trending", icon: "🔥", label: "Trending"  },
      { key: "requests", icon: "📋", label: "Requests"  },
    ];
    this.shadowRoot.innerHTML = `
      <style>${CARD_STYLES}</style>
      <div class="card-root">
        <div class="card-header">
          <div class="header-left">
            <div class="header-logo">🎬</div>
            <div>
              <div class="header-title">Overseerr</div>
              <div class="header-subtitle">Media Request Center</div>
            </div>
          </div>
          <div class="header-stats">
            <div class="stat-pill">
              <div class="dot" style="background:#f59e0b"></div>
              <span class="stat-pending">${this._pendingCount}</span> pending
            </div>
            <div class="stat-pill">
              <div class="dot"></div>
              <span class="stat-total">${this._totalCount}</span> total
            </div>
          </div>
        </div>
        <div class="tabs">
          ${tabs.map((t) => `
            <button class="tab-btn ${this._activeTab === t.key ? "active" : ""}" data-tab="${t.key}">
              <span>${t.icon}</span>${t.label}
            </button>`).join("")}
        </div>
        <div class="tab-content"></div>
        <div class="toast"></div>
      </div>`;

    this.shadowRoot.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._activeTab     = btn.dataset.tab;
        this._selectedMedia = null;
        this._updateTabs();
        this._renderContent();
        if (this._activeTab === "requests" && !this._requestsList.length && !this._requestsLoading) this._loadRequests();
        if (this._activeTab === "trending" && !this._trendingResults.length && !this._trendingError)  this._loadTrending();
      });
    });

    this._renderContent();
  }

  getCardSize() { return 5; }
}

customElements.define("overseerr-card", OverseerrCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        "overseerr-card",
  name:        "Overseerr Card",
  description: "Search and request movies & TV shows via Overseerr",
  preview:     true,
});
