import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Step4ReviewSubmit.css';

export default function Step4ReviewSubmit({ formData, prevStep }) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log('Submitting:', formData);

    // Map region ID to region data
    const getRegionData = (regijaId) => {
      const regionMap = {
        "1": { ime: t('regions.pelagonia'), koordinata_x: 21.4, koordinata_y: 41.0 },
        "2": { ime: t('regions.skopje'), koordinata_x: 21.4, koordinata_y: 42.0 },
        "3": { ime: t('regions.vardar'), koordinata_x: 21.6, koordinata_y: 41.6 },
        "4": { ime: t('regions.eastern'), koordinata_x: 22.4, koordinata_y: 41.8 },
        "5": { ime: t('regions.southwestern'), koordinata_x: 20.8, koordinata_y: 41.2 },
        "6": { ime: t('regions.southeastern'), koordinata_x: 22.0, koordinata_y: 41.2 },
        "7": { ime: t('regions.polog'), koordinata_x: 20.9, koordinata_y: 42.0 },
        "8": { ime: t('regions.northeastern'), koordinata_x: 22.2, koordinata_y: 42.2 }
      };
      return regionMap[regijaId] || { ime: t('regions.unknown'), koordinata_x: 0, koordinata_y: 0 };
    };
    setIsSubmitting(true);
    console.log('Submitting:', formData);

    // Validate required fields from Step 1
    const requiredFields = {
      [t('contribution.step4.validation.danceName')]: formData.novPlesIme,
      [t('contribution.step4.validation.danceType')]: formData.tipPlesa,
      [t('contribution.step4.validation.region')]: formData.regijaId,
      [t('contribution.step4.validation.description')]: formData.opis,
      [t('contribution.step4.validation.shortHistory')]: formData.kratkaZgodovina,
      [t('contribution.step4.validation.techniqueDescription')]: formData.opisTehnike
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      alert(`❌ ${t('contribution.step4.validation.missingFields')}:\n• ${missingFields.join('\n• ')}`);
      setIsSubmitting(false);
      return;
    }

    const regionData = getRegionData(formData.regijaId);

    // Test session before actual submission
    console.log('Testing session...');
    try {
      const sessionTest = await fetch(`${process.env.REACT_APP_API_URL}/prispevki/test-session`, {
        method: 'GET',
        credentials: 'include'
      });
      const sessionData = await sessionTest.json();
      console.log('Session test result:', sessionData);
    } catch (error) {
      console.error('Session test failed:', error);
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/prispevki/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          regija: {
            ime: regionData.ime,
            koordinata_x: regionData.koordinata_x,
            koordinata_y: regionData.koordinata_y
          },
          ples: {
            ime: formData.novPlesIme,
            tip_plesa: formData.tipPlesa,
            kratka_zgodovina: formData.kratkaZgodovina,
            opis_tehnike: formData.opisTehnike
          },
          prispevek: {
            opis: formData.opis,
            je_anonimen: formData.jeAnonimen,
            referenca_opis: formData.referencaOpis,
            referenca_url: formData.referencaUrl
          }
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitted(true);
        alert("🎉 " + result.msg);
        console.log('Contribution submitted successfully:', result.data);

        // Redirect to homepage after 500 milliseconds
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        throw new Error(result.msg || t('contribution.step4.errors.submitError'));
      }

    } catch (error) {
      console.error('Error submitting contribution:', error);
      alert("❌ " + t('contribution.step4.errors.submitError') + ": " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📎';
    }
  };

  const getRegionName = (regijaId) => {
    const regionMap = {
      "1": t('regions.pelagonia'),
      "2": t('regions.skopje'),
      "3": t('regions.vardar'),
      "4": t('regions.eastern'),
      "5": t('regions.southwestern'),
      "6": t('regions.southeastern'),
      "7": t('regions.polog'),
      "8": t('regions.northeastern')
    };
    return regionMap[regijaId] || t('regions.unknown');
  };

  return (
    <div className={`step4-container ${isSubmitting ? 'submitting' : ''}`}>
      <div className="step4-header">
        <h2>📋 {t('contribution.step4.title')}</h2>
        <p className="subtitle">{t('contribution.step4.subtitle')}</p>
      </div>

      {isSubmitted && (
        <div className="success-message">
          <span className="success-icon">🎉</span>
          {t('contribution.step4.successMessage')}
        </div>
      )}

      <div className="review-section">
        {/* Basic Information */}
        <div className="review-card">
          <div className="review-item">
            <span className="review-label">📖 {t('contribution.step4.review.danceName')}:</span>
            <span className="review-value highlight">{formData.novPlesIme || t('contribution.step4.review.notSpecified')}</span>
          </div>

          <div className="review-item">
            <span className="review-label">🎪 {t('contribution.step4.review.danceType')}:</span>
            <span className="review-value">{formData.tipPlesa || t('contribution.step4.review.notSelected')}</span>
          </div>

          <div className="review-item">
            <span className="review-label">📜 {t('contribution.step4.review.shortHistory')}:</span>
            <span className="review-value long-text">{formData.kratkaZgodovina || t('contribution.step4.review.noDescription')}</span>
          </div>

          <div className="review-item">
            <span className="review-label">🎯 {t('contribution.step4.review.techniqueDescription')}:</span>
            <span className="review-value long-text">{formData.opisTehnike || t('contribution.step4.review.noDescription')}</span>
          </div>

          <div className="review-item">
            <span className="review-label">📝 {t('contribution.step4.review.description')}:</span>
            <span className="review-value long-text">{formData.opis || t('contribution.step4.review.noDescription')}</span>
          </div>

          <div className="review-item">
            <span className="review-label">🕶️ {t('contribution.step4.review.anonymity')}:</span>
            <span className={`review-value ${formData.jeAnonimen ? 'highlight' : ''}`}>
              {formData.jeAnonimen ? `✅ ${t('contribution.step4.review.anonymous')}` : `❌ ${t('contribution.step4.review.withName')}`}
            </span>
          </div>

          <div className="review-item">
            <span className="review-label">🗺️ {t('contribution.step4.review.region')}:</span>
            <span className="review-value highlight">
              {getRegionName(formData.regijaId)}
            </span>
          </div>

          <div className="review-item">
            <span className="review-label">🎭 {t('contribution.step4.review.danceOrTradition')}:</span>
            <span className="review-value highlight">
              {formData.plesId || `🆕 ${t('contribution.step4.review.new')}: ${formData.novPlesIme || t('contribution.step4.review.notSpecified')}`}
            </span>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{formData.media?.length || 0}</span>
            <span className="stat-label">{t('contribution.step4.stats.media')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{formData.opis?.length || 0}</span>
            <span className="stat-label">{t('contribution.step4.stats.characters')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{formData.jeAnonimen ? '🕶️' : '👤'}</span>
            <span className="stat-label">{t('contribution.step4.stats.mode')}</span>
          </div>
        </div>

        {/* Media Section */}
        <div className="media-section">
          <h4>📎 {t('contribution.step4.media.title')} ({formData.media?.length || 0})</h4>
          {formData.media && formData.media.length > 0 ? (
            <div className="media-list">
              {formData.media.map((m, index) => (
                <div key={index} className="media-item">
                  <div className="media-icon">{getMediaIcon(m.type)}</div>
                  <div className="media-details">
                    <div className="media-type">{m.type}</div>
                    <div className="media-url">{m.url}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-media">
              📭 {t('contribution.step4.media.noMedia')}
            </div>
          )}
        </div>

        {/* References */}
        <div className="review-card">
          <div className="review-item">
            <span className="review-label">📄 {t('contribution.step4.references.reference')}:</span>
            <span className="review-value long-text">
              {formData.referencaOpis || t('contribution.step4.references.noReference')}
            </span>
          </div>

          <div className="review-item">
            <span className="review-label">🔗 URL:</span>
            <span className="review-value">
              {formData.referencaUrl ? (
                <a href={formData.referencaUrl} target="_blank" rel="noopener noreferrer">
                  {formData.referencaUrl}
                </a>
              ) : (
                t('contribution.step4.references.noUrl')
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="warning-notice">
        <span className="warning-icon">⚠️</span>
        <p>{t('contribution.step4.warning')}</p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={prevStep}
          className="btn btn-back"
          disabled={isSubmitting}
        >
          ⬅️ {t('contribution.navigation.back')}
        </button>

        <button
          onClick={handleSubmit}
          className="btn btn-submit"
          disabled={isSubmitting || isSubmitted}
          style={{
            opacity: isSubmitting || isSubmitted ? 0.5 : 1,
            cursor: isSubmitting || isSubmitted ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              {t('contribution.step4.submitting')}
            </>
          ) : isSubmitted ? (
            <>
              ✅ {t('contribution.step4.submitted')}
            </>
          ) : (
            <>
              🚀 {t('contribution.step4.submitContribution')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
