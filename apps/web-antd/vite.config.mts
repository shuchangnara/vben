import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // 平安测试环境代理
            // target: 'https://autoheavytruck-sit.pingan.com.cn',
            // mock代理
            target: 'http://localhost:5320/api',

            ws: true,
          },
        },
      },
    },
  };
});
