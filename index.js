#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const path = require('path');

const pluginName = process.argv[2];
if (!pluginName) {
  console.error("❌ Usage: simpull-plugin-init <plugin-name>");
  process.exit(1);
}

const pluginDir = path.join(process.cwd(), pluginName);
if (fs.existsSync(pluginDir)) {
  console.error(`❌ Directory ${pluginName} already exists.`);
  process.exit(1);
}

// Create folders
['', 'includes', 'src', 'assets', '.github/workflows'].forEach(folder =>
  fs.mkdirSync(path.join(pluginDir, folder), { recursive: true })
);

// Download SimpullUpdater.php
https.get('https://raw.githubusercontent.com/zao-web/simpull-updater/main/SimpullUpdater.php', res => {
  const dest = fs.createWriteStream(path.join(pluginDir, 'includes', 'SimpullUpdater.php'));
  res.pipe(dest);
});

// Main plugin file
const pluginMain = `<?php
/**
 * Plugin Name: ${pluginName.replace(/-/g, ' ')}
 * Description: A Simpull plugin scaffold.
 * Version: 0.1.0
 * Requires PHP: 8.1
 * Author: Simpull
 */

declare(strict_types=1);

require_once __DIR__ . '/includes/SimpullUpdater.php';

new SimpullUpdater(__FILE__, '${pluginName}/${pluginName}.php', 'simpull/${pluginName}');
`;
fs.writeFileSync(path.join(pluginDir, `${pluginName}.php`), pluginMain);

// src/Plugin.php
const pluginClass = `<?php
declare(strict_types=1);

namespace Simpull\\${pluginName.replace(/-/g, '')};

class Plugin {
    public function run(): void {
        // Plugin bootstrap logic
    }
}
`;
fs.writeFileSync(path.join(pluginDir, 'src', 'Plugin.php'), pluginClass);

// composer.json
const composer = {
  name: `simpull/${pluginName}`,
  type: "wordpress-plugin",
  require: {
    "php": "^8.1"
  },
  autoload: {
    "psr-4": {
      "Simpull\\": "src/"
    }
  }
};
fs.writeFileSync(path.join(pluginDir, 'composer.json'), JSON.stringify(composer, null, 2));

// package.json
const pkg = {
  name: pluginName,
  version: "0.1.0",
  scripts: {
    build: "echo 'Add build scripts here'"
  }
};
fs.writeFileSync(path.join(pluginDir, 'package.json'), JSON.stringify(pkg, null, 2));

// GitHub Actions workflow
const workflow = `name: Build and Release
on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Dependencies
        run: |
          npm ci
          composer install --no-dev --optimize-autoloader
      - name: Zip Plugin
        run: |
          zip -r ${pluginName}.zip . -x '*.git*' '*.github*'
      - name: Upload Release Asset
        uses: softprops/action-gh-release@v1
        with:
          files: ${pluginName}.zip
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
fs.writeFileSync(path.join(pluginDir, '.github/workflows/release.yml'), workflow);

console.log(`✅ ${pluginName} scaffolded successfully.`);
