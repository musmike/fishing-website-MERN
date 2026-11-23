const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Swagger / OpenAPI Specification Tests (MERN)', () => {
  const swaggerPath = fs.existsSync(path.join(__dirname, '../../docs/swagger.json'))
    ? path.join(__dirname, '../../docs/swagger.json')
    : path.join(__dirname, '../swagger.json');

  it('should have a valid swagger.json file in docs/ or backend/', () => {
    assert.ok(fs.existsSync(swaggerPath), 'swagger.json must exist');
    const content = fs.readFileSync(swaggerPath, 'utf8');
    const spec = JSON.parse(content);
    assert.strictEqual(typeof spec, 'object');
  });

  it('should be valid OpenAPI 3.0 specification', () => {
    const spec = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    assert.match(spec.openapi, /^3\.0\./, 'Must be OpenAPI 3.0.x');
    assert.ok(spec.info.title.includes('Fishing Website'), 'Title must be accurate');
    assert.ok(spec.info.version, 'Version must be present');
  });

  it('should contain all required endpoint paths', () => {
    const spec = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    const paths = Object.keys(spec.paths);

    assert.ok(paths.includes('/auth/register'), 'Must have /auth/register');
    assert.ok(paths.includes('/auth/login'), 'Must have /auth/login');
    assert.ok(paths.includes('/api/posts'), 'Must have /api/posts');
    assert.ok(paths.includes('/api/post/{id}'), 'Must have /api/post/{id}');
    assert.ok(paths.includes('/api/reviews'), 'Must have /api/reviews');
    assert.ok(paths.includes('/api/review'), 'Must have /api/review');
    assert.ok(paths.includes('/api/review/{id}'), 'Must have /api/review/{id}');
    assert.ok(paths.includes('/api/user'), 'Must have /api/user');
  });

  it('should configure both Bearer Token and x-access-token security schemes', () => {
    const spec = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    const schemes = spec.components.securitySchemes;

    assert.ok(schemes.bearerAuth, 'Must configure bearerAuth');
    assert.strictEqual(schemes.bearerAuth.type, 'http');
    assert.strictEqual(schemes.bearerAuth.scheme, 'bearer');

    assert.ok(schemes.ApiKeyAuth, 'Must configure ApiKeyAuth');
    assert.strictEqual(schemes.ApiKeyAuth.name, 'x-access-token');
  });
});
