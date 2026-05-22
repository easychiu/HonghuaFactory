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
  return `${prefix}sprites/daughter_${ageStage}_${outfit}.png`;
};
