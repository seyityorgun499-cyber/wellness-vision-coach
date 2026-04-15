import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { Plugin } from "vite";
import { handleChatRequest } from "./server/chatHandler";

const projectRoot = process.cwd();

// Myora AI Chat API — Vite geliştirme sunucusuna /api/chat endpoint'i ekler
function chatApiPlugin(): Plugin {
  return {
    name: 'myora-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        try {
          await handleChatRequest(req as any, res as any);
        } catch (err) {
          console.error('[chatApiPlugin] Unhandled error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    },
  };
}

// Capacitor Android: <script type="module" crossorigin> can silently fail in
// some WebView versions. Strip the attribute from the generated HTML.
function removeCrossorigin() {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html: string) {
      return html
        .replace(/<script([^>]*?) crossorigin(?:="[^"]*")?([^>]*)>/g, '<script$1$2>')
        .replace(/<link([^>]*?) crossorigin(?:="[^"]*")?([^>]*?) ?\/?>/g, '<link$1$2 />');
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [chatApiPlugin(), react(), removeCrossorigin()],
  envDir: projectRoot,
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "client", "src"),
      "@shared": path.resolve(projectRoot, "shared"),
      "@assets": path.resolve(projectRoot, "attached_assets"),
    },
  },
  root: path.resolve(projectRoot, "client"),
  build: {
    outDir: path.resolve(projectRoot, "dist/public"),
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // NOTE: recharts/d3 are intentionally NOT here — they are only
          // reached via React.lazy() dynamic imports in charts/* wrappers,
          // so Rollup naturally puts them in a lazy-only async chunk.
          if (id.includes('node_modules/react-dom/')) return 'vendor-react';
          if (id.includes('node_modules/react/')) return 'vendor-react';
          if (id.includes('node_modules/react-router')) return 'vendor-react';
          if (id.includes('@tanstack/react-query')) return 'vendor-query';
          if (id.includes('@supabase/')) return 'vendor-supabase';
          if (id.includes('@radix-ui/')) return 'vendor-ui';
          if (id.includes('@capacitor/')) return 'vendor-capacitor';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('node_modules/zod/')) return 'vendor-forms';
          if (id.includes('class-variance-authority') || id.includes('node_modules/clsx/') || id.includes('tailwind-merge') || id.includes('node_modules/sonner/')) return 'vendor-utils';
        },
      },
    },
  },
});
