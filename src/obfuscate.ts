// Scraper-resistant contact rendering. Spam bots harvest phone numbers and
// emails by regex-scanning raw HTML (including tel:/mailto: hrefs and wa.me
// links). We never emit those in the HTML: the number is split into three
// data-attribute chunks and assembled client-side by the small inline script
// in BaseLayout, so humans see a normal tap-to-call button but bulk
// harvesters get nothing that matches a phone/email pattern.
//
// No-JS fallback: the anchors point at the contact page, where the enquiry
// form (which emails the business server-side) still works.
//
// Business email is NEVER rendered at all — the enquiry form replaces it.

function chunks(s: string): [string, string, string] {
  const a = Math.ceil(s.length / 3);
  const b = Math.ceil((2 * s.length) / 3);
  return [s.slice(0, a), s.slice(a, b), s.slice(b)];
}

// Attributes for a phone anchor. `display` is the human-readable number shown
// inside a child element marked data-v (left out for icon-only buttons).
export function telAttrs(phone: string, display?: string): Record<string, string> {
  const [k1, k2, k3] = chunks(phone);
  const out: Record<string, string> = { 'data-k1': k1, 'data-k2': k2, 'data-k3': k3 };
  if (display) {
    const [v1, v2, v3] = chunks(display);
    out['data-v1'] = v1;
    out['data-v2'] = v2;
    out['data-v3'] = v3;
  }
  return out;
}

// Attributes for a WhatsApp anchor (digits only, e.g. "447900123456").
export function waAttrs(waDigits: string): Record<string, string> {
  const [k1, k2, k3] = chunks(waDigits);
  return { 'data-k1': k1, 'data-k2': k2, 'data-k3': k3, 'data-u': 'w' };
}
