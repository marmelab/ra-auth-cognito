import reactRefresh from '@vitejs/plugin-react-refresh';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

const packages = fs.readdirSync(path.resolve(__dirname, '../../packages'));
const aliases = packages.map(dirName => {
    const packageJson = require(
        path.resolve(__dirname, '../../packages', dirName, 'package.json')
    );
    return {
        find: new RegExp(`^${packageJson.name}$`),
        replacement: path.resolve(
            __dirname,
            `../../packages/${packageJson.name}/src`
        ),
    };
}, {});

/**
 * https://vitejs.dev/config/
 * @type { import('vite').UserConfig }
 */
export default defineConfig({
    plugins: [reactRefresh()],
    resolve: {
        alias: [
            ...aliases,
            {
                find: /^@mui\/icons-material\/(.*)/,
                replacement: '@mui/icons-material/esm/$1',
            },
        ],
    },
    server: {
        port: 8081,
        host: '0.0.0.0',
    },
    build: {
        rollupOptions: {
            onLog: (level, log, defaultHandler) => {
                // Suppress log about module level directives, ie "use-client". Now a lot of react packages are using them.
                // The log warns about it, and says that it ignores the directive.
                if (log.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return;
                }
                defaultHandler(level, log);
            },
        },
    },
    define: { 'process.env': {} },
});
