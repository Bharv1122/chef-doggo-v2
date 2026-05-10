export type LifeStage = 'puppy' | 'adult' | 'senior';
export type ActivityLevel = 'low' | 'moderate' | 'active' | 'very_active';
export type TexturePreference = 'soft' | 'chunky' | 'brothy' | 'dry_topper';
export type SkillLevel = 'beginner' | 'some_experience' | 'very_comfortable';

export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  ageYears: number;
  ageMonths: number;
  weightLbs: number;
  idealWeightLbs?: number;
  lifeStage: LifeStage;
  activityLevel: ActivityLevel;
  mealsPerDay: number;
  allergies: string[];
  avoidFoods: string[];
  medications: string[];
  favoriteProteins: string[];
  pickyEater: boolean;
  texturePreference: TexturePreference;
  parentSkillLevel: SkillLevel;
  createdAt: string;
  updatedAt: string;
}
