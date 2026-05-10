// Medication / food-supplement interaction rules.
// Sourced from chef-doggo-project-bible.md → "P0: Medication Interaction Warnings".
//
// `medicationMatches` and `ingredientMatches` are matched case-insensitively
// against substrings. The medication input is whatever the user typed (drug
// name or class). Ingredient input is the recipe's ingredient names.

export type InteractionSeverity = 'block' | 'warning';

export interface MedicationInteraction {
  medicationMatches: string[];
  ingredientMatches: string[];
  severity: InteractionSeverity;
  // Short descriptor for the medication class, used in user-facing messages.
  medicationLabel: string;
  // Short descriptor for the risk, used in user-facing messages.
  risk: string;
}

export const MEDICATION_INTERACTIONS: MedicationInteraction[] = [
  {
    medicationLabel: 'Blood thinners',
    medicationMatches: ['warfarin', 'heparin', 'coumadin', 'blood thinner', 'anticoagulant'],
    ingredientMatches: ['fish oil', 'vitamin e', 'turmeric', 'curcumin', 'ginger'],
    severity: 'block',
    risk: 'increased bleeding risk',
  },
  {
    medicationLabel: 'Blood thinners',
    medicationMatches: ['warfarin', 'heparin', 'coumadin', 'blood thinner', 'anticoagulant'],
    ingredientMatches: ['kale', 'spinach', 'collard', 'swiss chard', 'parsley'],
    severity: 'warning',
    risk: 'high vitamin K can reduce blood-thinner effectiveness',
  },
  {
    medicationLabel: 'NSAIDs',
    medicationMatches: ['rimadyl', 'carprofen', 'metacam', 'meloxicam', 'deramaxx', 'previcox', 'firocoxib', 'nsaid'],
    ingredientMatches: ['fish oil', 'turmeric', 'curcumin'],
    severity: 'warning',
    risk: 'increased bleeding/GI risk; reduce dose or consult vet',
  },
  {
    medicationLabel: 'Heart medication (digoxin)',
    medicationMatches: ['digoxin', 'lanoxin'],
    ingredientMatches: ['hawthorn', 'licorice'],
    severity: 'block',
    risk: 'can alter digoxin blood levels — vet consultation required',
  },
  {
    medicationLabel: 'Immunosuppressants',
    medicationMatches: ['cyclosporine', 'atopica', 'azathioprine', 'mycophenolate', 'prednisone', 'immunosuppressant'],
    ingredientMatches: ['echinacea', 'astragalus'],
    severity: 'block',
    risk: 'counteracts the medication — contraindicated',
  },
  {
    medicationLabel: 'Diabetes medication (insulin)',
    medicationMatches: ['insulin', 'vetsulin', 'glargine', 'humulin', 'novolin'],
    ingredientMatches: ['turmeric', 'curcumin', 'fenugreek'],
    severity: 'warning',
    risk: 'can lower blood sugar further — monitor closely',
  },
  {
    medicationLabel: 'Thyroid medication',
    medicationMatches: ['levothyroxine', 'thyroxine', 'soloxine', 'thyro-tabs'],
    ingredientMatches: ['calcium', 'soy', 'tofu', 'edamame'],
    severity: 'warning',
    risk: 'interferes with absorption — separate dosing by 4+ hours',
  },
];

function matches(haystack: string, needles: string[]): string | null {
  const lower = haystack.toLowerCase();
  for (const n of needles) {
    if (lower.includes(n.toLowerCase())) return n;
  }
  return null;
}

export interface MedicationCheckResult {
  errors: string[];
  warnings: string[];
}

export function checkMedicationInteractions(
  medications: readonly string[],
  ingredientNames: readonly string[]
): MedicationCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of MEDICATION_INTERACTIONS) {
    const matchedMed = medications
      .map(m => matches(m, rule.medicationMatches))
      .find((hit): hit is string => hit !== null);
    if (!matchedMed) continue;

    for (const ing of ingredientNames) {
      const matchedIng = matches(ing, rule.ingredientMatches);
      if (!matchedIng) continue;

      const message = `${rule.medicationLabel} interaction: "${ing}" may cause ${rule.risk}.`;
      if (rule.severity === 'block') {
        errors.push(`${message} Remove this ingredient or consult your veterinarian before proceeding.`);
      } else {
        warnings.push(message);
      }
    }
  }

  return { errors, warnings };
}
