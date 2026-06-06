import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'BsDatePicker',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@radix-ui/react-popover',
        '@radix-ui/react-icons'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@radix-ui/react-popover': 'RadixPopover',
          '@radix-ui/react-icons': 'RadixIcons'
        }
      }
    }
  }
});
