/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Variable"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono Variable"', 'ui-monospace', 'monospace'],
      },
      colors: {
        papel: '#FBFBFA',
        superficie: '#FFFFFF',
        nevoa: '#F3F5F4',
        tinta: { DEFAULT: '#111917', 2: '#3A4643', 3: '#65726E', 4: '#97A39F' },
        linha: { DEFAULT: '#E5E9E7', forte: '#D2D9D6' },
        // um único acento: esmeralda = energia, atividade, ação positiva
        energia: { DEFAULT: '#0B7F5F', vivo: '#12A07A', suave: '#E6F4EE', borda: '#BFE3D4' },
        // semânticos: só para estado
        auto: { DEFAULT: '#9A5F08', suave: '#FBF1DD', borda: '#EED5A6' },
        alerta: { DEFAULT: '#C2412D', suave: '#FCEBE7', borda: '#F2C3B9' },
      },
      boxShadow: {
        difusa: '0 1px 2px rgb(17 25 23 / 0.04), 0 12px 32px -16px rgb(17 25 23 / 0.10)',
        elevada: '0 1px 2px rgb(17 25 23 / 0.05), 0 24px 56px -20px rgb(17 25 23 / 0.22)',
        interna: 'inset 0 1px 0 rgb(255 255 255 / 0.9)',
      },
      transitionTimingFunction: {
        saida: 'cubic-bezier(0.23, 1, 0.32, 1)',
        gaveta: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        respirar: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.82)' },
        },
        onda: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        brilho: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        respirar: 'respirar 2.4s ease-in-out infinite',
        onda: 'onda 2s cubic-bezier(0.23, 1, 0.32, 1) infinite',
        brilho: 'brilho 1.6s linear infinite',
      },
    },
  },
  plugins: [
    // hover só onde existe ponteiro de verdade (no toque, hover "gruda")
    ({ addVariant }) => addVariant('hover-fino', '@media (hover: hover) and (pointer: fine)'),
  ],
}
