const { describe, it } = require('node:test');
const assert = require('node:assert');

if (!process.env.JWTPRIVATEKEY) {
  process.env.JWTPRIVATEKEY = 'test_secret_key_123';
}

const Module = require('node:module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'jsonwebtoken') {
    try {
      const realJwt = originalRequire.apply(this, arguments);
      return {
        sign: (payload, secret) => realJwt.sign(payload, secret || process.env.JWTPRIVATEKEY),
        verify: (token, secret, cb) => realJwt.verify(token, secret || process.env.JWTPRIVATEKEY, cb)
      };
    } catch (e) {
      return {
        sign: (payload) => 'mock.valid.token',
        verify: (token, secret, cb) => {
          if (!token || token.includes('invalid')) {
            return cb(new Error('Invalid token'));
          }
          return cb(null, {
            _id: '666dabc152c685d02114826a',
            status: 'admin',
            name: 'Michał Adminowski'
          });
        }
      };
    }
  }
  return originalRequire.apply(this, arguments);
};

const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/authMiddleware');

const createMockRes = () => {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    }
  };
};

describe('Auth Middleware Token Extraction Tests (MERN)', () => {
  const validToken = jwt.sign(
    { _id: '666dabc152c685d02114826a', status: 'admin', name: 'Michał Adminowski' },
    process.env.JWTPRIVATEKEY
  );

  it('should reject request when no token is provided with 403', () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    authenticateToken(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.body.message, 'Nie dostarczono tokena!');
  });

  it('should authenticate correctly with Authorization: Bearer <token>', () => {
    const req = {
      headers: {
        authorization: `Bearer ${validToken}`
      }
    };
    const res = createMockRes();
    let nextCalled = false;

    authenticateToken(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.ok(req.user);
    assert.strictEqual(req.user._id, '666dabc152c685d02114826a');
    assert.strictEqual(req.user.status, 'admin');
  });

  it('should authenticate correctly with x-access-token header', () => {
    const req = {
      headers: {
        'x-access-token': validToken
      }
    };
    const res = createMockRes();
    let nextCalled = false;

    authenticateToken(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.ok(req.user);
    assert.strictEqual(req.user.name, 'Michał Adminowski');
  });

  it('should reject invalid token with 401', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid_garbage_token'
      }
    };
    const res = createMockRes();
    let nextCalled = false;

    authenticateToken(req, res, () => { nextCalled = true; });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(res.body.message, 'Token niepoprawny, brak autoryzacji!');
  });
});
