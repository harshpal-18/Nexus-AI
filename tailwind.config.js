/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // ── Surfaces (map to CSS vars in index.css) ───────
        'surface':     'var(--surface)',
        'surface-50':  'var(--surface)',
        'surface-100': 'var(--surface)',
        'surface-200': 'var(--surface-2)',
        'surface-300': 'var(--surface-3)',
        'surface-400': 'var(--surface-4)',
        'surface-500': 'var(--surface-5)',

        // ── Accents ───────────────────────────────────────
        'accent-blue':         'var(--accent)',
        'accent-blue-light':   'var(--accent-light)',
        'accent-blue-soft':    'rgba(37, 99, 235, 0.08)',
        'accent-blue-border':  'rgba(37, 99, 235, 0.15)',
        'accent-green':        'var(--accent-green)',
        'accent-green-soft':   'rgba(34, 197, 94, 0.08)',
        'accent-green-border': 'rgba(34, 197, 94, 0.15)',
        'accent-amber':        '#F59E0B',
        'accent-red':          '#EF4444',
        'accent-purple':       '#8B5CF6',

        // ── Borders ───────────────────────────────────────
        'border':       'var(--border)',
        'border-hover': 'var(--border-hover)',

        // ── Text ──────────────────────────────────────────
        'text-primary':   'var(--text-1)',
        'text-secondary': 'var(--text-2)',
        'text-tertiary':  'var(--text-3)',
        'text-muted':     'var(--text-4)',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card':     'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
      },
    },
  },
  plugins: [],
}