import {defineConfig} from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [angular(), tailwindcss(), basicSsl()],
  resolve: {
    mainFields: ['browser', 'module', 'main'],
  },
});
