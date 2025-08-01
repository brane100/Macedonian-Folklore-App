import React from 'react';
// import './Step1BasicInfo.css';

export default function Step1BasicInfo({ formData, setFormData, nextStep }) {
  return (
    <div>
      <h2>Korak 1: Osnovne informacije</h2>

      <label>Opis prispevka</label>
      <textarea
        value={formData.opis}
        onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
      />

      <label>Anonimno?</label>
      <input
        type="checkbox"
        checked={formData.jeAnonimen}
        onChange={(e) => setFormData({ ...formData, jeAnonimen: e.target.checked })}
      />

      <label>Regija</label>
      <select
        value={formData.regijaId}
        onChange={(e) => setFormData({ ...formData, regijaId: e.target.value })}
      >
        <option value="">-- Izberi regijo --</option>
        <option value="1">Пелагониски</option>
        <option value="2">Скопски</option>
        <option value="3">Вардарски</option>
        <option value="4">Источен</option>
        <option value="5">Југозападен</option>
        <option value="6">Југоисточен</option>
        <option value="7">Полошки</option>
        <option value="8">Североисточен</option>
      </select>

      <label>Ples</label>
      <input
        type="text"
        placeholder="Ime novega plesa"
        value={formData.novPlesIme}
        onChange={(e) => setFormData({ ...formData, novPlesIme: e.target.value })}
      />

      <button onClick={nextStep}>Naprej</button>
    </div>
  );
}
