to build :
npm run tauri dev

# TrackShift2025 SmartTransfer — Linux Installation Guide
### (Virtual Environment + Storage-Efficient Reinstall Strategy)

> **Project:** `Fall_ak` / `alt-sendme` — Tauri v2 + Rust Core + React/Vite Frontend  
> **Stack:** Rust 1.81+, Node.js 18+, Tauri v2, React 18, Vite  
> **Linux Deps:** WebKitGTK, GTK3, libsoup, JavaScriptCore

---

## Why Tauri Eats Storage (and How to Fix It)

Tauri builds compile **all Rust dependencies from source** into `src-tauri/target/`. On a fresh machine this can reach **2–5 GB** for one build. On reinstall, it recompiles everything again unless you preserve or cache the build artifacts.

**The strategy below:**
1. Uses **`rustup`** to manage the Rust toolchain (easy version switch + uninstall)
2. Uses **`nvm`** to manage Node.js (like a virtual env for JS)
3. Uses **`sccache`** to cache compiled Rust crates across reinstalls
4. Uses a **dedicated `CARGO_HOME` directory** outside the project so you can wipe the project without losing the dependency cache

---

## Part 1 — One-Time System Prerequisites

These are installed once at the OS level and survive reinstalls.

### 1.1 — Install Tauri Linux System Dependencies

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  libxdo-dev \
  pkg-config \
  build-essential \
  curl \
  wget \
  file \
  libglib2.0-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev
```

> [!NOTE]
> On Ubuntu 22.04+, use `libwebkit2gtk-4.1-dev`. On older Ubuntu (20.04), use `libwebkit2gtk-4.0-dev` and `libsoup2.4-dev`.

---

## Part 2 — Virtual Environment Setup (Rust + Node.js)

### 2.1 — Set Up a Dedicated Workspace Directory

```bash
# Create a workspace that will hold all toolchain caches
mkdir -p ~/dev-env/cargo-home
mkdir -p ~/dev-env/rustup-home
mkdir -p ~/dev-env/sccache
```

### 2.2 — Install Rust via rustup (into your workspace)

```bash
# Point rustup to your workspace (avoids filling ~/.cargo)
export RUSTUP_HOME=~/dev-env/rustup-home
export CARGO_HOME=~/dev-env/cargo-home

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- \
  --no-modify-path \
  --default-toolchain stable \
  -y

# Load Rust into current shell
source ~/dev-env/cargo-home/env
```

### 2.3 — Add Shell Exports (Persist the Virtual Environment)

Add these lines to your `~/.bashrc` or `~/.zshrc`:

```bash
# ── TrackShift Dev Environment ─────────────────────────────────
export RUSTUP_HOME="$HOME/dev-env/rustup-home"
export CARGO_HOME="$HOME/dev-env/cargo-home"
export PATH="$CARGO_HOME/bin:$PATH"
# ───────────────────────────────────────────────────────────────
```

Then reload: `source ~/.bashrc`

### 2.4 — Verify Rust

```bash
rustc --version    # Should show 1.81+
cargo --version
```

### 2.5 — Install Tauri CLI

```bash
cargo install tauri-cli --version "^2.0"
```

### 2.6 — Install Node.js via nvm (Virtual Env for JS)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install Node.js 20 (LTS — satisfies "18+" requirement)
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version    # Should show v20.x
npm --version
```

---

## Part 3 — Install sccache (The Storage Saver)

`sccache` is a **compiler cache** for Rust. It stores compiled crate outputs so the **next time you reinstall and rebuild, it reuses the cache** instead of recompiling from scratch. This saves 1–3 GB per reinstall.

```bash
cargo install sccache

# Add to your shell exports in ~/.bashrc:
export RUSTC_WRAPPER=sccache
export SCCACHE_DIR="$HOME/dev-env/sccache"
export SCCACHE_CACHE_SIZE="10G"  # Adjust to your comfort level
```

Reload: `source ~/.bashrc`

Verify: `sccache --show-stats`

---

## Part 4 — Clone and Install the Project

```bash
cd ~/Downloads/secure_transfer   # or wherever you want the project

# The repo is already here:
# /home/shin/Downloads/secure_transfer/TrackShift2025_smarttransfer/

cd TrackShift2025_smarttransfer
```

### 4.1 — Install Frontend Dependencies

```bash
cd web-app
npm install
cd ..
```

### 4.2 — (Optional) Install Root Scripts Dependencies

```bash
# If the root package.json has scripts (sync-version.js etc.)
npm install
```

---

## Part 5 — Running the Project

### 5.1 — Development Mode (Hot Reload)

```bash
cd /home/shin/Downloads/secure_transfer/TrackShift2025_smarttransfer

# Terminal 1 — Start Vite frontend dev server
cd web-app && npm run dev
# Starts on http://localhost:1420

# Terminal 2 — Start Tauri backend (auto-launches webview)
cd src-tauri && cargo tauri dev
```

Or as a single command (Tauri auto-starts Vite via `beforeDevCommand`):

