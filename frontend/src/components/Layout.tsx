import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { tokens } from '../styles/tokens'

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/chat',     icon: '💬', label: 'Chat'     },
  { to: '/lessons',  icon: '📺', label: 'Lessons'  },
  { to: '/cards',    icon: '🃏', label: 'Cards'    },
  { to: '/progress', icon: '📈', label: 'Progress' },
  { to: '/notes',    icon: '📝', label: 'Notes'    },
] as const

// ─── Component ────────────────────────────────────────────────────────────────

const Layout: React.FC = () => {
  const location = useLocation()

  return (
    <div style={styles.root}>
      {/* Sidebar — desktop only */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.brandName}>Vivi</span>
          <span style={styles.brandTag}>Language, unlocked</span>
        </div>

        <nav style={styles.sideNav}>
          {NAV_ITEMS.map(({ to, icon, label }) => {
            const active = location.pathname === to
            return (
              <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                <div style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}>
                  <span style={styles.navIcon}>{icon}</span>
                  <span style={styles.navLabel}>{label}</span>
                </div>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <Outlet />
      </main>

      {/* Bottom tabs — mobile only */}
      <nav style={styles.bottomTabs}>
        {NAV_ITEMS.map(({ to, icon, label }) => {
          const active = location.pathname === to
          return (
            <NavLink key={to} to={to} style={{ textDecoration: 'none', flex: 1 }}>
              <div style={{ ...styles.tab, ...(active ? styles.tabActive : {}) }}>
                <span style={styles.tabIcon}>{icon}</span>
                <span style={styles.tabLabel}>{label}</span>
              </div>
            </NavLink>
          )
        })}
      </nav>

      <style>{responsive}</style>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const { colors, font, radius } = tokens

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    background: colors.bg.base,
    fontFamily: font.body,
    overflow: 'hidden',
  },
  sidebar: {
    width: '200px',
    flexShrink: 0,
    background: colors.bg.surface,
    borderRight: `1px solid ${colors.border.default}`,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px 12px',
    gap: '32px',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '0 8px',
  },
  brandName: {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: font.heading,
    background: colors.accent.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  brandTag: {
    fontSize: '10px',
    color: colors.text.muted,
    marginTop: '2px',
  },
  sideNav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: radius.sm,
    cursor: 'pointer',
    color: colors.text.secondary,
    fontSize: '14px',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    background: `rgba(77,159,255,0.1)`,
    color: colors.accent.blue,
    fontWeight: 500,
  },
  navIcon: {
    fontSize: '16px',
    width: '20px',
    textAlign: 'center' as const,
  },
  navLabel: {
    fontSize: '14px',
  },
  main: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  bottomTabs: {
    display: 'none',
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: colors.bg.surface,
    borderTop: `1px solid ${colors.border.default}`,
    zIndex: 100,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 0',
    color: colors.text.muted,
    gap: '3px',
  },
  tabActive: {
    color: colors.accent.blue,
  },
  tabIcon: {
    fontSize: '18px',
  },
  tabLabel: {
    fontSize: '10px',
    fontWeight: 500,
  },
} as const

const responsive = `
  @media (max-width: 768px) {
    aside { display: none !important; }
    nav[style*="fixed"] { display: flex !important; }
    main { padding-bottom: 64px; }
  }
`

export default Layout
