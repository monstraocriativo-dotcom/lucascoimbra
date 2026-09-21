import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        curriculo: resolve(__dirname, 'curriculo/index.html'),
        portfolio: resolve(__dirname, 'portfolio/index.html'),
        portfolioRedirect: resolve(__dirname, 'portfolio/portfolio.html'),
        sobral: resolve(__dirname, 'portfolio/sobral/index.html'),
        sobral2024: resolve(__dirname, 'portfolio/sobral 2024/index.html'),
        sobral2025: resolve(__dirname, 'portfolio/sobral 2025/index.html'),
        casapatri: resolve(__dirname, 'portfolio/Casapatri/index.html'),
        cukkaPower: resolve(__dirname, 'portfolio/cukka power/index.html'),
        dheka: resolve(__dirname, 'portfolio/Dheka/index.html'),
        evolugain: resolve(__dirname, 'portfolio/evolugain/index.html'),
        inserir: resolve(__dirname, 'portfolio/inserir/index.html'),
        kingston: resolve(__dirname, 'portfolio/kingston/index.html'),
        postersVariados: resolve(__dirname, 'portfolio/posters variados/index.html'),
        thumbnails: resolve(__dirname, 'portfolio/thumbnails variadas/index.html'),
        videos: resolve(__dirname, 'portfolio/vinci/videos.html'),
        videosRedirect: resolve(__dirname, 'videos.html'),
        sobralRedirect: resolve(__dirname, 'sobral2026.html')
      }
    }
  }
});
