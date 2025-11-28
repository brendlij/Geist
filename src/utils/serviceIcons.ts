// utils/serviceIcons.ts

export const DEFAULT_SERVICE_ICON = '/icons/default-service.svg'

const BASE = 'https://cdn.jsdelivr.net/gh/selfhst/icons@master/svg'

// Cache so we don’t re-fetch the same icon again
const cache = new Map<string, string>()

// HARD RESCUE for popular services
export const ALIASES: Record<string, string> = {
  // Home Assistant
  'home-assistant': 'home-assistant',
  homeassistant: 'home-assistant',
  ha: 'home-assistant',
  hass: 'home-assistant',
  'home assistant': 'home-assistant',

  // Pi-hole
  'pi-hole': 'pi-hole',
  'pi hole': 'pi-hole',
  pihole: 'pi-hole',
  pi_hole: 'pi-hole',

  // Proxmox
  proxmox: 'proxmox',
  'proxmox-ve': 'proxmox',
  'proxmox ve': 'proxmox',
  pve: 'proxmox',

  // OpenMediaVault
  omv: 'openmediavault',
  openmediavault: 'openmediavault',

  // TrueNAS
  truenas: 'truenas-core',
  'true nas': 'truenas-core',
  'truenas core': 'truenas-core',
  'truenas scale': 'truenas-core', // fallback: du hast kein scale icon

  // Unraid
  unraid: 'unraid',

  // pfSense
  pfsense: 'pfsense',
  'pf sense': 'pfsense',

  // OPNsense
  opnsense: 'opnsense',

  // UniFi
  unifi: 'ubiquiti-unifi',
  'unifi controller': 'ubiquiti-unifi',
  'unifi-os': 'ubiquiti-unifi',
  'unifi network': 'ubiquiti-unifi',
  ubiquiti: 'ubiquiti-unifi',

  // Jellyfin / Emby / Plex
  jellyfin: 'jellyfin',
  emby: 'emby',
  plex: 'plex',

  // Arr Suite
  prowlarr: 'prowlarr',
  radarr: 'radarr',
  sonarr: 'sonarr',
  bazarr: 'bazarr',
  readarr: 'readarr',
  lidarr: 'lidarr',
  whisparr: 'whisparr',
  sabnzbd: 'sabnzbd',
  nzbget: 'nzbget',

  // Torrents
  qbittorrent: 'qbittorrent',
  deluge: 'deluge',
  transmission: 'transmission',

  // Portainer / Docker
  portainer: 'portainer',
  docker: 'docker',
  watchtower: 'watchtower',

  // Network / DNS / VPN
  tailscale: 'tailscale',
  zerotier: 'zerotier',
  wireguard: 'wireguard',
  nginx: 'nginx',
  'nginx proxy manager': 'nginx-proxy-manager',

  cloudflare: 'cloudflare',
  traefik: 'traefik',
  caddy: 'caddy',

  // Cloud / Storage
  nextcloud: 'nextcloud',
  owncloud: 'owncloud',
  minio: 'minio',

  // Monitoring
  grafana: 'grafana',
  prometheus: 'prometheus',
  loki: 'loki',
  influxdb: 'influxdb',

  // Dashboards
  homer: 'homer',
  'uptime kuma': 'uptime-kuma',
  uptimekuma: 'uptime-kuma',

  // Search
  meilisearch: 'meilisearch',
  elasticsearch: 'elasticsearch',

  // Code / Git
  gitea: 'gitea',
  forgejo: 'forgejo',
  gitlab: 'gitlab',
  github: 'github',

  // Databases
  mariadb: 'mariadb',
  mysql: 'mysql',
  postgresql: 'postgresql',
  redis: 'redis',
  mongodb: 'mongodb',

  // Paperless (3 variants)
  paperless: 'paperless-ngx',
  'paperless ngx': 'paperless-ngx',
  'paperless home': 'paperless-home',

  // NOTE: PNG fallback required
  'paperless ai': 'paperless-ai', // PNG

  // Notes / Docs
  obsidian: 'obsidian',
  hedgedoc: 'hedgedoc',
  outline: 'outline',

  // Media / Photos
  photoprism: 'photoprism',
  jellyseerr: 'jellyseerr',
  overseerr: 'overseerr',
  immich: 'immich',
  seafile: 'seafile',

  // Sync / Vault
  syncthing: 'syncthing',
  vaultwarden: 'vaultwarden',
  bitwarden: 'vaultwarden',

  // Home Automation
  homebridge: 'homebridge',
  zigbee2mqtt: 'zigbee2mqtt',

  // Z-Wave JS
  // not available → icon fallback to default or PNG if added later
  zwavejs2mqtt: 'zwavejs2mqtt', // allow detection, will fallback

  // Server Tools
  navidrome: 'navidrome',
  airsonic: 'airsonic',
  cockpit: 'cockpit',
  duplicati: 'duplicati',

  // Restic (PNG only)
  restic: 'restic', // PNG fallback
}

export function slugify(input: string): string[] {
  const b = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_ ]/g, '')
    .replace(/\s+/g, ' ')

  return [
    b,
    b.replace(/ /g, ''),
    b.replace(/ /g, '-'),
    b.replace(/ /g, '_'),
    b.replace(/[-_ ]/g, ''),
  ]
}

async function tryIcon(slug: string): Promise<string | null> {
  if (!slug) return null

  const iconUrl = `${BASE}/${slug}.svg`

  try {
    const res = await fetch(iconUrl, { method: 'HEAD' })
    if (res.ok) return iconUrl
  } catch {
    // ignore
  }

  return null
}

function extractUrlSlug(url?: string): string | null {
  if (!url) return null

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    const first = host.split('.')[0] ?? '' // e.g. "homeassistant.local" → "homeassistant"
    const slug = first.toLowerCase()
    return slug || null
  } catch {
    return null
  }
}

export async function resolveServiceIcon(url?: string, name?: string): Promise<string> {
  const n = name?.toLowerCase().trim()
  const u = url ? extractUrlSlug(url) : null

  const cacheKey = n || u
  if (cacheKey && cache.has(cacheKey)) return cache.get(cacheKey)!

  const candidates: string[] = []

  // Name → candidates
  if (n) {
    candidates.push(...slugify(n))

    // Direct alias
    if (ALIASES[n]) candidates.push(ALIASES[n])
  }

  // URL → candidate
  if (u) {
    candidates.push(u)
    if (ALIASES[u]) candidates.push(ALIASES[u])
  }

  // Remove dups
  const unique = [...new Set(candidates)]

  // Try each slug
  for (const c of unique) {
    if (!c) continue

    const direct = ALIASES[c]
    if (direct) {
      const ok = await tryIcon(direct)
      if (ok) {
        cache.set(cacheKey!, ok)
        return ok
      }
    }

    const ok = await tryIcon(c)
    if (ok) {
      cache.set(cacheKey!, ok)
      return ok
    }
  }

  // Favicon fallback
  if (url) {
    try {
      const parsed = new URL(url)
      const fav = `${parsed.origin}/favicon.ico`

      cache.set(cacheKey || 'fallback', fav)
      return fav
    } catch {}
  }

  // Final fallback
  cache.set(cacheKey || 'fallback', DEFAULT_SERVICE_ICON)
  return DEFAULT_SERVICE_ICON
}
