import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { UserGuard } from '../RoleBasedAccess';
import SubmissionCard from './SubmissionCard';
import './UserSubmissions.css';

const UserSubmissions = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, needs_editing

    const statusLabels = {
        0: t('userSubmissions.pending'),
        1: t('userSubmissions.approved'),
        2: t('userSubmissions.rejected'),
        3: t('userSubmissions.needsEditing')
    };

    const statusColors = {
        0: '#f39c12', // orange
        1: '#27ae60', // green
        2: '#e74c3c', // red
        3: '#9b59b6'  // purple
    };

    const fetchSubmissions = useCallback(async () => {
        try {
            setLoading(true);
            const filterParam = filter !== 'all' ? `?status=${filter}` : '';
            console.log('Fetching submissions with filter:', filterParam);
            
            const response = await fetch(`http://localhost:3001/prispevki/my-contributions${filterParam}`, {
                credentials: 'include'
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            console.log('Response statusText:', response.statusText);
            
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                console.log('Content-Type:', contentType);
                
                // Get response as text first to see what we're dealing with
                const responseText = await response.text();
                console.log('Raw response text:', responseText);
                
                if (!responseText || responseText.trim() === '') {
                    console.error('Empty response from server');
                    throw new Error('Серверот враќа празен одговор');
                }
                
                try {
                    const data = JSON.parse(responseText);
                    console.log('Parsed JSON data:', data);
                    setSubmissions(data.data || []);
                } catch (jsonError) {
                    console.error('JSON parse error:', jsonError);
                    console.error('Response was not valid JSON:', responseText);
                    throw new Error('Серверот не враќа валиден JSON одговор');
                }
            } else {
                const errorText = await response.text();
                console.error('Error response status:', response.status);
                console.error('Error response text:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            console.error('Fetch error details:', err);
            console.error('Error name:', err.name);
            console.error('Error message:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleEdit = (submissionId) => {
        // Navigate to edit form - you'll implement this based on your routing structure
        window.location.href = `/prispevki/uredi/${submissionId}`;
    };

    const handleResubmit = async (submissionId) => {
        try {
            const response = await fetch(`http://localhost:3001/prispevki/resubmit/${submissionId}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                // Refresh submissions
                fetchSubmissions();
                alert('Прispevок е повторно поднесен за модерација');
            } else {
                throw new Error('Грешка при повторно поднесување');
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        if (filter === 'all') return true;
        return submission.status.toString() === filter;
    });

    const getSubmissionCounts = () => {
        const counts = {
            all: submissions.length,
            0: submissions.filter(s => s.status === 0).length,
            1: submissions.filter(s => s.status === 1).length,
            2: submissions.filter(s => s.status === 2).length,
            3: submissions.filter(s => s.status === 3).length
        };
        return counts;
    };

    const counts = getSubmissionCounts();

    if (loading) {
        return (
            <div className="user-submissions-loading">
                <div className="loading-spinner"></div>
                <p>{t('userSubmissions.loadingSubmissions')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-submissions-error">
                <h3>Грешка</h3>
                <p>{error}</p>
                <button onClick={() => fetchSubmissions()} className="retry-btn">
                    {t('userSubmissions.tryAgain')}
                </button>
            </div>
        );
    }

    return (
        <UserGuard fallback={
            <div className="access-denied">
                <h3>Потребна е најава</h3>
                <p>За да ги видите вашите prispevki, мора да се најавите.</p>
            </div>
        }>
            <div className="user-submissions">
                <div className="submissions-header">
                    <h2>Мои Prispevki</h2>
                    <p>Овде можете да ги видите сите ваши поднесени prispevki и нивниот статус.</p>
                </div>

                {/* Filter tabs */}
                <div className="filter-tabs">
                    <button 
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Сите ({counts.all})
                    </button>
                    <button 
                        className={`filter-tab ${filter === '0' ? 'active' : ''}`}
                        onClick={() => setFilter('0')}
                    >
                        Во чекање ({counts[0]})
                    </button>
                    <button 
                        className={`filter-tab ${filter === '1' ? 'active' : ''}`}
                        onClick={() => setFilter('1')}
                    >
                        Одобрени ({counts[1]})
                    </button>
                    <button 
                        className={`filter-tab ${filter === '2' ? 'active' : ''}`}
                        onClick={() => setFilter('2')}
                    >
                        Одбиени ({counts[2]})
                    </button>
                    <button 
                        className={`filter-tab ${filter === '3' ? 'active' : ''}`}
                        onClick={() => setFilter('3')}
                    >
                        Потребни измени ({counts[3]})
                    </button>
                </div>

                {/* Status legend */}
                <div className="status-legend">
                    <h4>Легенда на статуси:</h4>
                    <div className="legend-items">
                        {Object.entries(statusLabels).map(([status, label]) => (
                            <div key={status} className="legend-item">
                                <div 
                                    className="status-indicator" 
                                    style={{ backgroundColor: statusColors[status] }}
                                ></div>
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submissions list */}
                <div className="submissions-list">
                    {filteredSubmissions.length === 0 ? (
                        <div className="no-submissions">
                            <h3>Нема prispevki</h3>
                            <p>
                                {filter === 'all' 
                                    ? 'Сѐ уште немате поднесено prispevki.' 
                                    : `Немате prispevki со статус "${statusLabels[filter]}".`
                                }
                            </p>
                            {filter === 'all' && (
                                <a href="/prispevok/novo" className="create-submission-btn">
                                    Создај нов prispevok
                                </a>
                            )}
                        </div>
                    ) : (
                        filteredSubmissions.map(submission => (
                            <SubmissionCard
                                key={submission.id}
                                submission={submission}
                                statusLabel={statusLabels[submission.status]}
                                statusColor={statusColors[submission.status]}
                                onEdit={handleEdit}
                                onResubmit={handleResubmit}
                            />
                        ))
                    )}
                </div>
            </div>
        </UserGuard>
    );
};

export default UserSubmissions;
