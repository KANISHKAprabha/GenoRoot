// Screen 9 — two-phase: select products → per-item detail cards.
// Unselected products keep used:false (paired-null rule handled in reducer).
import { useState } from 'react';
import ChipSelect from '../shared/ChipSelect';
import ProductDetailCard from './ProductDetailCard';
import StickyContinueButton from '../shared/StickyContinueButton';

const ALL_PRODUCTS = [
  'OTC/Medicated Shampoos',
  'Hair Oils/Serums',
  'Topical Minoxidil',
  'Oral Minoxidil',
  'Supplements',
];

export default function ProductsSelector({ state, dispatch, onContinue, onBack }) {
  const [phase, setPhase] = useState('selecting');
  const [detailIdx, setDetailIdx] = useState(0);

  const products = state.treatments.products;
  const selected = ALL_PRODUCTS.filter((p) => products[p].used);

  function handleChipChange(newSelected) {
    ALL_PRODUCTS.forEach((name) => {
      const isNow = newSelected.includes(name);
      if (products[name].used !== isNow) {
        dispatch({ type: 'SET_PRODUCT', payload: { name, data: { used: isNow } } });
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
      <ProductDetailCard
        productName={name}
        data={products[name]}
        dispatch={dispatch}
        onNext={handleDetailNext}
        isLast={detailIdx === selected.length - 1}
      />
    );
  }

  const btnLabel =
    selected.length === 0
      ? 'Koi nahi use kiya — Aage Badho →'
      : `${selected.length} product chuney — Aage Badho →`;

  return (
    <div className="screen">
      <h2 className="screen-title">Kaunse hair products use karte hain?</h2>
      <p className="screen-subtitle">
        Jo use karte hain select karein — ya seedha aage badho
      </p>

      <ChipSelect
        options={ALL_PRODUCTS}
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
