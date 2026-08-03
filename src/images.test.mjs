// Tests for the build-time image optimiser's tag rewriting.
// Run with: npm test
//
// These exist because of a silent bug: the optimiser rebuilt every <img> from a
// parsed attribute map, but the parser only understood name="value" pairs.
// Astro writes its scoped-style marker bare (data-astro-cid-xxxx), so it was
// dropped on rebuild — which switched off every scoped CSS rule targeting an
// image. On a client site that meant the hero photo lost `object-fit: cover`
// and rendered at full natural height, pushing the headline ~2,100px down the
// page. Nothing errored; the page just silently looked broken.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAttrs, rebuildImgTag } from './images.mjs';

const HERO = '<img src="/images/a.jpeg" alt="A caption" class="hero-bg" loading="eager" data-astro-cid-bbe6dxrz>';

test('parseAttrs keeps valueless attributes', () => {
  const attrs = parseAttrs(HERO);
  assert.ok(attrs.has('data-astro-cid-bbe6dxrz'), 'bare attribute captured');
  assert.equal(attrs.get('data-astro-cid-bbe6dxrz'), undefined, 'stored with no value');
});

test('parseAttrs does not treat the tag name as an attribute', () => {
  const attrs = parseAttrs(HERO);
  assert.ok(!attrs.has('img'), 'tag name not captured as an attribute');
});

test('parseAttrs preserves values containing spaces and punctuation', () => {
  const attrs = parseAttrs(HERO);
  assert.equal(attrs.get('alt'), 'A caption');
  assert.equal(attrs.get('src'), '/images/a.jpeg');
  assert.equal(attrs.get('class'), 'hero-bg');
});

test('parseAttrs handles a srcset value with commas and spaces', () => {
  const tag = '<img src="/a.webp" srcset="/a-480.webp 480w, /a-960.webp 960w" sizes="100vw">';
  const attrs = parseAttrs(tag);
  assert.equal(attrs.get('srcset'), '/a-480.webp 480w, /a-960.webp 960w');
  assert.equal(attrs.get('sizes'), '100vw');
});

test('rebuildImgTag re-emits a valueless attribute bare', () => {
  const rebuilt = rebuildImgTag(parseAttrs(HERO));
  assert.ok(rebuilt.includes('data-astro-cid-bbe6dxrz'), 'scope attribute survives');
  assert.ok(!rebuilt.includes('data-astro-cid-bbe6dxrz="'), 'not given a fake value');
  assert.ok(!rebuilt.includes('undefined'), 'never writes the string "undefined"');
});

test('a full round-trip keeps every attribute of a real hero tag', () => {
  const rebuilt = rebuildImgTag(parseAttrs(HERO));
  const before = parseAttrs(HERO);
  const after = parseAttrs(rebuilt);
  assert.deepEqual([...after.keys()].sort(), [...before.keys()].sort());
  for (const [k, v] of before) assert.equal(after.get(k), v, `${k} unchanged`);
});

test('the optimiser additions do not disturb the scope attribute', () => {
  // Mirrors what optimizeDist does after parsing: set src/srcset/sizes etc.
  const attrs = parseAttrs(HERO);
  attrs.set('src', '/images/opt/a-1440.webp');
  attrs.set('srcset', '/images/opt/a-480.webp 480w, /images/opt/a-1440.webp 1440w');
  attrs.set('sizes', '100vw');
  attrs.set('width', '1440');
  attrs.set('height', '1920');
  attrs.set('decoding', 'async');
  const rebuilt = rebuildImgTag(attrs);
  assert.ok(rebuilt.includes('data-astro-cid-bbe6dxrz'), 'scope attribute still present');
  assert.ok(rebuilt.includes('alt="A caption"'), 'alt text still present');
  assert.ok(rebuilt.includes('class="hero-bg"'), 'class still present');
  assert.ok(rebuilt.startsWith('<img '), 'still a valid img tag');
});
