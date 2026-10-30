// Lightweight Svelte 5 SPA router store using runes

function normalizePath(rawPath: string): string {
  if (!rawPath) return '/'
  // Strip trailing slashes unless root
  let path = rawPath.replace(/\/+$/, '') || '/'
  
  // Case-insensitive mapping for existing legacy routes
  const lower = path.toLowerCase()
  if (lower === '/toolbox') return '/Toolbox'
  if (lower === '/experience') return '/Experience'
  if (lower === '/photography') return '/Photography'
  if (lower === '/favoritebooks') return '/FavoriteBooks'
  if (lower === '/birdwatch') return '/BirdWatch'
  if (lower === '') return '/'
  return path
}

class Router {
  currentPath = $state(typeof window !== 'undefined' ? normalizePath(window.location.pathname) : '/')

  constructor() {
    if (typeof window !== 'undefined') {
      // Ensure initial canonical URL if needed
      const canonical = normalizePath(window.location.pathname)
      if (canonical !== window.location.pathname) {
        window.history.replaceState({}, '', canonical)
      }

      window.addEventListener('popstate', () => {
        this.currentPath = normalizePath(window.location.pathname)
      })

      // Intercept internal link clicks
      window.addEventListener('click', (e: MouseEvent) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
          return
        }

        const target = (e.target as Element)?.closest('a')
        if (!target) return

        const href = target.getAttribute('href')
        const targetAttr = target.getAttribute('target')

        if (targetAttr && targetAttr !== '_self') return
        if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('#')) {
          return
        }

        e.preventDefault()
        this.navigate(href)
      })
    }
  }

  navigate(path: string) {
    const target = normalizePath(path)
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', target)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    this.currentPath = target
  }
}

export const router = new Router()
