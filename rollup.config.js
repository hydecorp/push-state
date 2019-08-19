import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';

export default {
    input: 'src/components/hy-push-state/index.ts',
    output: {
        file: `docs/assets/hy-push-state.js`,
        format: 'es',
        sourcemap: true
    },
    plugins: [
        typescript(),
        resolve(),
        commonjs(),
    ],
};