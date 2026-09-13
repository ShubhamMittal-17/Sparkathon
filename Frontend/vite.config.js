import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During `npm run dev`, proxy API calls to the Node gateway (5000) so the
// frontend can use same-origin relative URLs in both dev and production.
const api = 'http://localhost:5000';
const proxy = Object.fromEntries(
  ['/all-products', '/similar', '/save-layout', '/layout', '/api',
   '/add-item', '/remove-item', '/get-cart'].map((p) => [p, api])
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy },
})
