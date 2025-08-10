import { useTranslation } from 'react-i18next';
import './Step1BasicInfo.css';

export default function Step1BasicInfo({ formData, setFormData, nextStep }) {
  const { t } = useTranslation();

  const tipoviPlesa = [
    { value: 'обредни', label: t('contribution.step1.ceremonial') },
    { value: 'посветни', label: t('contribution.step1.secular') }
  ];

  return (
    <div className="step1-container">
      <h2 className="step1-header">{t('contribution.step1.title')}</h2>

      <div className="form-group">
        <label className="form-label required">{t('contribution.step1.newDanceName')}</label>
        <input
          type="text"
          className="form-input"
          placeholder={t('contribution.step1.enterDanceName')}
          value={formData.novPlesIme}
          onChange={(e) => setFormData({ ...formData, novPlesIme: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label required">{t('contribution.step1.danceType')}</label>
        <select
          className="form-select"
          value={formData.tipPlesa}
          onChange={(e) => setFormData({ ...formData, tipPlesa: e.target.value })}
          required
        >
          <option value="">-- {t('contribution.step1.selectDanceType')} --</option>
          {tipoviPlesa.map((tip, index) => (
            <option key={index} value={tip.value}>{tip.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label required">{t('contribution.step1.danceHistory')}</label>
        <textarea
          className="form-textarea"
          placeholder={t('contribution.step1.enterHistory')}
          value={formData.kratkaZgodovina}
          onChange={(e) => setFormData({ ...formData, kratkaZgodovina: e.target.value })}
          required
          rows="2"
        />
      </div>

        <div className="form-group">
          <label className="form-label required">{t('contribution.step1.technique')}</label>
          <textarea
            className="form-textarea"
            placeholder={t('contribution.step1.enterTechnique')}
            value={formData.opisTehnike}
            onChange={(e) => setFormData({ ...formData, opisTehnike: e.target.value })}
            required
            rows="2"
          />
        </div>

        <div className="form-group">
          <label className="form-label required">{t('contribution.step1.contribution')}</label>
          <textarea
            className="form-textarea"
            placeholder={t('contribution.step1.enterContribution')}
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
            <span className="checkbox-label">{t('contribution.step1.anonymous')}</span>
            <small className="checkbox-help">{t('contribution.step1.anonymousHelp')}</small>
          </label>
        </div>

        <div className="form-group">
          <label className="form-label required">{t('contribution.step1.region')}</label>
          <select
            className="form-select"
            value={formData.regijaId}
            onChange={(e) => setFormData({ ...formData, regijaId: e.target.value })}
            required
          >
            <option value="">-- {t('contribution.step1.selectRegion')} --</option>
            <option value="1">{t('regions.pelagonia')}</option>
            <option value="2">{t('regions.skopje')}</option>
            <option value="3">{t('regions.vardar')}</option>
            <option value="4">{t('regions.eastern')}</option>
            <option value="5">{t('regions.southwestern')}</option>
            <option value="6">{t('regions.southeastern')}</option>
            <option value="7">{t('regions.polog')}</option>
            <option value="8">{t('regions.northeastern')}</option>
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
          {t('contribution.step1.continue')}
        </button>
      </div>
  );
}
