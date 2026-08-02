// Emoji → Lucide icon-name map for service icons stored in site data
// (site.ts files carry e.g. icon: '🔥'). Mapping at render time means
// existing client data keeps working and every site upgrades to crisp,
// brand-coloured SVG icons without touching its data. Unknown emoji fall
// back to 'sparkles' so nothing ever renders as a raw emoji again.

const EMOJI_ICON: Record<string, string> = {
  '🔥': 'flame',
  '♨️': 'thermometer',
  '🌡️': 'thermometer',
  '🛁': 'bath',
  '💧': 'droplet',
  '🚿': 'shower-head',
  '🔧': 'wrench',
  '🛠️': 'wrench',
  '🔨': 'hammer',
  '🔌': 'plug',
  '🔋': 'battery',
  '📱': 'smartphone',
  '📲': 'smartphone',
  '💻': 'laptop',
  '💾': 'hard-drive',
  '🎮': 'gamepad-2',
  '📦': 'package',
  '📋': 'clipboard-list',
  '🧹': 'brush',
  '🪮': 'brush',
  '🧽': 'sparkles',
  '✨': 'sparkles',
  '🧺': 'shopping-basket',
  '🛋️': 'armchair',
  '🏢': 'building-2',
  '🏡': 'house',
  '🏠': 'house',
  '🚐': 'truck',
  '🌳': 'trees',
  '🌿': 'leaf',
  '🌱': 'sprout',
  '🪴': 'sprout',
  '🌸': 'flower-2',
  '🌾': 'wheat',
  '✂️': 'scissors',
  '🐾': 'paw-print',
  '🐶': 'dog',
  '🐱': 'cat',
  '🍽️': 'utensils',
  '🍕': 'utensils',
  '🛵': 'bike',
  '📞': 'phone',
  '✉️': 'mail',
  '💬': 'message-circle',
  '🕒': 'clock',
  '📍': 'map-pin',
};

export function iconNameFor(emojiOrName: string | undefined): string {
  if (!emojiOrName) return '';
  const value = emojiOrName.trim();

  const mapped = EMOJI_ICON[value];
  if (mapped) return mapped;

  // Already a Lucide icon name (lowercase, kebab-case, ASCII): pass it through
  // so site data can name an icon directly instead of going via an emoji.
  // Without this, every plain name silently became 'sparkles' despite the
  // parameter being called emojiOrName. An unrecognised NAME renders nothing
  // (Icon.astro no-ops on an unknown key), which is the existing behaviour.
  if (/^[a-z][a-z0-9-]*$/.test(value)) return value;

  // Unknown emoji: never render a raw emoji, fall back to a generic icon.
  return 'sparkles';
}
