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

    const getRegionName = (regionId) => {
        const regions = {
            1: 'Скопски',
            2: 'Источен',
            3: 'Југоисточен', 
            4: 'Пелагониски',
            5: 'Југозападен',
            6: 'Вардарски',
            7: 'Североисточен',
            8: 'Полошки'
        };
        return regions[regionId] || 'Непознат регион';
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
                    <h3 className="dance-name">{submission.dance_name || submission.ime_na_ples}</h3>
                    <div className="submission-meta">
                        <span className="region">{getRegionName(submission.regija_id)}</span>
                        <span className="date">Поднесено: {formatDate(submission.datum_oddaje)}</span>
                    </div>
                </div>
                <div className="status-badge" style={{ backgroundColor: statusColor }}>
                    {statusLabel}
                </div>
            </div>

            <div className="card-content">
                <div className="basic-info">
                    <div className="info-row">
                        <span className="label">Тип на плес:</span>
                        <span className="value">{getTipPlesaLabel(submission.tip_plesa)}</span>
                    </div>
                    {submission.region_name && (
                        <div className="info-row">
                            <span className="label">Регион:</span>
                            <span className="value">{submission.region_name}</span>
                        </div>
                    )}
                    {submission.opis && (
                        <div className="info-row">
                            <span className="label">Опис:</span>
                            <span className="value description">{submission.opis}</span>
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
                                    <span className="detail-value">{submission.ime_na_ples}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Тип:</span>
                                    <span className="detail-value">{getTipPlesaLabel(submission.tip_plesa)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Место:</span>
                                    <span className="detail-value">{submission.mesto}</span>
                                </div>
                                {submission.koordinata_x && submission.koordinata_y && (
                                    <div className="detail-item">
                                        <span className="detail-label">Координати:</span>
                                        <span className="detail-value">
                                            {submission.koordinata_x}, {submission.koordinata_y}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {submission.opis && (
                            <div className="detail-section">
                                <h4>Опис</h4>
                                <p className="description-full">{submission.opis}</p>
                            </div>
                        )}

                        {(submission.video_url || submission.audio_url || submission.slika_url) && (
                            <div className="detail-section">
                                <h4>Медиуми</h4>
                                <div className="media-links">
                                    {submission.video_url && (
                                        <a href={submission.video_url} target="_blank" rel="noopener noreferrer" className="media-link video">
                                            📹 Видео
                                        </a>
                                    )}
                                    {submission.audio_url && (
                                        <a href={submission.audio_url} target="_blank" rel="noopener noreferrer" className="media-link audio">
                                            🎵 Аудио
                                        </a>
                                    )}
                                    {submission.slika_url && (
                                        <a href={submission.slika_url} target="_blank" rel="noopener noreferrer" className="media-link image">
                                            🖼️ Слика
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {(submission.literatura || submission.izvor) && (
                            <div className="detail-section">
                                <h4>Референци</h4>
                                {submission.literatura && (
                                    <div className="reference-item">
                                        <span className="reference-label">Литература:</span>
                                        <span className="reference-value">{submission.literatura}</span>
                                    </div>
                                )}
                                {submission.izvor && (
                                    <div className="reference-item">
                                        <span className="reference-label">Извор:</span>
                                        <span className="reference-value">{submission.izvor}</span>
                                    </div>
                                )}
                            </div>
                        )}
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
