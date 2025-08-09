import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './Posts.css';    

const Posts = ({
    title,
    subtitle,
    apiEndpoint = 'http://localhost:3001/prispevki/odobren',
}) => {
    // console.log('Posts component is rendering!');
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Use translations as default values
    const displayTitle = title || `🎭 ${t('posts.title')}`;
    const displaySubtitle = subtitle || t('posts.approvedPosts');

    // Get search query from URL parameters
    const searchQuery = searchParams.get('search') || '';

    // Function to clear search
    const clearSearch = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('search');
        setSearchParams(newSearchParams);
    };

    // State for likes and user favorites
    const [likesData, setLikesData] = useState({});
    const [userLikes, setUserLikes] = useState(new Set());
    const [likingInProgress, setLikingInProgress] = useState(new Set());

    // Functions defined with useCallback to prevent unnecessary re-renders
    const fetchApprovedPosts = useCallback(async () => {
        try {
            const response = await fetch(apiEndpoint, {
                credentials: 'include'
            });

            if (response.ok) {
                const postsArray = await response.json();
                console.log('Fetched posts data:', postsArray);
                
                setPosts(postsArray);
                
                // Initialize likes data from the like_count field in each post
                const initialLikesData = {};
                postsArray.forEach(post => {
                    initialLikesData[post.id] = post.like_count || 0;
                });
                setLikesData(initialLikesData);
            } else {
                setError(t('posts.errorLoading'));
                setPosts([]);
            }
        } catch (err) {
            console.error('Error fetching approved posts:', err);
            setError(t('posts.errorServer'));
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [apiEndpoint, t]);

    const fetchUserLikes = async () => {
        try {
            const response = await fetch('http://localhost:3001/vsecki/liked-ids', {
                credentials: 'include'
            });

            if (response.ok) {
                const likedPostIds = await response.json();
                setUserLikes(new Set(likedPostIds));
            }
        } catch (error) {
            console.error('Error fetching user likes:', error);
        }
    };

    // Define handleLike as a regular function
    const handleLike = async (postId, event) => {
        console.log('handleLike called with postId:', postId);
        
        // Prevent event bubbling to avoid navigating to post detail
        event.stopPropagation();

        if (!isAuthenticated) {
            navigate('/prijava');
            return;
        }

        if (likingInProgress.has(postId)) {
            return; // Prevent multiple clicks
        }

        setLikingInProgress(prev => new Set([...prev, postId]));

        try {
            const isCurrentlyLiked = userLikes.has(postId);
            const method = isCurrentlyLiked ? 'DELETE' : 'POST';

            console.log('Sending request:', method, `http://localhost:3001/vsecki/${postId}`);

            const response = await fetch(`http://localhost:3001/vsecki/${postId}`, {
                method: method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Like response:', result);

                // Update user likes state
                setUserLikes(prev => {
                    const newSet = new Set(prev);
                    if (isCurrentlyLiked) {
                        newSet.delete(postId);
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

    // useEffect hooks
    useEffect(() => {
        fetchApprovedPosts();
    }, [fetchApprovedPosts]);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchUserLikes();
        }
    }, [isAuthenticated, user?.id]);

    // Memoized filtered and sorted posts
    const filteredAndSortedPosts = useMemo(() => {
        // Ensure posts is always an array
        if (!Array.isArray(posts)) {
            console.warn('Posts is not an array:', posts);
            return [];
        }

        let filteredPosts = [...posts]; // Create a copy to avoid mutating original

        // Filter by search query first
        if (searchQuery && searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            filteredPosts = filteredPosts.filter(post => {
                const danceName = (post.ime_plesa || '').toLowerCase();
                const danceType = (post.tip_plesa || '').toLowerCase();
                const region = (post.regija || '').toLowerCase();
                const description = (post.opis || '').toLowerCase();
                const shortHistory = (post.kratka_zgodovina || '').toLowerCase();
                const technique = (post.opis_tehnike || '').toLowerCase();

                return danceName.includes(query) ||
                    danceType.includes(query) ||
                    region.includes(query) ||
                    description.includes(query) ||
                    shortHistory.includes(query) ||
                    technique.includes(query);
            });
        }

        // Filter by region
        if (filter !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.regija === filter);
        }

        // Sort posts
        switch (sortBy) {
            case 'newest':
                return filteredPosts.sort((a, b) => new Date(b.datum_ustvarjen) - new Date(a.datum_ustvarjen));
            case 'oldest':
                return filteredPosts.sort((a, b) => new Date(a.datum_ustvarjen) - new Date(b.datum_ustvarjen));
            case 'alphabetical':
                return filteredPosts.sort((a, b) => (a.ime_plesa || '').localeCompare(b.ime_plesa || ''));
            default:
                return filteredPosts;
        }
    }, [posts, searchQuery, filter, sortBy]);

    // Helper functions
    const getRegions = () => {
        const allRegions = posts.map(post => post.regija).filter(Boolean);
        const uniqueRegions = [...new Set(allRegions)];
        return uniqueRegions.sort();
    };

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
                    <button onClick={fetchApprovedPosts} className="retry-btn">
                        🔄 {t('posts.retryButton')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="posts-container">
            <div className="posts-header">
                {searchQuery ? (
                    <>
                        <h1>🔍 {t('posts.searchResults')}</h1>
                        <p>{t('posts.searchResultsFor')} "<strong>{searchQuery}</strong>"</p>
                        <div className="search-actions">
                            <button
                                onClick={clearSearch}
                                className="clear-search-btn"
                            >
                                ✕ {t('posts.clearSearch')}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h1>{displayTitle}</h1>
                        <p>{displaySubtitle}</p>
                    </>
                )}
            </div>

            {/* Filters and Sorting */}
            <div className="posts-controls">
                <div className="filter-section">
                    {/* {console.log('Translation for filterByRegion:', t('posts.filterByRegion'))} */}
                    <label htmlFor="region-filter">📍 {t('posts.filterByRegion')}</label>
                    <div className="filter-controls">
                        <select
                            id="region-filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">{t('posts.allRegions')}</option>
                            {getRegions().map(region => (
                                <option key={region} value={region}>
                                    {getRegijaIcon(region)} {region}
                                </option>
                            ))}
                        </select>
                        {filter !== 'all' && (
                            <button
                                onClick={() => setFilter('all')}
                                className="clear-filter-btn"
                                title={t('posts.clearFilter')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

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
                    📝 {t('posts.total')} {posts.length} {t('posts.postsCount')}
                </span>
                <span className="stats-item">
                    🔍 {t('posts.displayed')} {filteredAndSortedPosts.length} {t('posts.postsCount')}
                </span>
                {searchQuery && (
                    <span className="stats-item search-indicator">
                        🔍 {t('posts.searchIndicator')} "{searchQuery}"
                    </span>
                )}
                {filter !== 'all' && (
                    <span className="stats-item filter-indicator">
                        📍 {t('posts.filterIndicator')} {filter}
                    </span>
                )}
            </div>

            {filteredAndSortedPosts.length === 0 ? (
                <div className="no-posts">
                    {searchQuery ? (
                        <>
                            <h3>🔍 {t('posts.noPostsFound')}</h3>
                            <p>{t('posts.noPostsSearchText')} "{searchQuery}".</p>
                            <div className="no-posts-actions">
                                <button
                                    onClick={clearSearch}
                                    className="clear-search-btn"
                                >
                                    ✕ {t('posts.clearSearch')}
                                </button>
                                <Link to="/dodaj-prispevek" className="add-post-btn">
                                    ➕ {t('posts.addPost')}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3>🔍 {t('posts.noPostsFound')}</h3>
                            <p>{t('posts.noPostsFilterText')}</p>
                            <Link to="/dodaj-prispevek" className="add-post-btn">
                                ➕ {t('posts.addPost')}
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                <div className="posts-grid">
                    {filteredAndSortedPosts.map(post => {
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
                                            className={`action-btn like-btn ${isLiked ? 'liked' : ''} ${isLiking ? 'loading' : ''} ${!isAuthenticated ? 'guest' : ''}`}
                                            title={isLiked ? t('posts.removeFromLiked') : t('posts.likePost')}
                                            onClick={(event) => {
                                                console.log('Like button clicked for post:', post.id);
                                                handleLike(post.id, event);
                                            }}
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
                                                // Add share functionality here
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

export default Posts;
