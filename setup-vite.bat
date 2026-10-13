@echo off
echo Setting up Vite/React structure...

rem Install bun if not present
where bun >nul 2>&1 || (
  powershell -c "irm bun.sh/install.ps1 | iex"
)

rem Create new package.json
echo { > package.json
echo   "name": "zarpay", >> package.json
echo   "private": true, >> package.json
echo   "version": "1.0.0", >> package.json
echo   "type": "module", >> package.json
echo   "scripts": { >> package.json
echo     "dev": "vite", >> package.json
echo     "build": "tsc -b && vite build", >> package.json
echo     "preview": "vite preview", >> package.json
echo     "check": "tsc --noEmit" >> package.json
echo   } >> package.json
echo } >> package.json

echo Done. Now install dependencies.
