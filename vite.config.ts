import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), mkcert()],
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
    },
    server: {
      port: 5173,
      host: '0.0.0.0', // Allow external connections
      https: false, // Enable HTTPS
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://tal.mawhub.io',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
        // Only proxy /auth in production to avoid conflicts with frontend routing in development
        ...(mode === 'production' ? {
          '/auth': {
            target: env.VITE_API_URL || 'https://tal.mawhub.io',
            changeOrigin: true,
            secure: false,
          },
        } : {}),
        '/uploads': {
          target: env.VITE_API_URL || 'https://tal.mawhub.io',
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
      chunkSizeWarningLimit: 1000, // Warn for chunks larger than 1MB
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // React and React DOM
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor';
            }
            
            // React Router
            if (id.includes('react-router')) {
              return 'router';
            }
            
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'forms';
            }
            
            // UI Libraries
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            
            if (id.includes('recharts')) {
              return 'charts';
            }
            
            // Drag and drop
            if (id.includes('@dnd-kit')) {
              return 'dnd';
            }
            
            // Rich text editor
            if (id.includes('react-quill') || id.includes('quill')) {
              return 'editor';
            }
            
            // Markdown
            if (id.includes('react-markdown')) {
              return 'markdown';
            }
            
            // PDF generation
            if (id.includes('jspdf')) {
              return 'pdf';
            }
            
            // Excel
            if (id.includes('exceljs')) {
              return 'excel';
            }
            
            // Socket.IO
            if (id.includes('socket.io')) {
              return 'socket';
            }
            
            // Axios
            if (id.includes('axios')) {
              return 'http';
            }
            
            // HTML2Canvas
            if (id.includes('html2canvas')) {
              return 'canvas';
            }
            
            // DOMPurify
            if (id.includes('dompurify')) {
              return 'sanitize';
            }
            
            // Node modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
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
