SRC_DEPS = src/index.tsx src/third-party/qrcodegen/index.ts
CFG_DEPS = yarn.lock package.json tsup.config.ts

all: lib/index.js lib/index.d.ts lib/index.js examples/iife/demo.js

lib:
	mkdir -p lib

lib/index.d.ts: lib $(SRC_DEPS) $(CFG_DEPS)
	yarn run build:code

lib/esm/index.js: lib $(SRC_DEPS) $(CFG_DEPS)
	yarn run build:code

lib/index.js: lib $(SRC_DEPS) $(CFG_DEPS)
	yarn run build:code

examples/iife/demo.js: lib/esm/index.js examples/demo.tsx
	yarn run build:examples

clean:
	rm -rf lib examples/iife/demo.js
