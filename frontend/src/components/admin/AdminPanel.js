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

    // Approve contribution
    const approveContribution = async (id, notes = '') => {
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
            }
        } catch (error) {
            console.error('Error approving contribution:', error);
            alert('Грешка при одобрување');
        }
    };

    // Reject contribution
    const rejectContribution = async (id, notes = '') => {
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
            }
        } catch (error) {
            console.error('Error rejecting contribution:', error);
            alert('Грешка при отфрлање');
        }
    };

    // Request edits for contribution
    const requestEdits = async (id, notes = '') => {
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
            }
        } catch (error) {
            console.error('Error requesting edits:', error);
            alert('Грешка при барање за измена');
        }
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
                        {loading ? (
                            <p>Се вчитува...</p>
                        ) : pendingContributions.length === 0 ? (
                            <p>🎉 Нема pending prispevки за модерација!</p>
                        ) : (
                            <div className="contributions-list">
                                {pendingContributions.map(contribution => (
                                    <ContributionCard 
                                        key={contribution.id} 
                                        contribution={contribution}
                                        onApprove={approveContribution}
                                        onReject={rejectContribution}
                                        onRequestEdit={requestEdits}
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
        </div>
    );
};

// Individual Contribution Card Component
const ContributionCard = ({ contribution, onApprove, onReject, onRequestEdit }) => {
    const [comment, setComment] = useState('');
    const [showDetails, setShowDetails] = useState(false);

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

    const handleAction = (action) => {
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
        <div className="contribution-card enhanced">
            <div className="contribution-header">
                <h4>🎭 Prispevok #{contribution.id}</h4>
                <span className="submission-date">
                    📅 {new Date(contribution.datum_ustvarjen).toLocaleDateString('mk-MK')}
                </span>
            </div>

            {/* Basic Info */}
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

            {/* Toggle Details Button */}
            <button 
                className="toggle-details-btn"
                onClick={() => setShowDetails(!showDetails)}
            >
                {showDetails ? '🔼 Сокриј детали' : '🔽 Прикажи детали'}
            </button>

            {/* Detailed Dance Information */}
            {showDetails && (
                <div className="contribution-details">
                    <h5>🎪 Детали за плесот</h5>
                    
                    <div className="detail-section">
                        <div className="info-row">
                            <span className="label">🎭 Име на плес:</span>
                            <span className="value highlight">{contribution.ime_plesa || 'Неdefinirano'}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">🎪 Тип на плес:</span>
                            <span className="value">{contribution.tip_plesa || 'Неdefinirano'}</span>
                        </div>

                        <div className="info-row">
                            <span className="label">🗺️ Регија:</span>
                            <span className="value">{getRegionName(contribution.regija_id)}</span>
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

            {/* Comment Section */}
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

            {/* Moderation Actions */}
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
                    className="reject-btn"
                    onClick={() => handleAction('reject')}
                    title="Отфрли го prispevok-от"
                >
                    ❌ Отфрли
                </button>
            </div>
        </div>
    );
};

export default AdminPanel;
