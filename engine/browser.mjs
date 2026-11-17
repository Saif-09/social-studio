// Launches Chrome if installed (Mac), else Playwright's bundled Chromium (Linux/WSL: run `npx playwright install chromium` once).
import { chromium } from 'playwright';
export async function launch() {
  try { return await chromium.launch({ channel: 'chrome' }); } catch { return await chromium.launch(); }
}
