const PRODUCT_KEYS = [
  'OTC/Medicated Shampoos',
  'Hair Oils/Serums',
  'Topical Minoxidil',
  'Oral Minoxidil',
  'Supplements',
];

const PROCEDURE_KEYS = [
  'PRP/GFC/iPRF',
  'Stem Cells/Exosomes',
  'Hair Transplant',
  'Other',
];

const blankProduct = () => ({ used: false, duration: null, helped: null, side_effects: null });
const blankProcedure = () => ({ done: false, sessions: null, helped: null, other_detail: null });

export const initialState = {
  sex: null,
  personal_family: {
    age_hair_loss_began: null,
    duration: null,
    family_history: [],
    pattern: [],
  },
  hormonal_health: {
    diagnosed_conditions: [],
    menstrual_cycle: null,
    pregnancy_related: null,
    adult_acne_oily_skin: null,
    excess_body_facial_hair: null,
  },
  lifestyle: {
    past_6_months: [],
    habits: {
      smoking: null,
      smoking_severity: null,
      alcohol: null,
      hard_water: null,
      hair_wash_frequency: null,
      heating_tools_styling_chemicals: null,
      salon_treatments: null,
      salon_treatment_detail: null,
    },
  },
  treatments: {
    products: Object.fromEntries(PRODUCT_KEYS.map((k) => [k, blankProduct()])),
    procedures: Object.fromEntries(PROCEDURE_KEYS.map((k) => [k, blankProcedure()])),
    past_treatment_side_effects: null,
    describe: null,
  },
  sample_consent: {
    sample_type: null,
    consent: null,
  },
  _touched: {}, // Layer 1: which screens the user has interacted with — stripped before API send
};

export function intakeReducer(state, action) {
  switch (action.type) {

    case 'SET_SEX': {
      const sex = action.payload;
      return {
        ...state,
        sex,
        hormonal_health:
          sex === 'Male'
            ? {
                ...state.hormonal_health,
                menstrual_cycle: null,
                pregnancy_related: null,
                // PCOS/PCOD only applies to females — remove if present
                diagnosed_conditions: state.hormonal_health.diagnosed_conditions.filter(
                  (c) => c !== 'PCOS/PCOD'
                ),
              }
            : state.hormonal_health,
      };
    }

    case 'PATCH_PERSONAL_FAMILY':
      return {
        ...state,
        personal_family: { ...state.personal_family, ...action.payload },
      };

    case 'PATCH_HORMONAL_HEALTH':
      return {
        ...state,
        hormonal_health: { ...state.hormonal_health, ...action.payload },
      };

    case 'PATCH_LIFESTYLE':
      return {
        ...state,
        lifestyle: { ...state.lifestyle, ...action.payload },
      };

    case 'SET_HABIT': {
      // Toggle-to-No clearing rule (SKILL.md): flip to false clears dependent followup
      const { key, value } = action.payload;
      const habits = { ...state.lifestyle.habits, [key]: value };
      if (key === 'smoking' && !value) habits.smoking_severity = null;
      if (key === 'salon_treatments' && !value) habits.salon_treatment_detail = null;
      return { ...state, lifestyle: { ...state.lifestyle, habits } };
    }

    case 'SET_PRODUCT': {
      // Paired-null rule: used=false clears all sub-fields
      const { name, data } = action.payload;
      const entry = data.used
        ? { ...state.treatments.products[name], ...data }
        : blankProduct();
      return {
        ...state,
        treatments: {
          ...state.treatments,
          products: { ...state.treatments.products, [name]: entry },
        },
      };
    }

    case 'SET_PROCEDURE': {
      // Paired-null rule: done=false clears sessions/helped/other_detail
      const { name, data } = action.payload;
      const entry = data.done
        ? { ...state.treatments.procedures[name], ...data }
        : blankProcedure();
      return {
        ...state,
        treatments: {
          ...state.treatments,
          procedures: { ...state.treatments.procedures, [name]: entry },
        },
      };
    }

    case 'PATCH_TREATMENTS':
      return {
        ...state,
        treatments: { ...state.treatments, ...action.payload },
      };

    case 'PATCH_SAMPLE_CONSENT':
      return {
        ...state,
        sample_consent: { ...state.sample_consent, ...action.payload },
      };

    case 'TOUCH_SCREEN':
      return {
        ...state,
        _touched: { ...state._touched, [action.payload]: true },
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}
