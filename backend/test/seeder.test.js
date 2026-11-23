const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('Database Seed Data Integrity Tests (MERN)', () => {
  const initDataDir = path.join(__dirname, '../init_data');

  it('should have users.json with valid user structures and demo accounts', () => {
    const raw = fs.readFileSync(path.join(initDataDir, 'users.json'), 'utf8');
    const users = JSON.parse(raw);

    assert.ok(Array.isArray(users), 'Users must be an array');
    assert.ok(users.length >= 5, 'Should have at least 5 seeded users');

    const admin = users.find(u => u.email === 'admin@wp.pl');
    assert.ok(admin, 'Demo admin (admin@wp.pl) must exist');
    assert.strictEqual(admin.status, 'admin');

    const user = users.find(u => u.email === 'user@wp.pl');
    assert.ok(user, 'Demo user (user@wp.pl) must exist');
    assert.strictEqual(user.status, 'user');

    for (const u of users) {
      assert.ok(u.firstName && u.lastName, 'User must have name');
      assert.ok(u.email && u.email.includes('@'), 'User must have valid email');
      assert.ok(u.password && u.password.startsWith('$2'), 'User password must be bcrypt hashed');
      assert.ok(['user', 'admin'].includes(u.status), 'User status must be user or admin');
    }
  });

  it('should have posts.json with sufficient rich fishing articles', () => {
    const raw = fs.readFileSync(path.join(initDataDir, 'posts.json'), 'utf8');
    const posts = JSON.parse(raw);

    assert.ok(Array.isArray(posts), 'Posts must be an array');
    assert.ok(posts.length >= 10, 'Should have at least 10 blog posts');

    for (const post of posts) {
      assert.ok(post.title, 'Post must have title');
      assert.ok(post.content, 'Post must have content');
      assert.ok(post.short_description, 'Post must have short description');
      assert.ok(post.author, 'Post must have author');
      assert.ok(post.image_link, 'Post must have image link');
    }
  });

  it('should have reviews.json with sufficient reviews referencing existing users', () => {
    const usersRaw = fs.readFileSync(path.join(initDataDir, 'users.json'), 'utf8');
    const users = JSON.parse(usersRaw);
    const userIds = new Set(users.map(u => (u._id && u._id.$oid) ? u._id.$oid : u._id));

    const reviewsRaw = fs.readFileSync(path.join(initDataDir, 'reviews.json'), 'utf8');
    const reviews = JSON.parse(reviewsRaw);

    assert.ok(Array.isArray(reviews), 'Reviews must be an array');
    assert.ok(reviews.length >= 10, 'Should have at least 10 customer reviews');

    for (const r of reviews) {
      assert.ok(r.content && r.content.length > 5, 'Review must have substantial content');
      const authorId = (r.author && r.author.$oid) ? r.author.$oid : r.author;
      assert.ok(userIds.has(authorId), `Review author ID ${authorId} must exist in users.json`);
    }
  });
});
