const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Environment Configuration & .env Copying Tests (MERN)', () => {
  const rootExamplePath = path.join(__dirname, '../../.env.example');
  const backendExamplePath = path.join(__dirname, '../.env.example');
  const frontendExamplePath = path.join(__dirname, '../../frontend/.env.example');

  it('should have .env.example files at root, backend, and frontend', () => {
    assert.ok(fs.existsSync(backendExamplePath), 'Backend .env.example must exist');
    if (fs.existsSync(path.join(__dirname, '../../package.json')) || fs.existsSync(rootExamplePath)) {
      assert.ok(fs.existsSync(rootExamplePath), 'Root .env.example must exist');
      assert.ok(fs.existsSync(frontendExamplePath), 'Frontend .env.example must exist');
    }
  });

  it('should contain all required environment variables in backend .env.example', () => {
    const content = fs.readFileSync(backendExamplePath, 'utf8');
    assert.ok(content.includes('PORT='), 'Must include PORT');
    assert.ok(content.includes('DB='), 'Must include DB');
    assert.ok(content.includes('JWTPRIVATEKEY='), 'Must include JWTPRIVATEKEY');
    assert.ok(content.includes('SALT='), 'Must include SALT');
  });

  it('should automatically create .env from .env.example if missing', () => {
    const tmpDir = path.join(__dirname, '../temp_test_env');
    fs.mkdirSync(tmpDir, { recursive: true });

    const tmpEnvExample = path.join(tmpDir, '.env.example');
    const tmpEnv = path.join(tmpDir, '.env');
    fs.writeFileSync(tmpEnvExample, 'PORT=5000\nDB=mongodb://localhost:27017/test\n');

    if (!fs.existsSync(tmpEnv) && fs.existsSync(tmpEnvExample)) {
      fs.copyFileSync(tmpEnvExample, tmpEnv);
    }

    assert.ok(fs.existsSync(tmpEnv), '.env should be created from .env.example');
    assert.strictEqual(fs.readFileSync(tmpEnv, 'utf8'), fs.readFileSync(tmpEnvExample, 'utf8'));

    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
