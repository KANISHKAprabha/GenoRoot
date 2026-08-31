import { useReducer, useState } from 'react';
import { intakeReducer, initialState } from './state/intakeReducer';
import { submitIntake } from './api/intakeApi';

import SexGate from './components/screens/SexGate';
import HairLossTimeline from './components/screens/HairLossTimeline';
import FamilyHistory from './components/screens/FamilyHistory';
import HairLossPattern from './components/screens/HairLossPattern';
import DiagnosedConditions from './components/screens/DiagnosedConditions';
import HormonalFollowUp from './components/screens/HormonalFollowUp';
import AcneBodyHair from './components/screens/AcneBodyHair';
import LifestyleEvents from './components/screens/LifestyleEvents';
import Habits from './components/screens/Habits';
import ProductsSelector from './components/screens/ProductsSelector';
import ProceduresSelector from './components/screens/ProceduresSelector';
import SideEffectsSampleConsent from './components/screens/SideEffectsSampleConsent';
import ReviewScreen from './components/review/ReviewScreen';
import ProgressBar from './components/shared/ProgressBar';

// Which section each screen belongs to (null = meta, no section number shown)
const SCREEN_SECTION = {
  SexGate: null,
  HairLossTimeline: 'A',
  FamilyHistory: 'A',
  HairLossPattern: 'A',
  DiagnosedConditions: 'B',
  HormonalFollowUp: 'B',
  AcneBodyHair: 'B',
  LifestyleEvents: 'C',
  Habits: 'C',
  ProductsSelector: 'D',
  ProceduresSelector: 'D',
  SideEffectsSampleConsent: 'E',
};

const SECTION_NAMES = {
  A: 'Personal & Family History',
  B: 'Hormonal & Health',
  C: 'Lifestyle & Environment',
  D: 'Hair Care & Treatments',
  E: 'Sample & Consent',
};

const SECTION_ORDER = ['A', 'B', 'C', 'D', 'E'];

const SCREEN_COMPONENTS = {
  SexGate,
  HairLossTimeline,
  FamilyHistory,
  HairLossPattern,
  DiagnosedConditions,
  HormonalFollowUp,
  AcneBodyHair,
  LifestyleEvents,
  Habits,
  ProductsSelector,
  ProceduresSelector,
  SideEffectsSampleConsent,
};

// Screen 5 (HormonalFollowUp) only appears for female patients — Gap 1
function buildScreenList(sex) {
  return [
    'SexGate',
    'HairLossTimeline',
    'FamilyHistory',
    'HairLossPattern',
    'DiagnosedConditions',
    ...(sex === 'Female' ? ['HormonalFollowUp'] : []),
    'AcneBodyHair',
    'LifestyleEvents',
    'Habits',
    'ProductsSelector',
    'ProceduresSelector',
    'SideEffectsSampleConsent',
  ];
}

function SectionConfirmCard({ completedSection, nextSection, onConfirm }) {
  return (
    <div className="section-confirm-overlay">
      <div className="section-confirm-card">
        <div className="section-confirm-badge">✓</div>
        <h2 className="section-confirm-title">
          {SECTION_NAMES[completedSection]} complete ho gayi!
        </h2>
        {nextSection && (
          <p className="section-confirm-next">
            Agle section mein: <strong>{SECTION_NAMES[nextSection]}</strong>
          </p>
        )}
        <button className="btn-primary" onClick={onConfirm}>
          Aage Badho →
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(intakeReducer, initialState);
  const [screenIdx, setScreenIdx] = useState(0);
  const [confirmingSection, setConfirmingSection] = useState(null);
  const [view, setView] = useState('form'); // 'form' | 'review' | 'success'
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const screenList = buildScreenList(state.sex);
  const currentScreenName = screenList[screenIdx];
  const currentSection = SCREEN_SECTION[currentScreenName];
  const sectionNumber = currentSection ? SECTION_ORDER.indexOf(currentSection) + 1 : null;

  function handleContinue() {
    const nextIdx = screenIdx + 1;

    // Last screen done — go to review
    if (nextIdx >= screenList.length) {
      setEditMode(false);
      setView('review');
      return;
    }

    // Editing from review — skip section confirm, return straight to review
    if (editMode) {
      setEditMode(false);
      setView('review');
      return;
    }

    const nextSection = SCREEN_SECTION[screenList[nextIdx]];

    // Crossed a section boundary — show confirmation before advancing
    if (currentSection && nextSection !== currentSection) {
      setConfirmingSection(currentSection);
      return;
    }

    setScreenIdx(nextIdx);
  }

  function handleSectionConfirm() {
    setConfirmingSection(null);
    setScreenIdx(screenIdx + 1);
  }

  function handleBack() {
    if (editMode) {
      setEditMode(false);
      setView('review');
      return;
    }
    if (confirmingSection) {
      setConfirmingSection(null);
      return;
    }
    if (screenIdx > 0) {
      setScreenIdx(screenIdx - 1);
    }
  }

  // Called from ReviewScreen when patient taps Edit on a section card
  function handleEdit(screenName) {
    const idx = screenList.indexOf(screenName);
    if (idx === -1) return;
    setScreenIdx(idx);
    setEditMode(true);
    setConfirmingSection(null);
    setView('form');
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitIntake(state);
      setView('success');
    } catch (err) {
      setSubmitError(err?.errors ?? err?.message ?? 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  if (view === 'success') {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div className="section-confirm-card">
          <div className="section-confirm-badge">✓</div>
          <h2 className="section-confirm-title">Form submit ho gaya!</h2>
          <p className="section-confirm-next">
            Aapka GenoRoot intake form humein mil gaya. Team aapse jald contact karegi.
          </p>
        </div>
      </div>
    );
  }

  if (view === 'review') {
    return (
      <ReviewScreen
        state={state}
        onEdit={handleEdit}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitError={submitError}
      />
    );
  }

  if (confirmingSection) {
    const nextIdx = screenIdx + 1;
    const nextSection =
      nextIdx < screenList.length ? SCREEN_SECTION[screenList[nextIdx]] : null;
    return (
      <SectionConfirmCard
        completedSection={confirmingSection}
        nextSection={nextSection}
        onConfirm={handleSectionConfirm}
      />
    );
  }

  const CurrentScreen = SCREEN_COMPONENTS[currentScreenName];

  return (
    <div className="app">
      <ProgressBar
        section={sectionNumber}
        totalSections={5}
        sectionName={currentSection ? SECTION_NAMES[currentSection] : null}
      />
      <div className="screen-container">
        <CurrentScreen
          state={state}
          dispatch={dispatch}
          onContinue={handleContinue}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
