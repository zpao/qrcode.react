all: examples/bundle.js

index.js: index.jsx
	./node_modules/.bin/jsx --harmony index.jsx > index.js

examples/demo.js: examples/demo.jsx
	./node_modules/.bin/jsx --harmony examples/demo.jsx > examples/demo.js

examples/bundle.js: index.js examples/demo.js
	./node_modules/.bin/browserify examples/demo.js -o examples/bundle.js
