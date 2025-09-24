import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mkcert from 'vite-plugin-mkcert';
import type { IncomingMessage, ServerResponse } from 'http';


type ProxyLike = {
  on: (
    event: 'proxyRes',
    cb: (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => void
  ) => void;
};

export default defineConfig({
  plugins: [react(), tailwindcss(), mkcert()],
  resolve: { alias: { '@': '/src' } },
  base: '/stack1/',
  server: {
    https: {}, 
    proxy: {
      '/api': {
        target: 'https://codelang.vercel.app',
        changeOrigin: true,
        secure: true,
        configure: (proxy: ProxyLike) => {
          proxy.on('proxyRes', (proxyRes) => {
            const setCookieHeader = proxyRes.headers['set-cookie'] as string[] | undefined;
            if (Array.isArray(setCookieHeader)) {
              proxyRes.headers['set-cookie'] = setCookieHeader.map((cookie) => {
                let rewritten = cookie.replace(/;\s*Domain=[^;]+/i, '');
                rewritten = rewritten.replace(/;\s*SameSite=[^;]+/i, '');
                if (!/;\s*SameSite=/i.test(rewritten)) rewritten += '; SameSite=None';
                if (!/;\s*Secure/i.test(rewritten)) rewritten += '; Secure';
                return rewritten;
              });
            }
          });
        },
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
