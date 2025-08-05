import React from 'react';
import './Step1BasicInfo.css';

export default function Step1BasicInfo({ formData, setFormData, nextStep }) {
  const tipoviPlesa = [
    'обредни',
    'посветни'
  ];

  return (
    <div className="step1-container">
      <h2 className="step1-header">Korak 1: Osnovne informacije</h2>

      <div className="form-group">
        <label className="form-label required">Име на плесот</label>
        <input
          type="text"
          className="form-input"
          placeholder="Внесете име на плесот"
          value={formData.novPlesIme}
          onChange={(e) => setFormData({ ...formData, novPlesIme: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label required">Тип на плес</label>
        <select
          className="form-select"
          value={formData.tipPlesa}
          onChange={(e) => setFormData({ ...formData, tipPlesa: e.target.value })}
          required
        >
          <option value="">-- Изберете тип на плес --</option>
          {tipoviPlesa.map((tip, index) => (
            <option key={index} value={tip}>{tip}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label required">Кратка историја</label>
        <textarea
          className="form-textarea"
          placeholder="Опишете ја кратката историја на плесот"
          value={formData.kratkaZgodovina}
          onChange={(e) => setFormData({ ...formData, kratkaZgodovina: e.target.value })}
          required
          rows="2"
        />
      </div>

      <div className="form-group">
        <label className="form-label required">Опис на техника</label>
        <textarea
          className="form-textarea"
          placeholder="Опишете ја техниката на изведување на плесот"
          value={formData.opisTehnike}
          onChange={(e) => setFormData({ ...formData, opisTehnike: e.target.value })}
          required
          rows="2"
        />
      </div>

      <div className="form-group">
        <label className="form-label required">Opis prispevka</label>
        <textarea
          className="form-textarea"
          placeholder="Дополнителен опис на прispevок"
          value={formData.opis}
          onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
          required
          rows="3"
        />
      </div>

      <div className="form-group">
        <label htmlFor="anonimno" className="checkbox-group">
          <input
            type="checkbox"
            className="form-checkbox"
            id="anonimno"
            checked={formData.jeAnonimen}
            onChange={(e) => setFormData({ ...formData, jeAnonimen: e.target.checked })}
          />
          <span className="checkbox-label">Anonimno?</span>
        </label>
      </div>

      <div className="form-group">
        <label className="form-label required">Regija</label>
        <select
          className="form-select"
          value={formData.regijaId}
          onChange={(e) => setFormData({ ...formData, regijaId: e.target.value })}
          required
        >
          <option value="">-- Izberi regijo --</option>
          <option value="1">Пелагонија</option>
          <option value="2">Скопје</option>
          <option value="3">Вардарска Македонија</option>
          <option value="4">Источна Македонија</option>
          <option value="5">Југозападен дел</option>
          <option value="6">Југоисточен дел</option>
          <option value="7">Полог</option>
          <option value="8">Североисточен дел</option>
        </select>
      </div>

      <button
        className="next-button"
        disabled={!formData.novPlesIme || !formData.tipPlesa || !formData.regijaId || !formData.opis}
        style={{
          opacity: !formData.novPlesIme || !formData.tipPlesa || !formData.regijaId || !formData.opis ? 0.6 : 1,
          cursor: !formData.novPlesIme || !formData.tipPlesa || !formData.regijaId || !formData.opis ? 'not-allowed' : 'pointer'
        }}
        onClick={() => { nextStep(); }
        }
      >
        Naprej
      </button>
    </div>
  );
}
