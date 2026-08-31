const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// Build the DRF-ready payload from reducer state.
// Strips internal UI keys and converts UI-only values before sending.
function buildPayload(state) {
  const { _touched, ...rest } = state;

  // Gap 4: "None of these apply" is a UI sentinel stored in the array so the
  // chip renders as selected; the API receives [] (empty = "none apply").
  const past6 = rest.lifestyle.past_6_months;
  const cleanPast6 = past6.includes('None of these apply') ? [] : past6;

  return {
    ...rest,
    lifestyle: {
      ...rest.lifestyle,
      past_6_months: cleanPast6,
    },
  };
}

export async function submitIntake(state) {
  const response = await fetch(`${API_BASE}/api/intake/submit/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPayload(state)),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error('Submission failed');
    error.errors = data;
    error.status = response.status;
    throw error;
  }

  return data; // { id, status }
}
