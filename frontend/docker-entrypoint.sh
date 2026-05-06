#!/bin/sh
set -eu

node <<'NODE'
const fs = require('fs');

const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
};

fs.mkdirSync('/app/public', { recursive: true });
fs.writeFileSync(
  '/app/public/runtime-config.js',
  `window.__LEDARISE_CONFIG__ = ${JSON.stringify(config)};\n`,
);
NODE

exec "$@"
