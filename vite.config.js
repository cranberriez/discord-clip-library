import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
    base: '/discord-clip-library/',
    plugins: [
        react(),
        visualizer({
            open: true, // Automatically opens the report in your browser
            filename: './stats.html', // Output file for the report
        }),
    ],
    // build: {
    //     rollupOptions: {
    //         output: {
    //             manualChunks(id) {
    //                 if (id.includes('node_modules')) {
    //                     if (id.match(/node_modules\/react($|\/)/)) {
    //                         return 'vendor-react'; // React-related packages
    //                     }
    //                     if (id.match(/node_modules\/react-dom($|\/)/)) {
    //                         return 'vendor-react-dom'; // React-DOM
    //                     }
    //                     if (id.match(/node_modules\/lodash($|\/)/)) {
    //                         return 'vendor-lodash'; // Lodash-related packages
    //                     }
    //                     if (id.match(/node_modules\/@vidstack/)) {
    //                         return 'vidstack-vendor'; // Vidstack-related libraries
    //                     }
    //                     return 'vendor'; // Other node_modules
    //                 }
    //             },
    //         },
    //     },
    // },
})
