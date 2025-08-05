import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Step4ReviewSubmit.css';

export default function Step4ReviewSubmit({ formData, prevStep }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log('Submitting:', formData);

    // Validate required fields from Step 1
    const requiredFields = {
      'Име на плес': formData.novPlesIme,
      'Тип на плес': formData.tipPlesa,
      'Регија': formData.regijaId
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      alert(`❌ Ве молиме пополнете ги следните задолжителни полиња:\n• ${missingFields.join('\n• ')}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/prispevki/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          // Dance information
          novPlesIme: formData.novPlesIme,
          tipPlesa: formData.tipPlesa,
          kratkaZgodovina: formData.kratkaZgodovina,
          opisTehnike: formData.opisTehnike,

          // Region information  
          regijaId: formData.regijaId,

          // Contribution information
          opis: formData.opis,
          jeAnonimen: formData.jeAnonimen,
          referencaOpis: formData.referencaOpis,
          referencaUrl: formData.referencaUrl
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
        throw new Error(result.msg || 'Грешка при праќање на објава');
      }

    } catch (error) {
      console.error('Error submitting contribution:', error);
      alert("❌ Грешка при праќање: " + error.message);
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
      "1": "Пелагонија",
      "2": "Скопје",
      "3": "Вардарска Македонија",
      "4": "Источна Македонија",
      "5": "Југозападен дел",
      "6": "Југоисточен дел",
      "7": "Полог",
      "8": "Североисточен дел"
    };
    return regionMap[regijaId] || 'Непозната регија';
  };

  return (
    <div className={`step4-container ${isSubmitting ? 'submitting' : ''}`}>
      <div className="step4-header">
        <h2>📋 Корак 4: Преглед и потврдување</h2>
        <p className="subtitle">Проверете ги вашите податоци пред да ги испратите</p>
      </div>

      {isSubmitted && (
        <div className="success-message">
          <span className="success-icon">🎉</span>
          Вашиот прispevok е успешно додаден во базата на македонски фолклор!
        </div>
      )}

      <div className="review-section">
        {/* Basic Information */}
        <div className="review-card">
          <div className="review-item">
            <span className="review-label">📖 Име на плес:</span>
            <span className="review-value highlight">{formData.novPlesIme || 'Не е наведено'}</span>
          </div>

          <div className="review-item">
            <span className="review-label">🎪 Тип на плес:</span>
            <span className="review-value">{formData.tipPlesa || 'Не е избран'}</span>
          </div>

          <div className="review-item">
            <span className="review-label">📜 Кратка историја:</span>
            <span className="review-value long-text">{formData.kratkaZgodovina || 'Нема опис'}</span>
          </div>

          <div className="review-item">
            <span className="review-label">🎯 Опис на техника:</span>
            <span className="review-value long-text">{formData.opisTehnike || 'Нема опис'}</span>
          </div>

          <div className="review-item">
            <span className="review-label">📝 Опис:</span>
            <span className="review-value long-text">{formData.opis || 'Нема опис'}</span>
          </div>

          <div className="review-item">
            <span className="review-label">🕶️ Анонимност:</span>
            <span className={`review-value ${formData.jeAnonimen ? 'highlight' : ''}`}>
              {formData.jeAnonimen ? "✅ Да, анонимен прispevok" : "❌ Не, со мое име"}
            </span>
          </div>

          <div className="review-item">
            <span className="review-label">🗺️ Регија:</span>
            <span className="review-value highlight">
              {getRegionName(formData.regijaId)}
            </span>
          </div>

          <div className="review-item">
            <span className="review-label">🎭 Плес/Традиција:</span>
            <span className="review-value highlight">
              {formData.plesId || `🆕 Нов: ${formData.novPlesIme || 'Не е наведено'}`}
            </span>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{formData.media?.length || 0}</span>
            <span className="stat-label">Медиуми</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{formData.opis?.length || 0}</span>
            <span className="stat-label">Карактери</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{formData.jeAnonimen ? '🕶️' : '👤'}</span>
            <span className="stat-label">Режим</span>
          </div>
        </div>

        {/* Media Section */}
        <div className="media-section">
          <h4>📎 Додадени медиуми ({formData.media?.length || 0})</h4>
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
              📭 Нема додадени медиуми
            </div>
          )}
        </div>

        {/* References */}
        <div className="review-card">
          <div className="review-item">
            <span className="review-label">📄 Референца:</span>
            <span className="review-value long-text">
              {formData.referencaOpis || 'Нема опис на референца'}
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
                'Нема URL'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="warning-notice">
        <span className="warning-icon">⚠️</span>
        <p>Ве молиме проверете ги сите податоци пред да ги испратите. По испраќањето нема да можете да ги менувате.</p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={prevStep}
          className="btn btn-back"
          disabled={isSubmitting}
        >
          ⬅️ Назад
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
              Се испраќа...
            </>
          ) : isSubmitted ? (
            <>
              ✅ Испратено
            </>
          ) : (
            <>
              🚀 Испрати прispevok
            </>
          )}
        </button>
      </div>
    </div>
  );
}
