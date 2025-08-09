import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserGuard } from '../RoleBasedAccess';
import './EditContribution.css';

const EditContribution = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
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
            0: 'Во чекање',
            1: 'Одобрено',
            2: 'Одбиено',
            3: 'Потребни измени'
        };
        return labels[status] || 'Непознат';
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
                <p>Loading contribution...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="edit-contribution-error">
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => navigate('/moji-prispevki')} className="back-btn">
                    Back to My Contributions
                </button>
            </div>
        );
    }

    return (
        <UserGuard fallback={
            <div className="access-denied">
                <h3>Authentication Required</h3>
                <p>You must be logged in to edit contributions.</p>
            </div>
        }>
            <div className="edit-contribution">
                <div className="edit-header">
                    <button 
                        onClick={() => navigate('/moji-prispevki')} 
                        className="back-button"
                    >
                        ← Back to My Contributions
                    </button>
                    <h2>Edit Contribution</h2>
                    <div className="current-status">
                        <span>Current Status: </span>
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
                        <h3>Moderator Feedback</h3>
                        <p>{contribution.moderator_notes}</p>
                        <small>
                            Moderated on: {new Date(contribution.moderated_at).toLocaleDateString('mk-MK')}
                        </small>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-section">
                        <h3>Basic Information</h3>
                        
                        <div className="form-group">
                            <label htmlFor="novPlesIme">Dance Name *</label>
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
                            <label htmlFor="tipPlesa">Dance Type *</label>
                            <select
                                id="tipPlesa"
                                name="tipPlesa"
                                value={formData.tipPlesa}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="обредни">Обредни</option>
                                <option value="посветни">Посветни</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="regijaId">Region *</label>
                            <select
                                id="regijaId"
                                name="regijaId"
                                value={formData.regijaId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Region</option>
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

                        <div className="form-group">
                            <label htmlFor="opisTehnike">Technique Description</label>
                            <textarea
                                id="opisTehnike"
                                name="opisTehnike"
                                value={formData.opisTehnike}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Describe the dance technique, steps, formations..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="opis">Contribution Description</label>
                            <textarea
                                id="opis"
                                name="opis"
                                value={formData.opis}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Describe your contribution, additional context..."
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Historical Context</h3>
                        
                        <div className="form-group">
                            <label htmlFor="kratkaZgodovina">Short History</label>
                            <textarea
                                id="kratkaZgodovina"
                                name="kratkaZgodovina"
                                value={formData.kratkaZgodovina}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Brief history and cultural significance of the dance..."
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>References</h3>
                        
                        <div className="form-group">
                            <label htmlFor="referencaOpis">Reference Description</label>
                            <textarea
                                id="referencaOpis"
                                name="referencaOpis"
                                value={formData.referencaOpis}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Books, articles, research papers..."
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="referencaUrl">Reference URL</label>
                            <input
                                type="url"
                                id="referencaUrl"
                                name="referencaUrl"
                                value={formData.referencaUrl}
                                onChange={handleInputChange}
                                placeholder="https://..."
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
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="save-btn"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </UserGuard>
    );
};

export default EditContribution;
