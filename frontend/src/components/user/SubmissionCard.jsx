import React, { useState } from 'react';
import './SubmissionCard.css';

const SubmissionCard = ({ submission, statusLabel, statusColor, onEdit, onResubmit }) => {
    const [showDetails, setShowDetails] = useState(false);

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
        return tipPlesa === 0 ? 'Обредни' : 'Посветни';
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
                    <h3 className="dance-name">{submission.ples?.ime || 'Неименуван плес'}</h3>
                    <div className="submission-meta">
                        <span className="region">{submission.regija?.ime || 'Непознат регион'}</span>
                        <span className="date">Поднесено: {formatDate(submission.datum_ustvarjen)}</span>
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
                            ⏳ Вашиот prispevok чека на модерација. Ќе бидете известени кога ќе биде прегледан.
                        </div>
                    )}
                    
                    {submission.status === 2 && (
                        <div className="status-message rejected">
                            ❌ Вашиот prispevok е одбиен. Можете да го уредите и да го поднесете повторно.
                        </div>
                    )}
                    
                    {submission.status === 3 && (
                        <div className="status-message needs-editing">
                            ✏️ Потребни се измени. Ве молиме уредете го prispevokот според коментарите и поднесете го повторно.
                        </div>
                    )}
                </div>

                {/* Moderator notes */}
                {submission.moderator_notes && (
                    <div className="moderator-notes">
                        <h4>Коментари од модераторот:</h4>
                        <p>{submission.moderator_notes}</p>
                        {submission.moderated_at && (
                            <small>Модериран на: {formatDate(submission.moderated_at)}</small>
                        )}
                    </div>
                )}

                {/* Toggle details button */}
                <button 
                    className="toggle-details"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? 'Скриј детали' : 'Прикажи детали'}
                </button>

                {/* Detailed information */}
                {showDetails && (
                    <div className="detailed-info">
                        <div className="detail-section">
                            <h4>Основни информации</h4>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Име на плес:</span>
                                    <span className="detail-value">{submission.ples?.ime || 'Н/А'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Тип:</span>
                                    <span className="detail-value">{getTipPlesaLabel(submission.ples?.tip_plesa)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Регион:</span>
                                    <span className="detail-value">{submission.regija?.ime || 'Н/А'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Координати:</span>
                                    <span className="detail-value">
                                        {submission.regija?.koordinata_x && submission.regija?.koordinata_y 
                                            ? `${submission.regija.koordinata_x}, ${submission.regija.koordinata_y}`
                                            : 'Н/А'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Dance History Section */}
                        {submission.ples?.kratka_zgodovina && (
                            <div className="detail-section">
                                <h4>Кратка историја</h4>
                                <p className="history-text">{submission.ples.kratka_zgodovina}</p>
                            </div>
                        )}

                        {/* Dance Technique Section */}
                        {submission.ples?.opis_tehnike && (
                            <div className="detail-section">
                                <h4>Опис на техника</h4>
                                <p className="technique-text">{submission.ples.opis_tehnike}</p>
                            </div>
                        )}

                        {/* Contribution Description */}
                        {submission.opis && (
                            <div className="detail-section">
                                <h4>Ваш опис / prispevok</h4>
                                <p className="description-full">{submission.opis}</p>
                            </div>
                        )}

                        {/* References Section */}
                        {(submission.referenca_url || submission.referenca_opis) && (
                            <div className="detail-section">
                                <h4>Референци</h4>
                                <div className="references">
                                    {submission.referenca_opis && (
                                        <div className="reference-item">
                                            <span className="reference-label">Опис на референца:</span>
                                            <p className="reference-description">{submission.referenca_opis}</p>
                                        </div>
                                    )}
                                    {submission.referenca_url && (
                                        <div className="reference-item">
                                            <span className="reference-label">URL:</span>
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
                            <h4>Додатни информации</h4>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Анонимен:</span>
                                    <span className="detail-value">{submission.je_anonimen ? 'Да' : 'Не'}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">ID на прispevok:</span>
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
                            ✏️ Уреди
                        </button>
                    )}
                    {canResubmit() && (
                        <button 
                            className="resubmit-btn"
                            onClick={() => onResubmit(submission.id)}
                        >
                            🔄 Поднеси повторно
                        </button>
                    )}
                    {submission.status === 1 && (
                        <span className="approved-message">
                            ✅ Овој prispevok е одобрен и е достапен на мапата
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmissionCard;
