all: examples/bundle.js

lib:
	mkdir -p lib

lib/index.js: lib src/index.js
	./node_modules/.bin/babel src -d lib

examples/bundle.js: lib/index.js
	./node_modules/.bin/browserify -t babelify examples/demo.js -o examples/bundle.js

clean:
	rm -rf lib examples/bundle.js
