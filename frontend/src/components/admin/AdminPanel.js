import React, { useState, useEffect, useCallback } from 'react';
import { useRole, USER_ROLES } from '../RoleBasedAccess';
import { useAuth } from '../../contexts/AuthContext';
import './AdminPanel.css';

const AdminPanel = () => {
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
            const response = await fetch('http://localhost:3001/moderacija/pending', {
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
            const response = await fetch('http://localhost:3001/moderacija/users', {
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
            const response = await fetch(`http://localhost:3001/moderacija/approve/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ moderatorNotes: notes })
            });
            
            if (response.ok) {
                alert('Прispevok одобрен!');
                fetchPendingContributions(); // Refresh list
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert('Грешка при одобрување: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error approving contribution:', error);
            alert('Грешка при одобрување');
        }
    };

    // Reject contribution
    const rejectContribution = async (id, notes = '') => {
        console.log('Rejecting contribution:', id, 'with notes:', notes);
        try {
            const response = await fetch(`http://localhost:3001/moderacija/reject/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ moderatorNotes: notes })
            });
            
            if (response.ok) {
                alert('Прispevok отфрлен!');
                fetchPendingContributions(); // Refresh list
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert('Грешка при отфрлање: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error rejecting contribution:', error);
            alert('Грешка при отфрлање');
        }
    };

    // Request edits for contribution
    const requestEdits = async (id, notes = '') => {
        console.log('Requesting edits for contribution:', id, 'with notes:', notes);
        try {
            const response = await fetch(`http://localhost:3001/moderacija/request-edit/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ moderatorNotes: notes })
            });
            
            if (response.ok) {
                alert('Барање за измена испратено!');
                fetchPendingContributions(); // Refresh list
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert('Грешка при барање за измена: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error requesting edits:', error);
            alert('Грешка при барање за измена');
        }
    };

    // Edit contribution directly
    const editContribution = async (id, updatedData) => {
        console.log('Editing contribution:', id, 'with data:', updatedData);
        try {
            const response = await fetch(`http://localhost:3001/moderacija/edit/${id}`, {
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
                alert('Прispevok успешно изменет!');
                setShowEditModal(false);
                setEditingContribution(null);
                fetchPendingContributions(); // Refresh list
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                alert('Грешка при измена: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error editing contribution:', error);
            alert('Грешка при измена');
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
            const response = await fetch(`http://localhost:3001/moderacija/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ newRole })
            });
            
            if (response.ok) {
                alert('Улогата е ажурирана!');
                fetchUsers(); // Refresh list
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Грешка при ажурирање на улогата');
        }
    };

    // Delete user (SuperAdmin only)
    const deleteUser = async (userId, userName) => {
        if (!isSuperAdmin) return;
        
        const confirmDelete = window.confirm(
            `Дали сте сигурни дека сакате да го избришете корисникот "${userName}"?\n\nОваа акција не може да се отповика!`
        );
        
        if (!confirmDelete) return;
        
        try {
            const response = await fetch(`http://localhost:3001/moderacija/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            
            if (response.ok) {
                alert('Корисникот е успешно избришан!');
                fetchUsers(); // Refresh list
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Грешка при бришење на корисникот');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Грешка при бришење на корисникот');
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
                <h2>🚫 Недостатни дозволи</h2>
                <p>Потребна е улога Komisija или Superadmin за пристап до админ панелот.</p>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>🛡️ Админ Панел</h1>
                <div className="user-role-badge">
                    {userRole === USER_ROLES.SUPERADMIN ? '👑 Superadmin' : '⚖️ Komisija'}
                </div>
            </div>

            <div className="admin-tabs">
                <button 
                    className={activeTab === 'overview' ? 'active' : ''}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Преглед
                </button>
                <button 
                    className={activeTab === 'moderation' ? 'active' : ''}
                    onClick={() => setActiveTab('moderation')}
                >
                    📝 Модерација
                </button>
                {isSuperAdmin && (
                    <button 
                        className={activeTab === 'users' ? 'active' : ''}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Корисници
                    </button>
                )}
            </div>

            <div className="admin-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <h2>📊 Преглед на системот</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>📄 Pending Prispevki</h3>
                                <p className="stat-number">{pendingContributions.length}</p>
                            </div>
                            <div className="stat-card">
                                <h3>👥 Вкупно корисници</h3>
                                <p className="stat-number">{users.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'moderation' && (
                    <div className="moderation-section">
                        <h2>📝 Модерација на содржини</h2>
                        
                        {/* Moderation Controls */}
                        <div className="moderation-controls">
                            <div className="sort-controls">
                                <label>🔀 Сортирај по:</label>
                                <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
                                    <option value="newest">📅 Најнови прво</option>
                                    <option value="oldest">📅 Најстари прво</option>
                                    <option value="id">🔢 По ID број</option>
                                    <option value="random">🎲 Случаен редослед</option>
                                </select>
                            </div>
                            
                            <div className="view-controls">
                                <label>📋 Приказ:</label>
                                <select onChange={(e) => setViewMode(e.target.value)} value={viewMode}>
                                    <option value="all">📄 Сите прispevки</option>
                                    <option value="compact">📋 Компактен приказ</option>
                                    <option value="detailed">📖 Детален приказ</option>
                                </select>
                            </div>
                            
                            <div className="quick-stats">
                                <span className="stat-badge">
                                    📊 Вкупно: {pendingContributions.length}
                                </span>
                            </div>
                        </div>
                        
                        {loading ? (
                            <p>Се вчитува...</p>
                        ) : pendingContributions.length === 0 ? (
                            <p>🎉 Нема pending prispevки за модерација!</p>
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
                        <h2>👥 Управување со корисници</h2>
                        {loading ? (
                            <p>Се вчитува...</p>
                        ) : (
                            <div className="users-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Име</th>
                                            <th>Email</th>
                                            <th>Улога</th>
                                            <th>Акции</th>
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
                                                            <option value={USER_ROLES.USER}>Navaden</option>
                                                        <option value={USER_ROLES.MODERATOR}>Komisija</option>
                                                        <option value={USER_ROLES.SUPERADMIN}>Superadmin</option>
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
                                                            🗑️ Избриши
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#666', fontStyle: 'italic' }}>
                                                            Тековен корисник
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
    const [comment, setComment] = useState('');
    const [showDetails, setShowDetails] = useState(viewMode === 'detailed');

    useEffect(() => {
        setShowDetails(viewMode === 'detailed');
    }, [viewMode]);

    const handleAction = (action) => {
        console.log('ContributionCard handleAction:', action, 'for contribution:', contribution.id, 'with comment:', comment);
        
        // Check if moderator is trying to moderate their own contribution
        if (contribution.uporabnik_id === currentUser?.id) {
            alert('⚠️ Не можете да ги модерирате своите објави!\nОбратете се до друг модератор.');
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
                    <h4>🎭 Prispevok #{contribution.id}</h4>
                    <span className="submission-date">
                        📅 {new Date(contribution.datum_ustvarjen).toLocaleDateString('mk-MK', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                </div>
                {viewMode === 'compact' && (
                    <div className="quick-actions-compact">
                        {contribution.uporabnik_id !== currentUser?.id ? (
                            <>
                                <button 
                                    className="quick-approve"
                                    onClick={() => handleAction('approve')}
                                    title="Брзо одобри"
                                >
                                    ✅
                                </button>
                                <button 
                                    className="quick-edit-request"
                                    onClick={() => handleAction('edit')}
                                    title="Побарај измени"
                                >
                                    ✏️
                                </button>
                                <button 
                                    className="quick-edit"
                                    onClick={() => onEdit(contribution)}
                                    title="Директно измени"
                                >
                                    📝
                                </button>
                                <button 
                                    className="quick-reject"
                                    onClick={() => handleAction('reject')}
                                    title="Брзо отфрли"
                                >
                                    ❌
                                </button>
                            </>
                        ) : (
                            <span className="self-contribution-badge" title="Вашата објава">
                                🚫 Своја
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Basic Info - Always visible but condensed in compact mode */}
            {(viewMode !== 'compact' || showDetails) && (
                <div className="contribution-basic-info">
                    <div className="info-row">
                        <span className="label">👤 Тип:</span>
                        <span className="value">{contribution.je_anonimen ? '🕶️ Анонимен' : '📝 Со име'}</span>
                    </div>
                    
                    <div className="info-row">
                        <span className="label">📝 Опис прispevok:</span>
                        <span className="value">{contribution.opis || 'Нема опис'}</span>
                    </div>

                    <div className="info-row">
                        <span className="label">📄 Референца опис:</span>
                        <span className="value">{contribution.referenca_opis || 'Нема референца'}</span>
                    </div>

                    <div className="info-row">
                        <span className="label">🔗 Референца URL:</span>
                        <span className="value">
                            {contribution.referenca_url ? (
                                <a href={contribution.referenca_url} target="_blank" rel="noopener noreferrer">
                                    {contribution.referenca_url}
                                </a>
                            ) : 'Нема URL'}
                        </span>
                    </div>
                </div>
            )}

            {/* Compact info for compact mode */}
            {viewMode === 'compact' && !showDetails && (
                <div className="compact-info">
                    <span className="compact-description">
                        {contribution.opis ? contribution.opis.substring(0, 100) + '...' : 'Нема опис'}
                    </span>
                    <div className="compact-meta">
                        <span>{contribution.je_anonimen ? '🕶️ Анонимен' : '📝 Со име'}</span>
                        {contribution.referenca_url && <span>🔗 Има референца</span>}
                    </div>
                </div>
            )}

            {/* Toggle Details Button - Not shown in compact mode quick actions */}
            {viewMode !== 'compact' && (
                <button 
                    className="toggle-details-btn"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? '🔼 Сокриј детали' : '🔽 Прикажи детали'}
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
                    <h5>🎪 Детали за плесот</h5>
                    
                    <div className="detail-section">
                        <div className="info-row">
                            <span className="label">🎭 Име на плес:</span>
                            <span className="value highlight">{contribution.ime_plesa || 'Недефинирано'}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">🎪 Тип на плес:</span>
                            <span className="value">{contribution.tip_plesa || 'Недефинирано'}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">🗺️ Регија:</span>
                            <span className="value">{contribution.regija || 'Непозната регија'}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">📜 Кратка историја:</span>
                            <span className="value">{contribution.kratka_zgodovina || 'Нема историја'}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">🎯 Опис на техника:</span>
                            <span className="value">{contribution.opis_tehnike || 'Нема опис на техника'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Comment Section - Hidden in compact mode unless expanded */}
            {(viewMode !== 'compact' || showDetails) && contribution.uporabnik_id !== currentUser?.id && (
                <div className="comment-section">
                    <label htmlFor={`comment-${contribution.id}`} className="comment-label">
                        💬 Коментар за модератор:
                    </label>
                    <textarea
                        id={`comment-${contribution.id}`}
                        className="comment-textarea"
                        placeholder="Напишете коментар или причина за одлуката..."
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
                        title="Одобри го prispevok-от"
                    >
                        ✅ Одобри
                    </button>
                    
                    <button 
                        className="edit-request-btn"
                        onClick={() => handleAction('edit')}
                        title="Побарај измени од корисникот"
                    >
                        ✏️ Побарај измени
                    </button>
                    
                    <button 
                        className="direct-edit-btn"
                        onClick={() => onEdit(contribution)}
                        title="Директно измени го prispevok-от"
                    >
                        📝 Измени директно
                    </button>
                    
                    <button 
                        className="reject-btn"
                        onClick={() => handleAction('reject')}
                        title="Отфрли го prispevok-от"
                    >
                        ❌ Отфрли
                    </button>
                </div>
            ) : (
                <div className="self-contribution-notice">
                    <p>🚫 Не можете да ги модерирате своите објави</p>
                    <small>Обратете се до друг модератор за оваа објава</small>
                </div>
            )}
        </div>
    );
};

// Edit Contribution Modal Component
const EditContributionModal = ({ contribution, onSave, onCancel }) => {
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
                    <h3>📝 Измени Prispevok #{contribution.id}</h3>
                    <button 
                        className="close-btn"
                        onClick={onCancel}
                        title="Затвори"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label htmlFor="opis">📝 Опис на prispevok:</label>
                        <textarea
                            id="opis"
                            value={formData.opis}
                            onChange={(e) => handleChange('opis', e.target.value)}
                            rows="4"
                            placeholder="Внесете опис на prispevok-от..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="referenca_opis">📚 Опис на референца:</label>
                        <textarea
                            id="referenca_opis"
                            value={formData.referenca_opis}
                            onChange={(e) => handleChange('referenca_opis', e.target.value)}
                            rows="3"
                            placeholder="Внесете опис на референца..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="referenca_url">🔗 URL на референца:</label>
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
                            ❌ Откажи
                        </button>
                        <button 
                            type="submit" 
                            className="save-btn"
                        >
                            💾 Зачувај измени
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminPanel;