```bash
cd src-tauri
cargo tauri dev
```

### 5.2 — Production Build

```bash
cd /home/shin/Downloads/secure_transfer/TrackShift2025_smarttransfer/web-app
npm run build

cd ../src-tauri
cargo tauri build

# Output bundles:
# src-tauri/target/release/bundle/deb/   → .deb installer
# src-tauri/target/release/bundle/appimage/ → .AppImage (portable)
```

---

## Part 6 — Reinstall Without Storage Bloat

When you need to reinstall cleanly (fresh `npm install`, fresh `cargo build`), follow this order:

### 6.1 — What to Wipe (Project-Level Only)

```bash
cd /home/shin/Downloads/secure_transfer/TrackShift2025_smarttransfer

# Wipe frontend deps (100-300 MB)
rm -rf web-app/node_modules

# Wipe Tauri compiled output (2-5 GB) — but sccache preserves the work!
rm -rf src-tauri/target
```

> [!IMPORTANT]
> **Do NOT wipe `~/dev-env/`** — that's your sccache, CARGO_HOME, and rustup installation.  
> After wiping `src-tauri/target`, the next `cargo tauri build` will pull compiled crates from sccache (~minutes) instead of recompiling from source (~30-60 min).

### 6.2 — Clean Reinstall Steps

```bash
# 1. Make sure your env vars are loaded
source ~/.bashrc

# 2. Re-install frontend
cd web-app
npm install
cd ..

# 3. Rebuild Tauri app (sccache handles Rust crates)
cd src-tauri
cargo tauri dev    # or cargo tauri build
```

### 6.3 — Full Nuclear Reset (removes everything including toolchains)

Only do this if you want to start completely from scratch:

```bash
# Remove all project artifacts
rm -rf /home/shin/Downloads/secure_transfer/TrackShift2025_smarttransfer/web-app/node_modules
rm -rf /home/shin/Downloads/secure_transfer/TrackShift2025_smarttransfer/src-tauri/target

# Remove the entire dev environment (toolchains + caches)
rm -rf ~/dev-env/

# Then restart from Part 2 above
```

---

## Part 7 — Disk Usage Breakdown & Space Tips

| Directory | Typical Size | Safe to Delete? |
|---|---|---|
| `web-app/node_modules/` | 200–400 MB | ✅ Yes — `npm install` regenerates |
| `src-tauri/target/debug/` | 3–6 GB | ✅ Yes — for dev builds |
| `src-tauri/target/release/` | 1–3 GB | ✅ Yes — for prod builds |
| `~/dev-env/cargo-home/registry/` | 500 MB–1 GB | ⚠️ Keep — downloaded crate sources |
| `~/dev-env/sccache/` | Up to 10 GB | ⚠️ Keep — speeds up rebuilds |
| `~/dev-env/rustup-home/` | 1–2 GB | ⚠️ Keep — Rust toolchain |

### Quick Cleanup Commands

```bash
# Clean only debug artifacts (frees most space, keeps incremental build cache)
cd src-tauri && cargo clean --profile dev

# See what's eating space in target/
du -sh src-tauri/target/*/

# Trim sccache to 5 GB if it grew too large
sccache --zero-stats
# Edit SCCACHE_CACHE_SIZE in ~/.bashrc then restart
```

---

## Part 8 — Troubleshooting

### "WebKit not found" error

```bash
sudo apt install libwebkit2gtk-4.1-dev
# If on Ubuntu 20.04:
sudo apt install libwebkit2gtk-4.0-dev
```

### "Cannot find -lsoup-3.0" linker error

```bash
sudo apt install libsoup-3.0-dev
```

### Port 1420 already in use

```bash
kill -9 $(lsof -ti:1420)
```

### Rust version too old

```bash
rustup update stable
```

### sccache not being used (check with)

```bash
sccache --show-stats
# Should show non-zero "compile_requests_executed"
# If RUSTC_WRAPPER is not set, add it to ~/.bashrc and reload
```

### "cargo tauri" command not found

```bash
# Make sure CARGO_HOME/bin is in PATH
export PATH="$HOME/dev-env/cargo-home/bin:$PATH"
cargo tauri --version
```

---

## Quick Reference Card

```bash
# ── Initial Setup (run once) ───────────────────────────────────
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev \
  librsvg2-dev libssl-dev pkg-config build-essential curl
export RUSTUP_HOME=~/dev-env/rustup-home CARGO_HOME=~/dev-env/cargo-home
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
source ~/dev-env/cargo-home/env
cargo install tauri-cli sccache
nvm install 20 && nvm use 20

# ── Daily Dev Workflow ─────────────────────────────────────────
source ~/.bashrc
cd TrackShift2025_smarttransfer
cargo tauri dev    # starts both frontend + Tauri window

# ── Reinstall After Wipe ───────────────────────────────────────
rm -rf web-app/node_modules src-tauri/target
npm install --prefix web-app
cargo tauri dev    # sccache makes this fast!
```
