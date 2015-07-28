all: examples/bundle.js

lib:
	mkdir -p lib

lib/index.js: lib src/index.js
	./node_modules/.bin/jsx --harmony src lib

examples/demo.js: examples/demo.jsx
	./node_modules/.bin/jsx --harmony examples/demo.jsx > examples/demo.js

examples/bundle.js: lib/index.js examples/demo.js
	./node_modules/.bin/browserify examples/demo.js -o examples/bundle.js

clean:
	rm -rf lib examples/demo.js examples/bundle.js
