import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Frontend Configuration & Architecture Tests (React / MERN)', () => {
  const frontendDir = path.join(__dirname, '..');

  it('should have valid vite.config.js configuration', () => {
    const viteConfigPath = path.join(frontendDir, 'vite.config.js');
    assert.ok(fs.existsSync(viteConfigPath), 'vite.config.js must exist');
    const content = fs.readFileSync(viteConfigPath, 'utf8');
    assert.ok(content.includes('react()'), 'Must include React plugin in Vite config');
  });

  it('should have index.html with root container', () => {
    const htmlPath = path.join(frontendDir, 'index.html');
    assert.ok(fs.existsSync(htmlPath), 'index.html must exist');
    const content = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(content.includes('id="root"'), 'index.html must have #root element');
    assert.ok(content.includes('src/index.jsx'), 'index.html must reference entry point');
  });

  it('should have all key React components defined', () => {
    const components = ['Navbar', 'Footer', 'Home', 'Post', 'Reviews', 'Login', 'Register', 'About', 'Contact', 'Profile'];
    for (const comp of components) {
      const compPath = path.join(frontendDir, `src/components/${comp}`);
      assert.ok(fs.existsSync(compPath), `Component ${comp} should exist in src/components/`);
    }
  });

  it('should have API client configuration', () => {
    const apiPath = path.join(frontendDir, 'src/api');
    assert.ok(fs.existsSync(apiPath), 'src/api directory must exist');
  });
});
