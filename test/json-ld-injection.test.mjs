// A customer's own words end up inside a <script type="application/ld+json">
// block, inserted RAW with set:html. JSON.stringify escapes JSON syntax but not
// "</script>", so a business name carrying one closed the tag and everything
// after it became live markup on that customer's finished website.
//
// Proved in a real browser on 2026-08-06, from an order placed through the
// normal form: the injected script RAN, and the two script elements it created
// were sitting in the built page.
//
// This is the escaping that stops it. Run: npm run test:json-ld

let failed = 0;
const check = (ok, label) => {
  console.log(`  ${ok ? '✓' : '✗'} ${label}`);
  if (!ok) failed++;
};

// The same function BaseLayout.astro uses. Kept in step by the source check at
// the bottom, which fails if the component stops using it.
function jsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

console.log('\n=== structured data cannot end its own script tag ===');

const HOSTILE = [
  ['a closing script tag', '</script><script>window.pwned=1</script>'],
  ['upper case variant', '</SCRIPT><SCRIPT>window.pwned=1</SCRIPT>'],
  ['with a newline inside', '</script\n><script>window.pwned=1</script>'],
  ['an img onerror', '<img src=x onerror=alert(1)>'],
  ['an HTML comment break', '--><script>window.pwned=1</script><!--'],
];

for (const [label, payload] of HOSTILE) {
  const out = jsonLd({ '@type': 'LocalBusiness', name: `Acme ${payload}`, description: payload });
  check(!out.includes('<'), `${label}: no raw "<" survives`);
  check(!/<\/script/i.test(out), `${label}: no closing script tag survives`);
}

console.log('\n=== the data still reads back exactly ===');
for (const [, payload] of HOSTILE) {
  const original = { '@type': 'LocalBusiness', name: `Acme ${payload}`, description: payload };
  const parsed = JSON.parse(jsonLd(original));
  check(parsed.name === original.name, 'name survives the escaping unchanged');
  check(parsed.description === original.description, 'description survives unchanged');
}

console.log('\n=== ordinary content is untouched in meaning ===');
const plain = { name: "O'Brien's Garage", description: 'Servicing & MOT in Leeds' };
const back = JSON.parse(jsonLd(plain));
check(back.name === plain.name, 'apostrophes survive');
check(back.description === plain.description, 'ampersands survive');

console.log('\n=== the component actually uses it ===');
const { readFileSync } = await import('node:fs');
const { fileURLToPath } = await import('node:url');
const { dirname, join } = await import('node:path');
const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '../src/components/BaseLayout.astro'), 'utf8');
check(/set:html=\{jsonLd\(/.test(src), 'BaseLayout inserts the structured data through jsonLd()');
check(!/set:html=\{JSON\.stringify\(/.test(src), 'nothing is inserted with a bare JSON.stringify');

console.log('');
if (failed) { console.log(`❌ ${failed} check(s) failed.`); process.exit(1); }
console.log('✅ JSON-LD INJECTION CHECKS PASSED');
