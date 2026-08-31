// Screen 10 — two-phase: select procedures → per-item detail cards.
// 'Other' row triggers Gap 8 (other_detail) inside ProcedureDetailCard.
import { useState } from 'react';
import ChipSelect from '../shared/ChipSelect';
import ProcedureDetailCard from './ProcedureDetailCard';
import StickyContinueButton from '../shared/StickyContinueButton';

const ALL_PROCEDURES = ['PRP/GFC/iPRF', 'Stem Cells/Exosomes', 'Hair Transplant', 'Other'];

export default function ProceduresSelector({ state, dispatch, onContinue, onBack }) {
  const [phase, setPhase] = useState('selecting');
  const [detailIdx, setDetailIdx] = useState(0);

  const procedures = state.treatments.procedures;
  const selected = ALL_PROCEDURES.filter((p) => procedures[p].done);

  function handleChipChange(newSelected) {
    ALL_PROCEDURES.forEach((name) => {
      const isNow = newSelected.includes(name);
      if (procedures[name].done !== isNow) {
        dispatch({ type: 'SET_PROCEDURE', payload: { name, data: { done: isNow } } });
      }
    });
  }

  function handleSelectContinue() {
    if (selected.length === 0) {
      onContinue();
    } else {
      setDetailIdx(0);
      setPhase('detailing');
    }
  }

  function handleDetailNext() {
    if (detailIdx + 1 < selected.length) {
      setDetailIdx((i) => i + 1);
    } else {
      onContinue();
    }
  }

  if (phase === 'detailing') {
    const name = selected[detailIdx];
    return (
      <ProcedureDetailCard
        procedureName={name}
        data={procedures[name]}
        dispatch={dispatch}
        onNext={handleDetailNext}
        isLast={detailIdx === selected.length - 1}
      />
    );
  }

  const btnLabel =
    selected.length === 0
      ? 'Koi procedure nahi — Aage Badho →'
      : `${selected.length} procedure chuney — Aage Badho →`;

  return (
    <div className="screen">
      <h2 className="screen-title">Koi hair treatment procedure karwaya?</h2>
      <p className="screen-subtitle">
        Jo karwaya ho select karein — ya seedha aage badho
      </p>

      <ChipSelect
        options={ALL_PROCEDURES}
        value={selected}
        onChange={handleChipChange}
      />

      <StickyContinueButton
        onContinue={handleSelectContinue}
        onBack={onBack}
        label={btnLabel}
      />
    </div>
  );
}
