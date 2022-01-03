all: lib/esm/index.js lib/cjs/index.js examples/bundle.js

lib:
	mkdir -p lib

lib/esm/index.js: lib src/index.tsx yarn.lock .babelrc tsconfig.json
	yarn run build:esm

lib/cjs/index.js: lib src/index.tsx yarn.lock .babelrc tsconfig.cjs.json
	yarn run build:cjs

examples/bundle.js: lib/esm/index.js examples/demo.tsx webpack.config.js
	./node_modules/.bin/webpack

clean:
	rm -rf lib examples/bundle.js
