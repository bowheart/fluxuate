const {rollup} = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')

const plugins = [
	babel({
		exclude: 'node_modules/**',
		presets: [
			['env', {modules: false}],
			'es2015-rollup'
		],
		plugins: [
			'transform-react-jsx',
			'transform-object-rest-spread',
			'transform-decorators-legacy',
			'transform-class-properties'
		]
	})
]

if (process.env.PRODUCTION) {
	plugins.push(uglify({
		compress: {
		pure_getters: true,
		unsafe: true,
		unsafe_comps: true,
		warnings: false,
			screw_ie8: false
		},
		mangle: {
			screw_ie8: false
		},
		output: {
			screw_ie8: false
		}
	}))
}

const config = {
	entry: 'src/index.js',
	format: 'umd',
	moduleName: 'Fluxuate',
	dest: 'dist/fluxuate.js',
	plugins,
	external: ['redux'],
	globals: {redux: 'Redux'}
}

export default config
