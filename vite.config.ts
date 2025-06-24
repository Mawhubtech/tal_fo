import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    esbuild: {
      // Disable type checking during build for production
      target: 'es2020',
      logOverride: { 
        'this-is-undefined-in-esm': 'silent',
        'typescript': 'silent'
      },
      // Skip type checking completely for production builds
      tsconfigRaw: mode === 'production' ? {
        compilerOptions: {
          skipLibCheck: true,
          noEmit: false,
          strict: false,
          noUnusedLocals: false,
          noUnusedParameters: false,
          exactOptionalPropertyTypes: false
        }
      } : undefined
    },    server: {
      port: 5173,
      host: '0.0.0.0', // Allow external connections
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
        // Only proxy /auth in production to avoid conflicts with frontend routing in development
        ...(mode === 'production' ? {
          '/auth': {
            target: env.VITE_API_URL || 'http://localhost:3000',
            changeOrigin: true,
            secure: false,
          },
        } : {}),
        '/uploads': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild', // Faster than terser
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['framer-motion', 'lucide-react'],
          },
        },
        onwarn(warning, warn) {
          // Suppress TypeScript warnings
          if (warning.code === 'TYPESCRIPT_ERROR') return;
          warn(warning);
        },
      },
    },
  };
});
