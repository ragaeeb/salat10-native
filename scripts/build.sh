#!/usr/bin/env bash
set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
  echo ""
  echo -e "${CYAN}${BOLD}═══════════════════════════════════════════${NC}"
  echo -e "${CYAN}${BOLD}  Salat10 — Build & Deploy${NC}"
  echo -e "${CYAN}${BOLD}═══════════════════════════════════════════${NC}"
  echo ""
}

print_step() {
  echo -e "${GREEN}${BOLD}▸ $1${NC}"
}

print_warn() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
  echo -e "${RED}✖ $1${NC}"
}

check_prerequisites() {
  print_step "Checking prerequisites..."

  if ! command -v eas &>/dev/null; then
    print_error "eas-cli not found. Install it with: npm install -g eas-cli"
    exit 1
  fi

  if ! eas whoami &>/dev/null 2>&1; then
    print_error "Not logged in to EAS. Run: eas login"
    exit 1
  fi

  echo -e "  Logged in as: ${BOLD}$(eas whoami 2>/dev/null | tail -1)${NC}"
  echo ""
}

show_menu() {
  echo -e "${BOLD}Select a build target:${NC}"
  echo ""
  echo "  1) 📱  iOS Device (development build)"
  echo "  2) 🖥️   iOS Simulator (development build)"
  echo "  3) 🤖  Android Device (development build)"
  echo "  4) 📦  Preview (iOS + Android, internal distribution)"
  echo "  5) 🚀  Production (iOS + Android, store-ready)"
  echo "  6) 📋  Register a new iOS device (UDID)"
  echo "  7) 🔄  Start dev server (after installing dev build)"
  echo "  8) ❌  Exit"
  echo ""
  read -rp "Choice [1-8]: " choice
}

register_device() {
  print_step "Registering iOS device..."
  echo ""
  echo "  You'll receive a URL to open on your iPhone."
  echo "  This installs a profile that shares your device UDID with EAS."
  echo ""
  eas device:create
}

build_ios_device() {
  print_step "Building development client for iOS device..."
  echo ""
  print_warn "Make sure your device is registered (option 6) before building."
  echo ""
  read -rp "Continue? [Y/n]: " confirm
  if [[ "${confirm:-Y}" =~ ^[Nn] ]]; then
    echo "Aborted."
    return
  fi
  eas build --profile development --platform ios
  echo ""
  echo -e "${GREEN}${BOLD}✔ Build submitted!${NC}"
  echo "  Once complete, scan the QR code or open the install link on your iPhone."
  echo "  Then run: ${BOLD}bun start${NC} to connect the dev server."
}

build_ios_simulator() {
  print_step "Building development client for iOS Simulator..."
  eas build --profile development-simulator --platform ios
  echo ""
  echo -e "${GREEN}${BOLD}✔ Build submitted!${NC}"
  echo "  Once complete, the .app will be installed in your simulator."
}

build_android_device() {
  print_step "Building development client for Android..."
  eas build --profile development --platform android
  echo ""
  echo -e "${GREEN}${BOLD}✔ Build submitted!${NC}"
  echo "  Once complete, download the APK/AAB and install on your device."
  echo "  Then run: ${BOLD}bun start${NC} to connect the dev server."
}

build_preview() {
  print_step "Building preview (internal distribution)..."
  eas build --profile preview --platform all
}

build_production() {
  print_step "Building production (store-ready)..."
  read -rp "Are you sure you want to create a production build? [y/N]: " confirm
  if [[ ! "${confirm}" =~ ^[Yy] ]]; then
    echo "Aborted."
    return
  fi
  eas build --profile production --platform all
}

start_dev_server() {
  print_step "Starting Expo dev server..."
  echo "  Your dev build must already be installed on the device."
  echo "  Open the Salat10 app on your device — it will connect automatically."
  echo ""
  bun start
}

main() {
  print_header
  check_prerequisites
  show_menu

  case "$choice" in
    1) build_ios_device ;;
    2) build_ios_simulator ;;
    3) build_android_device ;;
    4) build_preview ;;
    5) build_production ;;
    6) register_device ;;
    7) start_dev_server ;;
    8) echo "Bye!" && exit 0 ;;
    *) print_error "Invalid choice." && exit 1 ;;
  esac
}

main
