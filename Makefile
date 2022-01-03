all: examples/bundle.js

lib:
	mkdir -p lib

lib/index.js: lib src/index.tsx yarn.lock .babelrc tsconfig.json
	yarn run tsc

examples/bundle.js: lib/index.js examples/demo.tsx webpack.config.js
	./node_modules/.bin/webpack

clean:
	rm -rf lib examples/bundle.js
