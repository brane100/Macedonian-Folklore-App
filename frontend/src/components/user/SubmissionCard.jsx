import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SubmissionCard.css';

const SubmissionCard = ({ submission, statusLabel, statusColor, onEdit, onResubmit }) => {
    const [showDetails, setShowDetails] = useState(false);
    const { t } = useTranslation();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('mk-MK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTipPlesaLabel = (tipPlesa) => {
        return tipPlesa === 0 ? t('editContribution.ceremonial') : t('editContribution.secular');
    };

    const canEdit = () => {
        return submission.status === 2 || submission.status === 3; // rejected or needs editing
    };

    const canResubmit = () => {
        return submission.status === 3; // needs editing
    };

    return (
        <div className={`submission-card status-${submission.status}`}>
            <div className="card-header">
                <div className="submission-info">
                    <h3 className="dance-name">{submission.ples?.ime || t('submissionCard.unnamedDance')}</h3>
                    <div className="submission-meta">
                        <span className="region">{submission.regija?.ime || t('submissionCard.unknownRegion')}</span>
                        <span className="date">{t('submissionCard.submitted')}: {formatDate(submission.datum_ustvarjen)}</span>
                    </div>
                </div>

                <div className="status-section">
                    <div 
                        className="status-badge" 
                        style={{ backgroundColor: statusColor }}
                    >
                        {statusLabel}
                    </div>
                    {submission.status === 0 && (
                        <div className="status-message pending">
                            ⏳ {t('submissionCard.pendingMessage')}
                        </div>
                    )}
                    {submission.status === 2 && (
                        <div className="status-message rejected">
                            ❌ {t('submissionCard.rejectedMessage')}
                        </div>
                    )}
                    {submission.status === 3 && (
                        <div className="status-message needs-editing">
                            ✏️ {t('submissionCard.needsEditingMessage')}
                        </div>
                    )}
                </div>

                {/* Moderator notes */}
                {submission.moderator_notes && (
                    <div className="moderator-notes">
                        <h4>{t('submissionCard.moderatorComments')}</h4>
                        <p>{submission.moderator_notes}</p>
                        {submission.moderated_at && (
                            <small>{t('submissionCard.moderatedOn')}: {formatDate(submission.moderated_at)}</small>
                        )}
                    </div>
                )}

                {/* Toggle details button */}
                <button 
                    className="toggle-details"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? t('submissionCard.hideDetails') : t('submissionCard.showDetails')}
                </button>

                {/* Detailed information */}
                {showDetails && (
                    <div className="detailed-info">
                        <div className="detail-section">
                            <h4>{t('submissionCard.basicInfo')}</h4>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">{t('submissionCard.danceName')}:</span>
                                    <span className="detail-value">{submission.ples?.ime || t('submissionCard.na')}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">{t('submissionCard.type')}:</span>
                                    <span className="detail-value">{getTipPlesaLabel(submission.ples?.tip_plesa)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">{t('submissionCard.region')}:</span>
                                    <span className="detail-value">{submission.regija?.ime || t('submissionCard.na')}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">{t('submissionCard.coordinates')}:</span>
                                    <span className="detail-value">
                                        {submission.regija?.koordinata_x && submission.regija?.koordinata_y 
                                            ? `${submission.regija.koordinata_x}, ${submission.regija.koordinata_y}`
                                            : t('submissionCard.na')
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Dance History Section */}
                        {submission.ples?.kratka_zgodovina && (
                            <div className="detail-section">
                                <h4>{t('submissionCard.shortHistory')}</h4>
                                <p className="history-text">{submission.ples.kratka_zgodovina}</p>
                            </div>
                        )}
                        {/* Dance Technique Section */}
                        {submission.ples?.opis_tehnike && (
                            <div className="detail-section">
                                <h4>{t('submissionCard.techniqueDescription')}</h4>
                                <p className="technique-text">{submission.ples.opis_tehnike}</p>
                            </div>
                        )}
                        {/* Contribution Description */}
                        {submission.opis && (
                            <div className="detail-section">
                                <h4>{t('submissionCard.yourDescription')}</h4>
                                <p className="description-full">{submission.opis}</p>
                            </div>
                        )}
                        {/* References Section */}
                        {(submission.referenca_url || submission.referenca_opis) && (
                            <div className="detail-section">
                                <h4>{t('submissionCard.references')}</h4>
                                <div className="references">
                                    {submission.referenca_opis && (
                                        <div className="reference-item">
                                            <span className="reference-label">{t('submissionCard.referenceDescription')}:</span>
                                            <p className="reference-description">{submission.referenca_opis}</p>
                                        </div>
                                    )}
                                    {submission.referenca_url && (
                                        <div className="reference-item">
                                            <span className="reference-label">{t('submissionCard.url')}:</span>
                                            <a href={submission.referenca_url} target="_blank" rel="noopener noreferrer" className="reference-link">
                                                {submission.referenca_url}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Additional Information */}
                        <div className="detail-section">
                            <h4>{t('submissionCard.additionalInfo')}</h4>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">{t('submissionCard.anonymous')}:</span>
                                    <span className="detail-value">{submission.je_anonimen ? t('submissionCard.yes') : t('submissionCard.no')}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">{t('submissionCard.id')}:</span>
                                    <span className="detail-value">{submission.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Action buttons */}
                <div className="card-actions">
                    {canEdit() && (
                        <button 
                            className="edit-btn"
                            onClick={() => onEdit(submission.id)}
                        >
                            ✏️ {t('submissionCard.edit')}
                        </button>
                    )}
                    {canResubmit() && (
                        <button 
                            className="resubmit-btn"
                            onClick={() => onResubmit(submission.id)}
                        >
                            🔄 {t('submissionCard.resubmit')}
                        </button>
                    )}
                    {submission.status === 1 && (
                        <span className="approved-message">
                            ✅ {t('submissionCard.approvedMessage')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmissionCard;
