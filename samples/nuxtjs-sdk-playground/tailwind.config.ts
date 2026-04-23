import type { Config } from 'tailwindcss';

export default {
  content: [
    './**/*.{vue,ts,js}',
    '!./node_modules/**',
    '!./.nuxt/**',
    '!./.output/**',
  ],
  theme: {
    extend: {
      colors: {
        // Accent (brand color — orange by default, swappable per theme)
        accent: {
          50:         'var(--color-accent-50)',
          100:        'var(--color-accent-100)',
          500:        'var(--color-accent-500)',
          600:        'var(--color-accent-600)',
          700:        'var(--color-accent-700)',
          foreground: 'var(--color-accent-foreground)',
        },
        // Surfaces
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted:   'var(--color-surface-muted)',
          hover:   'var(--color-surface-hover)',
        },
        // Borders
        border: {
          DEFAULT: 'var(--color-border)',
          strong:  'var(--color-border-strong)',
        },
        // Text
        text: {
          DEFAULT: 'var(--color-text)',
          muted:   'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        // Status
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger:  'var(--color-danger)',
        // Sidebar
        sidebar: {
          bg:          'var(--color-sidebar-bg)',
          text:        'var(--color-sidebar-text)',
          'text-active': 'var(--color-sidebar-text-active)',
          hover:       'var(--color-sidebar-hover)',
          'active-bg': 'var(--color-sidebar-active-bg)',
        },
        // Code blocks
        code: {
          bg:          'var(--color-code-bg)',
          text:        'var(--color-code-text)',
          'header-bg': 'var(--color-code-header-bg)',
          'header-text': 'var(--color-code-header-text)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
    },
  },
} satisfies Config;
