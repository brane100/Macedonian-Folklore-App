import React, { useState, useEffect, useCallback } from 'react';
import { useRole, USER_ROLES } from '../RoleBasedAccess';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';
import './AdminPanel.css';

const AdminPanel = () => {
    const { t } = useTranslation();
    const { userRole, isModerator, isSuperAdmin } = useRole();
    const { user: currentUser } = useAuth(); // Get current logged-in user
    const [activeTab, setActiveTab] = useState('overview');
    const [pendingContributions, setPendingContributions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('all');
    const [editingContribution, setEditingContribution] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Fetch pending contributions
    const fetchPendingContributions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/moderacija/pending`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setPendingContributions(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching pending contributions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch users (SuperAdmin only)
    const fetchUsers = useCallback(async () => {
        if (!isSuperAdmin) return;

        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/moderacija/users`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, [isSuperAdmin]);

    // Sort contributions based on selected criteria
    const getSortedContributions = () => {
        let sorted = [...pendingContributions];

        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.datum_ustvarjen) - new Date(a.datum_ustvarjen));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.datum_ustvarjen) - new Date(b.datum_ustvarjen));
                break;
            case 'id':
                sorted.sort((a, b) => a.id - b.id);
                break;
            case 'random':
                // Shuffle array randomly
                for (let i = sorted.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
                }
                break;
            default:
                break;
        }

        return sorted;
    };

    // Approve contribution
    const approveContribution = async (id, notes = '') => {
        console.log('Approving contribution:', id, 'with notes:', notes);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/moderacija/approve/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ moderatorNotes: notes })
            });

            if (response.ok) {
                alert(t('admin.approveSuccess'));
                fetchPendingContributions(); // Refresh list
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert(t('admin.moderationError') + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error approving contribution:', error);
            alert(t('admin.moderationError'));
        }
    };

    // Reject contribution
    const rejectContribution = async (id, notes = '') => {
        console.log('Rejecting contribution:', id, 'with notes:', notes);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/moderacija/reject/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ moderatorNotes: notes })
            });

            if (response.ok) {
                alert(t('admin.rejectSuccess'));
                fetchPendingContributions(); // Refresh list
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert(t('admin.moderationError') + ': ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error rejecting contribution:', error);
            alert(t('admin.moderationError'));
        }
    };

    // Request edits for contribution
    const requestEdits = async (id, notes = '') => {
        console.log('Requesting edits for contribution:', id, 'with notes:', notes);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/moderacija/request-edit/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ moderatorNotes: notes })
            });

            if (response.ok) {
                alert(t('admin.requestChangesSent'));
                fetchPendingContributions(); // Refresh list
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert(t('admin.requestEditError') + ': ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error requesting edits:', error);
            alert(t('admin.requestEditError'));
        }
    };

    // Edit contribution directly
    const editContribution = async (id, updatedData) => {
        console.log('Editing contribution:', id, 'with data:', updatedData);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/moderacija/edit/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    opis: updatedData.opis,
                    referenca_opis: updatedData.referenca_opis,
                    referenca_url: updatedData.referenca_url
                })
            });

            if (response.ok) {
                alert(t('admin.updateSuccess'));
                setShowEditModal(false);
                setEditingContribution(null);
                fetchPendingContributions(); // Refresh list
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert(t('admin.updateError') + ': ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error editing contribution:', error);
            alert(t('admin.updateError'));
        }
    };

    // Open edit modal
    const openEditModal = (contribution) => {
        setEditingContribution(contribution);
        setShowEditModal(true);
    };

    // Update user role (SuperAdmin only)
    const updateUserRole = async (userId, newRole) => {
        if (!isSuperAdmin) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/moderacija/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ newRole })
            });

            if (response.ok) {
                alert(t('admin.roleUpdateSuccess'));
                fetchUsers(); // Refresh list
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            alert(t('admin.roleUpdateError'));
        }
    };

    // Delete user (SuperAdmin only)
    const deleteUser = async (userId, userName) => {
        if (!isSuperAdmin) return;

        const confirmDelete = window.confirm(
            t('admin.deleteUserConfirm', { userName })
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/moderacija/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.ok) {
                alert(t('admin.deleteUserSuccess'));
                fetchUsers(); // Refresh list
            } else {
                const errorData = await response.json();
                alert(errorData.message || t('admin.deleteUserError'));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(t('admin.deleteUserError'));
        }
    };

    useEffect(() => {
        if (activeTab === 'moderation') {
            fetchPendingContributions();
        } else if (activeTab === 'users' && isSuperAdmin) {
            fetchUsers();
        }
    }, [activeTab, isSuperAdmin, fetchPendingContributions, fetchUsers]);

    if (!isModerator) {
        return (
            <div className="admin-panel">
                <h2>🚫 {t('errors.insufficientPermissions')}</h2>
                <p>{t('errors.insufficientPermissionsMessage')}</p>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>🛡️ {t('admin.title')}</h1>
                <div className="user-role-badge">
                    {userRole === USER_ROLES.SUPERADMIN ? '👑 ' + t('admin.roles.superadmin') : '⚖️ ' + t('admin.roles.komisija')}
                </div>
            </div>

            <div className="admin-tabs">
                <button
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 {t('admin.overview')}
                </button>
                <button
                    className={activeTab === 'moderation' ? 'active' : ''}
                    onClick={() => setActiveTab('moderation')}
                >
                    📝 {t('admin.pendingContributions')}
                </button>
                {isSuperAdmin && (
                    <button
                        className={activeTab === 'users' ? 'active' : ''}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 {t('admin.userManagement')}
                    </button>
                )}
            </div>

            <div className="admin-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <h2>📊 {t('admin.systemOverview')}</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>📄 {t('admin.pendingContributions')}</h3>
                                <p className="stat-number">{pendingCount}</p>
                            </div>
                            <div className="stat-card">
                                <h3>👥 {t('admin.totalUsers')}</h3>
                                <p className="stat-number">{users.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'moderation' && (
                    <div className="moderation-section">
                        <h2>📝 {t('admin.moderation')}</h2>

                        {/* Moderation Controls */}
                        <div className="moderation-controls">
                            <div className="sort-controls">
                                <label>🔀 {t('admin.sortByLabel')}</label>
                                <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
                                    <option value="newest">📅 {t('admin.newest')} {t('admin.first')}</option>
                                    <option value="oldest">📅 {t('admin.oldest')} {t('admin.first')}</option>
                                    <option value="id">🔢 {t('admin.byIdNumber')}</option>
                                    <option value="random">🎲 {t('admin.randomOrder')}</option>
                                </select>
                            </div>

                            <div className="view-controls">
                                <label>📋 {t('admin.viewLabel')}</label>
                                <select onChange={(e) => setViewMode(e.target.value)} value={viewMode}>
                                    <option value="all">📄 {t('admin.allContributions')}</option>
                                    <option value="compact">📋 {t('admin.compactView')}</option>
                                    <option value="detailed">📖 {t('admin.detailedView')}</option>
                                </select>
                            </div>

                            <div className="quick-stats">
                                <span className="stat-badge">
                                    📊 {t('admin.total')}: {pendingContributions.length}
                                </span>
                            </div>
                        </div>

                        {loading ? (
                            <p>{t('admin.loading')}</p>
                        ) : pendingContributions.length === 0 ? (
                            <p>🎉 {t('admin.noPendingContributions')}</p>
                        ) : (
                            <div className="contributions-list">
                                {getSortedContributions().map(contribution => (
                                    <ContributionCard
                                        key={contribution.id}
                                        contribution={contribution}
                                        onApprove={approveContribution}
                                        onReject={rejectContribution}
                                        onRequestEdit={requestEdits}
                                        onEdit={openEditModal}
                                        viewMode={viewMode}
                                        currentUser={currentUser}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && isSuperAdmin && (
                    <div className="users-section">
                        <h2>👥 {t('admin.userManagement')}</h2>
                        {loading ? (
                             <p>{t('admin.loading')}</p>
                        ) : (
                            <div className="users-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>{t('admin.name')}</th>
                                            <th>{t('admin.email')}</th>
                                            <th>{t('admin.role')}</th>
                                            <th>{t('admin.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.ime} {user.priimek}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    {currentUser?.id !== user.id ? (
                                                        <select
                                                            value={user.vloga}
                                                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                        >
                                                            <option value={USER_ROLES.USER}>{t('admin.roles.navaden')}</option>
                                                            <option value={USER_ROLES.MODERATOR}>{t('admin.roles.komisija')}</option>
                                                            <option value={USER_ROLES.SUPERADMIN}>{t('admin.roles.superadmin')}</option>
                                                        </select>
                                                    ) : (
                                                        <span>{user.vloga}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {currentUser?.id !== user.id ? (
                                                        <button
                                                            className="delete-user-btn"
                                                            onClick={() => deleteUser(user.id, `${user.ime} ${user.priimek}`)}
                                                            style={{
                                                                background: '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '0.5rem 1rem',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            🗑️ {t('admin.deleteUser')}
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#666', fontStyle: 'italic' }}>
                                                            {t('admin.currentUser')}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && editingContribution && (
                <EditContributionModal
                    contribution={editingContribution}
                    onSave={editContribution}
                    onCancel={() => {
                        setShowEditModal(false);
                        setEditingContribution(null);
                    }}
                />
            )}
        </div>
    );
};

// Individual Contribution Card Component
const ContributionCard = ({ contribution, onApprove, onReject, onRequestEdit, onEdit, viewMode = 'all', currentUser }) => {
    const { t } = useTranslation();
    const [comment, setComment] = useState('');
    const [showDetails, setShowDetails] = useState(viewMode === 'detailed');

    useEffect(() => {
        setShowDetails(viewMode === 'detailed');
    }, [viewMode]);

    const handleAction = (action) => {
        console.log('ContributionCard handleAction:', action, 'for contribution:', contribution.id, 'with comment:', comment);

        // Check if moderator is trying to moderate their own contribution
        if (contribution.uporabnik_id === currentUser?.id) {
            alert(t('admin.cannotModerateSelf'));
            return;
        }

        if (action === 'approve') {
            onApprove(contribution.id, comment);
        } else if (action === 'reject') {
            onReject(contribution.id, comment);
        } else if (action === 'edit') {
            onRequestEdit(contribution.id, comment);
        }
        setComment(''); // Clear comment after action
    };

    return (
        <div className={`contribution-card enhanced ${viewMode === 'compact' ? 'compact-mode' : ''}`}>
            <div className="contribution-header">
                <div className="header-left">
                    <h4>🎭 {t('admin.contributionId')} #{contribution.id}: {contribution.ime_plesa}</h4>
                    <span className="submission-date">
                        📅 {new Date(contribution.datum_ustvarjen).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' })}

                    </span>
                </div>
                {viewMode === 'compact' && (
                    <div className="quick-actions-compact">
                        {contribution.uporabnik_id !== currentUser?.id ? (
                            <>
                                <button
                                    className="quick-approve"
                                    onClick={() => handleAction('approve')}
                                    title={t('admin.quickApprove')}
                                >
                                    ✅
                                </button>
                                <button
                                    className="quick-edit-request"
                                    onClick={() => handleAction('edit')}
                                    title={t('admin.requestChanges')}
                                >
                                    ✏️
                                </button>
                                <button
                                    className="quick-edit"
                                    onClick={() => onEdit(contribution)}
                                    title={t('admin.directEdit')}
                                >
                                    📝
                                </button>
                                <button
                                    className="quick-reject"
                                    onClick={() => handleAction('reject')}
                                    title={t('admin.quickReject')}
                                >
                                    ❌
                                </button>
                            </>
                        ) : (
                            <span className="self-contribution-badge" title={t('admin.cannotModerateOwn')}>
                                🚫 {t('admin.ownContribution')}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Basic Info - Always visible but condensed in compact mode */}
            {(viewMode !== 'compact' || showDetails) && (
                <div className="contribution-basic-info">
                    <div className="info-row">
                        <span className="label">👤 {t('admin.author')}:</span>
                        <span className="value">
                            {contribution.je_anonimen
                                ? '🕶️ ' + t('admin.anonymous')
                                : `${contribution.user_ime || ''} ${contribution.priimek || ''}`.trim() || t('admin.unknown')
                            }
                        </span>
                    </div>

                    <div className="info-row">
                        <span className="label">📝 {t('admin.contributionDescription')}:</span>
                        <span className="value">{contribution.opis || t('admin.noDescription')}</span>
                    </div>

                    <div className="info-row">
                        <span className="label">📄 {t('admin.referenceDescription')}:</span>
                        <span className="value">{contribution.referenca_opis || t('admin.noReference')}</span>
                    </div>

                    <div className="info-row">
                        <span className="label">🔗 Референца URL:</span>
                        <span className="value">
                            {contribution.referenca_url ? (
                                <a href={contribution.referenca_url} target="_blank" rel="noopener noreferrer">
                                    {contribution.referenca_url}
                                </a>
                            ) : t('admin.noUrl')}
                        </span>
                    </div>
                </div>
            )}

            {/* Compact info for compact mode */}
            {viewMode === 'compact' && !showDetails && (
                <div className="compact-info">
                    <span className="compact-description">
                        {contribution.opis ? contribution.opis.substring(0, 100) + '...' : t('admin.noDescription')}
                    </span>
                    <div className="compact-meta">
                        <span>
                            {contribution.je_anonimen
                                ? '🕶️ ' + t('admin.anonymous')
                                : `📝 ${contribution.user_ime || ''} ${contribution.priimek || ''}`.trim() || t('admin.unknown')
                            }
                        </span>
                        {contribution.referenca_url && <span>🔗 {t('admin.hasReference')}</span>}
                    </div>
                </div>
            )}

            {/* Toggle Details Button - Not shown in compact mode quick actions */}
            {viewMode !== 'compact' && (
                <button
                    className="toggle-details-btn"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? '🔼 ' + t('admin.hideDetails') : '🔽 ' + t('admin.showDetails')}
                </button>
            )}

            {/* Show details toggle for compact mode */}
            {viewMode === 'compact' && (
                <button
                    className="compact-toggle-btn"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? '🔼' : '🔽'}
                </button>
            )}

            {/* Detailed Dance Information */}
            {showDetails && (
                <div className="contribution-details">
                    <h5>🎪 {t('admin.danceDetails')}</h5>

                    <div className="detail-section">
                        <div className="info-row">
                            <span className="label">🎭 {t('admin.danceName')}:</span>
                            <span className="value highlight">{contribution.ime_plesa || t('admin.undefined')}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">🎪 {t('admin.danceType')}:</span>
                            <span className="value">{contribution.tip_plesa || t('admin.undefined')}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">🗺️ {t('admin.region')}:</span>
                            <span className="value">{contribution.regija || t('admin.unknownRegion')}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">📜 {t('admin.shortHistory')}</span>
                            <span className="value">{contribution.kratka_zgodovina || t('admin.noHistory')}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">🎯 {t('admin.techniqueDescription')}</span>
                            <span className="value">{contribution.opis_tehnike || t('admin.noTechniqueDescription')}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Comment Section - Hidden in compact mode unless expanded */}
            {(viewMode !== 'compact' || showDetails) && contribution.uporabnik_id !== currentUser?.id && (
                <div className="comment-section">
                    <label htmlFor={`comment-${contribution.id}`} className="comment-label">
                        💬 {t('admin.moderatorComment')}
                    </label>
                    <textarea
                        id={`comment-${contribution.id}`}
                        className="comment-textarea"
                        placeholder={t('admin.commentPlaceholder')}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows="3"
                    />
                </div>
            )}

            {/* Moderation Actions - Different layout for compact mode */}
            {viewMode === 'compact' && !showDetails ? (
                // Compact mode already has quick actions in header
                null
            ) : contribution.uporabnik_id !== currentUser?.id ? (
                <div className="moderation-actions enhanced">
                    <button
                        className="approve-btn"
                        onClick={() => handleAction('approve')}
                        title={t('admin.approveContribution')}
                    >
                        ✅ {t('admin.approve')}
                    </button>

                    <button
                        className="edit-request-btn"
                        onClick={() => handleAction('edit')}
                        title={t('admin.requestChanges')}

                    >
                        ✏️ {t('admin.requestChanges')}
                    </button>

                    <button
                        className="direct-edit-btn"
                        onClick={() => onEdit(contribution)}
                        title={t('admin.directEditContribution')}
                    >
                        📝 {t('admin.editDirectly')}
                    </button>

                    <button
                        className="reject-btn"
                        onClick={() => handleAction('reject')}
                        title={t('admin.directEditContribution')}

                    >
                        ❌ {t('admin.reject')}
                    </button>
                </div>
            ) : (
                <div className="self-contribution-notice">
                    <p>🚫 {t('admin.cannotModerateOwn')}</p>
                    <small>{t('admin.contactOtherModerator')}</small>
                </div>
            )}
        </div>
    );
};

// Edit Contribution Modal Component
const EditContributionModal = ({ contribution, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        opis: contribution.opis || '',
        referenca_opis: contribution.referenca_opis || '',
        referenca_url: contribution.referenca_url || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(contribution.id, formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="modal-overlay">
            <div className="edit-modal">
                <div className="modal-header">
                    <h3>📝 {t('admin.editContribution')} #{contribution.id}</h3>
                    <button
                        className="close-btn"
                        onClick={onCancel}
                        title={t('admin.close')}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label htmlFor="opis">📝 {t('admin.contributionDescriptionLabel')}</label>
                        <textarea
                            id="opis"
                            value={formData.opis}
                            onChange={(e) => handleChange('opis', e.target.value)}
                            rows="4"
                            placeholder={t('admin.enterContributionDescription')}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="referenca_opis">📚 {t('admin.referenceDescriptionLabel')}</label>
                        <textarea
                            id="referenca_opis"
                            value={formData.referenca_opis}
                            onChange={(e) => handleChange('referenca_opis', e.target.value)}
                            rows="3"
                            placeholder={t('admin.enterReferenceDescription')}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="referenca_url">🔗 {t('admin.referenceUrlLabel')}</label>
                        <input
                            type="url"
                            id="referenca_url"
                            value={formData.referenca_url}
                            onChange={(e) => handleChange('referenca_url', e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onCancel}
                        >
                            ❌ {t('admin.cancelEdit')}
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                        >
                            💾 {t('admin.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminPanel;
