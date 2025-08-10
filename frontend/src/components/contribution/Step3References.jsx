import React from 'react';
import './Step3References.css';

export default function Step3References({ formData, setFormData, nextStep, prevStep }) {
  return (
    <div>
      <h2>Korak 3: Reference</h2>

      <label>Opis reference:</label>
      <input
        type="text"
        value={formData.referencaOpis}
        placeholder="Knjiga X, ustno izročilo, članek Y..."
        onChange={(e) => setFormData({ ...formData, referencaOpis: e.target.value })}
      />

      <label>URL reference (neobvezno):</label>
      <input
        type="text"
        placeholder="https://example.com/reference"
        value={formData.referencaUrl}
        onChange={(e) => setFormData({ ...formData, referencaUrl: e.target.value })}
      />

      <button onClick={prevStep}>Nazaj</button>
      <button onClick={nextStep}>Naprej</button>
    </div>
  );
}