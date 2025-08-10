import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import '../posts/Posts.css';
import './Favorites.css';

const Favorites = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    
    // Like-related state
    const [likesData, setLikesData] = useState({});
    const [userLikes, setUserLikes] = useState(new Set());
    const [likingInProgress, setLikingInProgress] = useState(new Set());

    // Fetch liked posts
    const fetchLikedPosts = useCallback(async () => {
        console.log('fetchLikedPosts called - isAuthenticated:', isAuthenticated, 'user:', user);
        
        if (!isAuthenticated || !user?.id) {
            console.log('User not authenticated or no user ID, setting loading to false');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching from: http://localhost:3001/vsecki');
            const response = await fetch('http://localhost:3001/vsecki', {
                method: 'GET',
                credentials: 'include'
            });

            console.log('Response status:', response.status, 'Response ok:', response.ok);

            if (response.ok) {
                const responseData = await response.json();
                console.log('Fetched liked posts:', responseData);
                console.log('Type of response:', typeof responseData);
                console.log('Is array?', Array.isArray(responseData));
                
                // Check if response has success and data structure
                let postsArray = [];
                if (responseData.success && Array.isArray(responseData.data)) {
                    postsArray = responseData.data;
                } else if (Array.isArray(responseData)) {
                    postsArray = responseData;
                } else {
                    console.warn('Unexpected response structure:', responseData);
                }
                
                console.log('Posts array length:', postsArray.length);
                setPosts(postsArray);

                // Initialize likes data
                const initialLikesData = {};
                const userLikedIds = new Set();
                postsArray.forEach(post => {
                    initialLikesData[post.id] = post.like_count || 0;
                    userLikedIds.add(post.id); // All posts in favorites are liked by definition
                });
                setLikesData(initialLikesData);
                setUserLikes(userLikedIds);
            } else {
                console.error('Response not ok:', response.status, response.statusText);
                setError(t('posts.errorLoading'));
                setPosts([]);
            }
        } catch (err) {
            console.error('Error fetching liked posts:', err);
            setError(t('posts.errorServer'));
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user?.id, t]);

    // Handle like/unlike
    const handleLike = async (postId, event) => {
        event.stopPropagation();

        if (!isAuthenticated) {
            navigate('/prijava');
            return;
        }

        if (likingInProgress.has(postId)) {
            return;
        }

        setLikingInProgress(prev => new Set([...prev, postId]));

        try {
            const isCurrentlyLiked = userLikes.has(postId);
            const method = isCurrentlyLiked ? 'DELETE' : 'POST';

            const response = await fetch(`http://localhost:3001/vsecki/${postId}`, {
                method: method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();

                // Update user likes state
                setUserLikes(prev => {
                    const newSet = new Set(prev);
                    if (isCurrentlyLiked) {
                        newSet.delete(postId);
                        // Remove from posts array since this is favorites page
                        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                    } else {
                        newSet.add(postId);
                    }
                    return newSet;
                });

                // Update likes count
                setLikesData(prev => ({
                    ...prev,
                    [postId]: result.likeCount || 0
                }));
            } else {
                console.error('Error toggling like, response:', response.status);
                alert(t('posts.errorLiking'));
            }
        } catch (error) {
            console.error('Error handling like:', error);
            alert(t('posts.errorConnecting'));
        } finally {
            setLikingInProgress(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    };

    useEffect(() => {
        fetchLikedPosts();
    }, [fetchLikedPosts]);

    // Memoized sorted posts
    const sortedPosts = useMemo(() => {
        if (!Array.isArray(posts)) {
            return [];
        }

        const sortedArray = [...posts];
        switch (sortBy) {
            case 'newest':
                return sortedArray.sort((a, b) => new Date(b.datum_ustvarjen) - new Date(a.datum_ustvarjen));
            case 'oldest':
                return sortedArray.sort((a, b) => new Date(a.datum_ustvarjen) - new Date(b.datum_ustvarjen));
            case 'alphabetical':
                return sortedArray.sort((a, b) => (a.ime_plesa || '').localeCompare(b.ime_plesa || ''));
            default:
                return sortedArray;
        }
    }, [posts, sortBy]);

    // Helper functions
    const formatDate = (dateString) => {
        if (!dateString) return t('posts.unknownDate');
        const date = new Date(dateString);
        return date.toLocaleDateString('mk-MK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    const getAuthorName = (post) => {
        if (post.je_anonimen) {
            return t('posts.anonymous');
        }
        return post.user_ime && post.priimek ? `${post.user_ime} ${post.priimek}` : t('posts.unknownAuthor');
    };

    const getTipIcon = (tip) => {
        switch (tip) {
            case 'обредни': return '⛪';
            case 'посветни': return '🎭';
            case 'Оро': return '🕺';
            case 'Женско оро': return '💃';
            case 'Машко оро': return '🕺';
            case 'Соборно оро': return '👫';
            default: return '🎭';
        }
    };

    const getRegijaIcon = (regija) => {
        const regionIcons = {
            'Скопски регион': '🏛️',
            'Пелагониски регион': '🌾',
            'Источен регион': '🌄',
            'Југоисточен регион': '🗻',
            'Југозападен регион': '🏔️',
            'Вардарски регион': '🌊',
            'Североисточен регион': '🌲',
            'Полошки регион': '🌿'
        };
        return regionIcons[regija] || '📍';
    };

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="posts-container">
                <div className="error-message">
                    <h3>🔒 {t('auth.loginTitle')}</h3>
                    <p>{t('navigation.favorites')} - {t('auth.noAccount')}</p>
                    <Link to="/prijava" className="retry-btn">
                        {t('auth.loginButton')}
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="posts-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>{t('posts.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="posts-container">
                <div className="error-message">
                    <h3>❌ {t('common.error')}</h3>
                    <p>{error}</p>
                    <button onClick={fetchLikedPosts} className="retry-btn">
                        🔄 {t('posts.retryButton')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="posts-container favorites-container">
            {console.log('Rendering Favorites - loading:', loading, 'error:', error, 'posts.length:', posts.length, 'sortedPosts.length:', sortedPosts.length)}
            
            <div className="posts-header">
                <h1>❤️ {t('navigation.favorites')}</h1>
                <p>{t('favorites.subtitle')}</p>
            </div>

            {/* Sorting */}
            <div className="posts-controls">
                <div className="sort-section">
                    <label htmlFor="sort-select">📊 {t('posts.sortBy')}</label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="newest">{t('posts.newest')}</option>
                        <option value="oldest">{t('posts.oldest')}</option>
                        <option value="alphabetical">{t('posts.alphabetical')}</option>
                    </select>
                </div>
            </div>

            <div className="posts-stats">
                <span className="stats-item">
                    ❤️ {t('favorites.total')} {posts.length} {t('favorites.likedPosts')}
                </span>
            </div>

            {sortedPosts.length === 0 ? (
                <div className="no-posts">
                    <h3>💔 {t('favorites.noFavorites')}</h3>
                    <p>{t('favorites.noFavoritesText')}</p>
                    <div className="no-posts-actions">
                        <Link to="/prispevci" className="add-post-btn">
                            🔍 {t('favorites.browsePosts')}
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="posts-grid">
                    {sortedPosts.map(post => {
                        const isLiked = userLikes.has(post.id);
                        const isLiking = likingInProgress.has(post.id);

                        return (
                            <article
                                key={post.id}
                                className="post-card clickable-post-card"
                                onClick={() => navigate(`/prispevci/${post.id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        navigate(`/prispevci/${post.id}`);
                                    }
                                }}
                            >
                                <div className="post-card-header">
                                    <div className="post-type">
                                        {getTipIcon(post.tip_plesa)} {post.tip_plesa || t('posts.unknownType')}
                                    </div>
                                    <div className="post-region">
                                        {getRegijaIcon(post.regija)} {post.regija || t('posts.unknownRegion')}
                                    </div>
                                </div>

                                <div className="post-card-content">
                                    <h3 className="post-title">
                                        {post.ime_plesa || t('posts.noTitle')}
                                    </h3>

                                    {post.kratka_zgodovina && (
                                        <div className="post-history">
                                            <h4>📜 {t('posts.history')}</h4>
                                            <p>{post.kratka_zgodovina}</p>
                                        </div>
                                    )}

                                    {post.opis_tehnike && (
                                        <div className="post-technique">
                                            <h4>🎯 {t('posts.technique')}</h4>
                                            <p>{post.opis_tehnike}</p>
                                        </div>
                                    )}

                                    {post.opis && (
                                        <div className="post-description">
                                            <h4>📝 {t('posts.description')}</h4>
                                            <p>{post.opis}</p>
                                        </div>
                                    )}

                                    {post.referenca_opis && (
                                        <div className="post-reference">
                                            <h4>📚 {t('posts.reference')}</h4>
                                            <p>{post.referenca_opis}</p>
                                            {post.referenca_url && (
                                                <a
                                                    href={post.referenca_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="reference-link"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    🔗 {t('posts.visitReference')}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="post-card-footer">
                                    <div className="post-meta">
                                        <span className="post-author">
                                            👤 {getAuthorName(post)}
                                        </span>
                                        <span className="post-date">
                                            📅 {formatDate(post.datum_ustvarjen)}
                                        </span>
                                    </div>
                                    <div className="post-actions">
                                        <button 
                                            className={`action-btn like-btn ${isLiked ? 'liked' : ''} ${isLiking ? 'loading' : ''}`}
                                            title={isLiked ? t('posts.removeFromLiked') : t('posts.likePost')}
                                            onClick={(event) => handleLike(post.id, event)}
                                            disabled={isLiking}
                                        >
                                            {isLiking ? (
                                                '⏳'
                                            ) : (
                                                <>
                                                    {isLiked ? '❤️' : '🤍'} 
                                                    <span className="action-count">{likesData[post.id] || 0}</span>
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            className="action-btn share-btn" 
                                            title={t('posts.share')}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Share clicked for post:', post.id);
                                            }}
                                        >
                                            📤
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Favorites;