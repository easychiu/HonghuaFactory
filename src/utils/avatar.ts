/**
 * Resolves the protagonist's sprite path dynamically based on age and equipped outfit.
 * 
 * Age brackets:
 * - 10-11: Child stage
 * - 12-13: Junior stage
 * - 14-15: Mid stage
 * - 16-17: Mature stage
 * 
 * Outfits:
 * - default: Daily wear
 * - dress: Royal silk dress
 * - armor: Valkyrie armor
 * - summer: Summer dress
 */
export const getAvatarPath = (age: number, outfit: string, customUrl?: string): string => {
  if (customUrl && customUrl.startsWith('data:')) {
    return customUrl;
  }
  
  let ageStage = 10;
  if (age >= 12 && age <= 13) ageStage = 12;
  else if (age >= 14 && age <= 15) ageStage = 14;
  else if (age >= 16) ageStage = 16;
  
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;

  // 若為紅花主角，路由至 honghua 系列換裝圖檔
  if (customUrl === 'honghua' || (customUrl && customUrl.includes('honghua'))) {
    return `${prefix}sprites/honghua_${ageStage}_${outfit}.png`;
  }
  
  return `${prefix}sprites/daughter_${ageStage}_${outfit}.png`;
};

export const getDaughterPersonality = (attributes: {
  strength: number;
  intelligence: number;
  morality: number;
  sensitivity: number;
  charisma: number;
}): '元氣女漢子' | '高冷學霸' | '多愁善感藝術家' | '溫柔乖乖女' | '社交名媛' | '天真少女' => {
  const { strength = 0, intelligence = 0, morality = 0, sensitivity = 0, charisma = 0 } = attributes;
  const maxVal = Math.max(strength, intelligence, morality, sensitivity, charisma);
  if (maxVal < 150) return '天真少女';
  if (maxVal === intelligence) return '高冷學霸';
  if (maxVal === strength) return '元氣女漢子';
  if (maxVal === sensitivity) return '多愁善感藝術家';
  if (maxVal === morality) return '溫柔乖乖女';
  if (maxVal === charisma) return '社交名媛';
  return '天真少女';
};

