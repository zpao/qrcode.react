all: examples/bundle.js

lib:
	mkdir -p lib

lib/index.js: lib src/index.js yarn.lock .babelrc.js
	./node_modules/.bin/rollup -c

examples/bundle.js: lib/index.js examples/demo.js
	./node_modules/.bin/webpack

clean:
	rm -rf lib es examples/bundle.js
