import React from 'react';
import { useTranslation } from 'react-i18next';
import './Step3References.css';

export default function Step3References({ formData, setFormData, nextStep, prevStep }) {
  const { t } = useTranslation();
  
  return (
    <div className="step3-container">
      <div className="step3-header">
        <h2>📚 {t('contribution.step3.title')}</h2>
        <p>{t('contribution.step3.description')}</p>
      </div>

      <div className="form-group">
        <label>{t('contribution.step3.referenceDescription')}:</label>
        <textarea
          value={formData.referencaOpis}
          placeholder={t('contribution.step3.referencePlaceholder')}
          onChange={(e) => setFormData({ ...formData, referencaOpis: e.target.value })}
          className="reference-textarea"
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>{t('contribution.step3.referenceUrl')} ({t('contribution.step3.optional')}):</label>
        <input
          type="url"
          placeholder="https://example.com/reference"
          value={formData.referencaUrl}
          onChange={(e) => setFormData({ ...formData, referencaUrl: e.target.value })}
          className="reference-url-input"
        />
      </div>

      <div className="step-navigation">
        <button onClick={prevStep} className="nav-btn prev-btn">
          ⬅️ {t('contribution.navigation.back')}
        </button>
        <button onClick={nextStep} className="nav-btn next-btn">
          {t('contribution.navigation.next')} ➡️
        </button>
      </div>
    </div>
  );
}