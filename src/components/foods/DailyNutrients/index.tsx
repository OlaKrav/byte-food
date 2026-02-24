import { useFoodStore } from '../../../store/foodStore';
import {
  isValidKey,
  NUTRITIONAL_REQUIREMENTS_70KG,
} from '../../../constants/nutritionalRequirements';
import styles from './DailyNutrients.module.css';

const ESSENTIAL_AMINO_ACIDS = [
  { key: 'lysine', label: 'Lysine', unit: 'mg' },
  { key: 'methionine', label: 'Methionine', unit: 'mg' },
  { key: 'tryptophan', label: 'Tryptophan', unit: 'mg' },
  { key: 'leucine', label: 'Leucine', unit: 'mg' },
  { key: 'isoleucine', label: 'Isoleucine', unit: 'mg' },
  { key: 'valine', label: 'Valine', unit: 'mg' },
  { key: 'threonine', label: 'Threonine', unit: 'mg' },
  { key: 'phenylalanine', label: 'Phenylalanine', unit: 'mg' },
  { key: 'histidine', label: 'Histidine', unit: 'mg' },
] as const;

type AminoAcidItem = (typeof ESSENTIAL_AMINO_ACIDS)[number];

const VITAMINS = [
  { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg' },
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg' },
  { key: 'vitaminD', label: 'Vitamin D', unit: 'mcg' },
  { key: 'vitaminE', label: 'Vitamin E', unit: 'mg' },
  { key: 'vitaminB1', label: 'Vitamin B1', unit: 'mg' },
  { key: 'vitaminB2', label: 'Vitamin B2', unit: 'mg' },
  { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg' },
  { key: 'vitaminB9', label: 'Vitamin B9', unit: 'mcg' },
  { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg' },
] as const;

type VitaminItem = (typeof VITAMINS)[number];

const MINERALS = [
  { key: 'zinc', label: 'Zinc', unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
  { key: 'iodine', label: 'Iodine', unit: 'mcg' },
  { key: 'iron', label: 'Iron', unit: 'mg' },
  { key: 'calcium', label: 'Calcium', unit: 'mg' },
] as const;

type MineralItem = (typeof MINERALS)[number];

export const DailyNutrients = () => {
  const dailyNutrients = useFoodStore((state) => state.dailyNutrients);

  const formatValue = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
  };

  const getRequirement = (category: string, key: string): number => {
    if (
      category === 'essentialAminoAcids' &&
      isValidKey('essentialAminoAcids', key)
    ) {
      return NUTRITIONAL_REQUIREMENTS_70KG.essentialAminoAcids[key]?.value || 0;
    }
    if (category === 'vitamins' && isValidKey('vitamins', key)) {
      return NUTRITIONAL_REQUIREMENTS_70KG.vitamins[key]?.value || 0;
    }
    if (category === 'minerals' && isValidKey('minerals', key)) {
      return NUTRITIONAL_REQUIREMENTS_70KG.minerals[key]?.value || 0;
    }
    if (category === 'macronutrients' && isValidKey('macronutrients', key)) {
      const macro = NUTRITIONAL_REQUIREMENTS_70KG.macronutrients[key];
      if (macro && 'min' in macro && 'max' in macro) {
        return macro.min.value;
      }
      return (macro as { value?: number })?.value || 0;
    }
    return 0;
  };

  const getPercentage = (current: number, required: number): number => {
    if (required === 0) return 0;
    return (current / required) * 100;
  };

  const getColorClass = (percentage: number): string => {
    if (percentage < 50) return styles.red;
    if (percentage < 80) return styles.yellow;
    return styles.green;
  };

  const getVariant = (percentage: number): 'red' | 'yellow' | 'green' => {
    if (percentage < 50) return 'red';
    if (percentage < 80) return 'yellow';
    return 'green';
  };

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>Daily Nutrients</h3>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Macronutrients</h4>
        <div className={styles.blocks}>
          {[
            {
              key: 'calories',
              label: 'Calories',
              value: dailyNutrients.macronutrients.calories,
              unit: 'kcal',
              decimals: 1,
            },
            {
              key: 'protein',
              label: 'Protein',
              value: dailyNutrients.macronutrients.protein,
              unit: 'g',
              decimals: 2,
            },
            {
              key: 'fat',
              label: 'Fat',
              value: dailyNutrients.macronutrients.fat,
              unit: 'g',
              decimals: 2,
            },
            {
              key: 'carbs',
              label: 'Carbs',
              value: dailyNutrients.macronutrients.carbs,
              unit: 'g',
              decimals: 2,
            },
            {
              key: 'fiber',
              label: 'Fiber',
              value: dailyNutrients.macronutrients.fiber,
              unit: 'g',
              decimals: 2,
            },
            {
              key: 'omega3ALA',
              label: 'Omega-3 ALA',
              value: dailyNutrients.macronutrients.omega3ALA,
              unit: 'g',
              decimals: 3,
            },
            {
              key: 'water',
              label: 'Water',
              value: dailyNutrients.macronutrients.water,
              unit: 'ml',
              decimals: 1,
            },
          ].map((macro) => {
            const required = getRequirement('macronutrients', macro.key);
            const percentage = getPercentage(macro.value, required);
            const colorClass = getColorClass(percentage);
            return (
              <div key={macro.key} className={`${styles.block} ${colorClass}`} data-testid="nutrient-block" data-variant={getVariant(percentage)}>
                <div className={styles.blockLabel}>{macro.label}</div>
                <div className={styles.blockValue}>
                  {formatValue(macro.value, macro.decimals)} /{' '}
                  {formatValue(required, macro.decimals)} {macro.unit}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Essential Amino Acids</h4>
        <div className={styles.blocks}>
          {ESSENTIAL_AMINO_ACIDS.map((aminoAcid: AminoAcidItem) => {
            const value = dailyNutrients.essentialAminoAcids[aminoAcid.key];
            const required = getRequirement(
              'essentialAminoAcids',
              aminoAcid.key
            );
            const percentage = getPercentage(value, required);
            const colorClass = getColorClass(percentage);
            return (
              <div
                key={aminoAcid.key}
                className={`${styles.block} ${colorClass}`}
                data-testid="nutrient-block"
                data-variant={getVariant(percentage)}
              >
                <div className={styles.blockLabel}>{aminoAcid.label}</div>
                <div className={styles.blockValue}>
                  {formatValue(value, 2)} / {formatValue(required, 2)}{' '}
                  {aminoAcid.unit}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Vitamins</h4>
        <div className={styles.blocks}>
          {VITAMINS.map((vitamin: VitaminItem) => {
            const value = dailyNutrients.vitamins[vitamin.key];
            const required = getRequirement('vitamins', vitamin.key);
            const percentage = getPercentage(value, required);
            const colorClass = getColorClass(percentage);
            return (
              <div key={vitamin.key} className={`${styles.block} ${colorClass}`} data-testid="nutrient-block" data-variant={getVariant(percentage)}>
                <div className={styles.blockLabel}>{vitamin.label}</div>
                <div className={styles.blockValue}>
                  {formatValue(value, 3)} / {formatValue(required, 3)}{' '}
                  {vitamin.unit}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Minerals</h4>
        <div className={styles.blocks}>
          {MINERALS.map((mineral: MineralItem) => {
            const value = dailyNutrients.minerals[mineral.key];
            const required = getRequirement('minerals', mineral.key);
            const percentage = getPercentage(value, required);
            const colorClass = getColorClass(percentage);
            return (
              <div key={mineral.key} className={`${styles.block} ${colorClass}`} data-testid="nutrient-block" data-variant={getVariant(percentage)}>
                <div className={styles.blockLabel}>{mineral.label}</div>
                <div className={styles.blockValue}>
                  {formatValue(value, 2)} / {formatValue(required, 2)}{' '}
                  {mineral.unit}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
