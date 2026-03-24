export interface CategoryDisplayName {
  fr: string;
  ar: string;
}

export const CATEGORY_DISPLAY_NAMES: Record<string, CategoryDisplayName> = {
  'KEYBORDS': { fr: 'Clavier', ar: 'كلافيي' },
  'KEYCAPS': { fr: 'Accessoire clavier', ar: 'اكسسوار كلافيي' },
};

export function getCategoryDisplayName(
  categoryKey: string,
  language: 'fr' | 'ar',
  fallbackAr?: string
): string {
  const entry = CATEGORY_DISPLAY_NAMES[categoryKey];
  if (entry) return language === 'ar' ? entry.ar : entry.fr;
  if (language === 'ar' && fallbackAr) return fallbackAr;
  return categoryKey.charAt(0) + categoryKey.slice(1).toLowerCase();
}
