import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserGuard } from '../RoleBasedAccess';
import './EditContribution.css';

const EditContribution = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [contribution, setContribution] = useState(null);
    const [formData, setFormData] = useState({
        novPlesIme: '',        // Dance name
        tipPlesa: 'обредни',   // Dance type
        kratkaZgodovina: '',   // Short history
        opisTehnike: '',       // Technique description
        regijaId: '',          // Region ID
        opis: '',              // Contribution description
        referencaOpis: '',     // Reference description
        referencaUrl: ''       // Reference URL
    });

    const fetchContribution = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/prispevki/my-contributions`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                const targetContribution = data.data.find(c => c.id.toString() === id);
                
                if (!targetContribution) {
                    throw new Error('Contribution not found');
                }

                // Check if user can edit this contribution
                if (targetContribution.status !== 2 && targetContribution.status !== 3) {
                    throw new Error('This contribution cannot be edited');
                }

                setContribution(targetContribution);
                setFormData({
                    novPlesIme: targetContribution.ime_na_ples || targetContribution.dance_name || '',
                    tipPlesa: targetContribution.tip_plesa === 0 ? 'обредни' : 'посветни',
                    kratkaZgodovina: targetContribution.literatura || '',
                    opisTehnike: targetContribution.opis || '',
                    regijaId: targetContribution.regija_id || '',
                    opis: targetContribution.opis || '',
                    referencaOpis: targetContribution.literatura || '',
                    referencaUrl: targetContribution.izvor || ''
                });
            } else {
                throw new Error('Failed to fetch contribution');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchContribution();
    }, [fetchContribution]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const response = await fetch(`/api/prispevki/edit/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Contribution updated successfully!');
                navigate('/moji-prispevki');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update contribution');
            }
        } catch (err) {
            alert('Error updating contribution: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            0: t('editContribution.status.pending'),
            1: t('editContribution.status.approved'),
            2: t('editContribution.status.rejected'),
            3: t('editContribution.status.changesRequired')
        };
        return labels[status] || t('editContribution.status.unknown');
    };

    const getStatusColor = (status) => {
        const colors = {
            0: '#f39c12',
            1: '#27ae60',
            2: '#e74c3c',
            3: '#9b59b6'
        };
        return colors[status] || '#bdc3c7';
    };

    if (loading) {
        return (
            <div className="edit-contribution-loading">
                <div className="loading-spinner"></div>
                <p>{t('editContribution.loading')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="edit-contribution-error">
                <h3>{t('editContribution.errorTitle')}</h3>
                <p>{error}</p>
                <button onClick={() => navigate('/moji-prispevki')} className="back-btn">
                    {t('editContribution.backToMyContributions')}
                </button>
            </div>
        );
    }

    return (
        <UserGuard fallback={
            <div className="access-denied">
                <h3>{t('editContribution.authRequiredTitle')}</h3>
                <p>{t('editContribution.authRequiredText')}</p>
            </div>
        }>
            <div className="edit-contribution">
                <div className="edit-header">
                    <button 
                        onClick={() => navigate('/moji-prispevki')} 
                        className="back-button"
                    >
                        ← {t('editContribution.backToMyContributions')}
                    </button>
                    <h2>{t('editContribution.title')}</h2>
                    <div className="current-status">
                        <span>{t('editContribution.currentStatus')}: </span>
                        <span 
                            className="status-badge" 
                            style={{ backgroundColor: getStatusColor(contribution?.status) }}
                        >
                            {getStatusLabel(contribution?.status)}
                        </span>
                    </div>
                </div>

                {/* Show moderator notes if available */}
                {contribution?.moderator_notes && (
                    <div className="moderator-feedback">
                        <h3>{t('editContribution.moderatorFeedback')}</h3>
                        <p>{contribution.moderator_notes}</p>
                        <small>
                            {t('editContribution.moderatedOn')}: {new Date(contribution.moderated_at).toLocaleDateString('mk-MK')}
                        </small>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-section">
                        <h3>{t('editContribution.basicInfo')}</h3>
                        <div className="form-group">
                            <label htmlFor="novPlesIme">{t('editContribution.danceName')} *</label>
                            <input
                                type="text"
                                id="novPlesIme"
                                name="novPlesIme"
                                value={formData.novPlesIme}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tipPlesa">{t('editContribution.danceType')} *</label>
                            <select
                                id="tipPlesa"
                                name="tipPlesa"
                                value={formData.tipPlesa}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="обредни">{t('editContribution.ceremonial')}</option>
                                <option value="посветни">{t('editContribution.secular')}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="regijaId">{t('editContribution.region')} *</label>
                            <select
                                id="regijaId"
                                name="regijaId"
                                value={formData.regijaId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">{t('editContribution.selectRegion')}</option>
                                <option value="1">{t('regions.pelagonija')}</option>
                                <option value="2">{t('regions.skopje')}</option>
                                <option value="3">{t('regions.vardar')}</option>
                                <option value="4">{t('regions.eastern')}</option>
                                <option value="5">{t('regions.southwestern')}</option>
                                <option value="6">{t('regions.southeastern')}</option>
                                <option value="7">{t('regions.polog')}</option>
                                <option value="8">{t('regions.northeastern')}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="opisTehnike">{t('editContribution.techniqueDescription')}</label>
                            <textarea
                                id="opisTehnike"
                                name="opisTehnike"
                                value={formData.opisTehnike}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder={t('editContribution.techniquePlaceholder')}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="opis">{t('editContribution.contributionDescription')}</label>
                            <textarea
                                id="opis"
                                name="opis"
                                value={formData.opis}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder={t('editContribution.contributionPlaceholder')}
                            />
                        </div>
                    </div>
                    <div className="form-section">
                        <h3>{t('editContribution.historicalContext')}</h3>
                        <div className="form-group">
                            <label htmlFor="kratkaZgodovina">{t('editContribution.shortHistory')}</label>
                            <textarea
                                id="kratkaZgodovina"
                                name="kratkaZgodovina"
                                value={formData.kratkaZgodovina}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder={t('editContribution.historyPlaceholder')}
                            />
                        </div>
                    </div>
                    <div className="form-section">
                        <h3>{t('editContribution.references')}</h3>
                        <div className="form-group">
                            <label htmlFor="referencaOpis">{t('editContribution.referenceDescription')}</label>
                            <textarea
                                id="referencaOpis"
                                name="referencaOpis"
                                value={formData.referencaOpis}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder={t('editContribution.referencePlaceholder')}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="referencaUrl">{t('editContribution.referenceUrl')}</label>
                            <input
                                type="url"
                                id="referencaUrl"
                                name="referencaUrl"
                                value={formData.referencaUrl}
                                onChange={handleInputChange}
                                placeholder={t('editContribution.urlPlaceholder')}
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/moji-prispevki')} 
                            className="cancel-btn"
                            disabled={saving}
                        >
                            {t('common.cancel')}
                        </button>
                        <button 
                            type="submit" 
                            className="save-btn"
                            disabled={saving}
                        >
                            {saving ? t('editContribution.saving') : t('editContribution.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </UserGuard>
    );
};

export default EditContribution;
