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
  return EMOJI_ICON[emojiOrName.trim()] || 'sparkles';
}
