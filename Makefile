SRC_DEPS = src/index.tsx src/third-party/qrcodegen/index.ts
CFG_DEPS = pnpm-lock.yaml package.json tsup.config.ts tsconfig.json
EXAMPLE_DEPS = examples/*.tsx

.PHONY: all clean

all: lib/index.js lib/index.d.ts lib/index.d.mts lib/index.js examples/iife/demo.js

lib:
	mkdir -p lib

lib/index.d.ts: lib $(SRC_DEPS) $(CFG_DEPS)
	pnpm run build:code

lib/index.d.mts: lib $(SRC_DEPS) $(CFG_DEPS)
	pnpm run build:code

lib/esm/index.js: lib $(SRC_DEPS) $(CFG_DEPS)
	pnpm run build:code

lib/index.js: lib $(SRC_DEPS) $(CFG_DEPS)
	pnpm run build:code

examples/iife/demo.js: lib/esm/index.js ${EXAMPLE_DEPS}
	pnpm run build:examples

clean:
	git clean -fX lib examples
