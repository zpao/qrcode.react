SRC_DEPS = src/index.tsx src/third-party/qrcodegen/index.ts
CFG_DEPS = pnpm-lock.yaml package.json tsup.config.ts tsconfig.json
WEBSITE_DEPS = website/*.tsx website/index.html
WEBSITE_CFG_DEPS = pnpm-lock.yaml package.json website/package.json website/vite.config.ts website/tsconfig.json

.PHONY: all clean

all: lib/index.js lib/index.d.ts lib/index.d.mts lib/index.js website/dist/index.html

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

website/dist/index.html: lib/esm/index.js ${WEBSITE_DEPS} ${WEBSITE_CFG_DEPS}
	pnpm run website:build

clean:
	git clean -fX lib
	rm -rf website/dist
