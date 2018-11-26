import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default [
{
    input: 'src/Regression.js',
    output: {
        format: 'umd',
        name: 'Regression',
        file: 'builds/Regression.js'
    }
},
{
    input: 'src/Regression.js',
    output: {
        format: 'umd',
        name: 'Regression',
        file: 'builds/Regression.min.js'
    },
    plugins: [
        uglify()
    ]
},
{
    input: 'src/Regression.js',
    output: {
        format: 'umd',
        name: 'Regression',
        file: 'builds/RegressionFull.js'
    },
    plugins: [
        resolve(),
        commonjs({
            include: 'node_modules/**'
        })
    ]
},
{
    input: 'src/Regression.js',
    output: {
        format: 'umd',
        name: 'Regression',
        file: 'builds/RegressionFull.min.js',
        sourcemap: 'inline'
    },
    plugins: [
        resolve(),
        commonjs({
            include: 'node_modules/**'
        }),
        uglify()
    ]
}];