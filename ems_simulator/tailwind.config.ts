import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#070d1a',
        panel: '#121f35',
        panelSoft: '#1a2b46',
        border: '#2a3b5d',
        accent: '#d91f38',
        success: '#35d07f',
        warning: '#f6b73c'
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        panel: '0 12px 32px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: []
} satisfies Config;
