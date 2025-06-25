# simpull-plugin-init

A simple CLI tool to scaffold a Simpull WordPress plugin with:

- Modern PHP 8.1+ structure
- GitHub-based update system (SimpullUpdater)
- Composer + NPM stubs
- GitHub Actions workflow for releases

## Usage

```bash
npx github:zao-web/simpull-plugin-init my-plugin-name
```

This will generate a directory called `my-plugin-name/` with:

* my-plugin-name.php
* includes/SimpullUpdater.php
* src/Plugin.php
* composer.json + package.json
* github/workflows/release.yml
