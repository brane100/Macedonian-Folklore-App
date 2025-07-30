import React, { useState } from 'react';
import './Step4ReviewSubmit.css';

export default function Step4ReviewSubmit({ formData, prevStep }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log('Submitting:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      alert("🎉 Прispevок успешно додаден!");
    }, 2000);
  };

  const getMediaIcon = (type) => {
    switch(type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📎';
    }
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
          Вашиот прispevок е успешно додаден во базата на македонски фолклор!
        </div>
      )}

      <div className="review-section">
        {/* Basic Information */}
        <div className="review-card">
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
              {formData.regijaId || 'Не е избрана регија'}
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
            <span className="review-label">📚 Референца:</span>
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
