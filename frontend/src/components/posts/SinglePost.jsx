import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './SinglePost.css';

const SinglePost = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mediaUrls, setMediaUrls] = useState([]);
    // const { isAuthenticated, user } = useAuth();

    // Helper to check if a URL is external
    const isExternalUrl = (url) => {
        if (!url) return false;
        return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
    };

    // Like-related state
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likingInProgress, setLikingInProgress] = useState(false);

    // Standardized region definitions (same as Posts.jsx)
    const STANDARD_REGIONS = {
        'Скопски': {
            aliases: ['скопски', 'skopje', 'скопје', 'скопско', 'скопски регион', 'Skopska', 'Скопје'],
            keywords: ['скоп']
        },
        'Полошки': {
            aliases: ['полошки', 'polog', 'полог', 'полошко', 'полошки регион', 'Galička', 'Полог', 'Polog'],
            keywords: ['полош', 'полог']
        },
        'Пелагониски': {
            aliases: ['пелагониски', 'pelagonia', 'пелагонија', 'пелагонијски', 'пелагониски регион', 'Pelagonija', 'Пелагонија'],
            keywords: ['пелагон']
        },
        'Вардарски': {
            aliases: ['вардарски', 'vardar', 'вардар', 'вардарско', 'вардарски регион', 'Tikveška', 'Vardarska Makedonija'],
            keywords: ['вардар']
        },
        'Источен': {
            aliases: ['источен', 'eastern', 'источно', 'источен регион', 'источна', 'Источна Македонија', 'Vzhodna Makedonija'],
            keywords: ['источ']
        },
        'Југозападен': {
            aliases: ['југозападен', 'southwestern', 'југозапад', 'югозападно', 'югозападен регион', 'Ohridsko-Struška', 'Југозападен дел', 'Jugozahodni del'],
            keywords: ['југозапад']
        },
        'Југоисточен': {
            aliases: ['југоисточен', 'southeastern', 'југоисток', 'югоисточно', 'югоисточен регион', 'Југоисточен дел', 'Jugovzhodni del'],
            keywords: ['југоисток']
        },
        'Североисточен': {
            aliases: ['североисточен', 'northeastern', 'североисток', 'североисточно', 'североисточен регион', 'Severoistočen del', 'Severovzhodni del'],
            keywords: ['североисток']
        }
    };

    // Smart function to match database region to standard region
    const normalizeRegion = (dbRegion) => {
        if (!dbRegion) return null;

        const cleanRegion = dbRegion.toLowerCase().trim();

        // Direct match with standard regions
        for (const [standardRegion, config] of Object.entries(STANDARD_REGIONS)) {
            if (standardRegion.toLowerCase() === cleanRegion) {
                return standardRegion;
            }

            // Check aliases
            if (config.aliases.some(alias => alias.toLowerCase() === cleanRegion)) {
                return standardRegion;
            }

            // Check if the database region contains any keywords
            if (config.keywords.some(keyword => cleanRegion.includes(keyword.toLowerCase()))) {
                return standardRegion;
            }
        }

        // If no match found, return the original region
        return dbRegion;
    };

    // Function to get translated region name
    const getTranslatedRegionName = (region) => {
        const regionTranslationKeys = {
            'Скопски': 'regions.skopje',
            'Полошки': 'regions.polog',
            'Пелагониски': 'regions.pelagonia',
            'Вардарски': 'regions.vardar',
            'Источен': 'regions.eastern',
            'Југозападен': 'regions.southwestern',
            'Југоисточен': 'regions.southeastern',
            'Североисточен': 'regions.northeastern'
        };
        return t(regionTranslationKeys[region] || 'regions.unknown');
    };

    const fetchPost = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/prispevki/${id}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Fetched post response:', responseData);

                // Handle different response formats
                let postData;
                if (responseData.success && responseData.data) {
                    // Wrapped response format
                    postData = responseData.data;
                } else if (responseData.id) {
                    // Direct post response format
                    postData = responseData;
                } else {
                    // Fallback
                    console.warn('Unexpected response format:', responseData);
                    postData = responseData;
                }
                setPost(postData);
                setLikeCount(postData.like_count || 0);
                console.log('Fetched post data:', postData);

                // Fetch media URLs for this post
                const mediaRes = await fetch(`${process.env.REACT_APP_API_URL}/prispevki/media/${id}`, {
                    credentials: 'include'
                });
                if (mediaRes.ok) {
                    const mediaData = await mediaRes.json();
                    console.log('Fetched media for post:', mediaData);
                    // Use the correct property from backend response
                    setMediaUrls(mediaData.mediaUrls || []);
                } else {
                    setMediaUrls([]);
                }
            } else {
                console.error('Response not ok:', response.status, response.statusText);
                setError(t('singlePost.notFound'));
            }
        } catch (err) {
            console.error('Error fetching post:', err);
            setError(t('singlePost.loadingError'));
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    // Fetch user like status for this post
    const fetchUserLikeStatus = useCallback(async () => {
        if (!isAuthenticated || !user?.id || !id) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/vsecki/liked-ids`, {
                credentials: 'include'
            });

            if (response.ok) {
                const likedPostIds = await response.json();
                setIsLiked(likedPostIds.includes(parseInt(id)));
            }
        } catch (error) {
            console.error('Error fetching user like status:', error);
        }
    }, [isAuthenticated, user?.id, id]);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchUserLikeStatus();
        }
    }, [fetchUserLikeStatus]);

    // Handle like/unlike
    const handleLike = async () => {
        if (!isAuthenticated) {
            navigate('/prijava');
            return;
        }

        if (likingInProgress) {
            return; // Prevent multiple clicks
        }

        setLikingInProgress(true);

        try {
            const method = isLiked ? 'DELETE' : 'POST';
            const response = await fetch(`${process.env.REACT_APP_API_URL}/vsecki/${id}`, {
                method: method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setIsLiked(!isLiked);
                setLikeCount(result.likeCount || 0);
            } else {
                console.error('Error toggling like, response:', response.status);
                alert(t('posts.errorLiking'));
            }
        } catch (error) {
            console.error('Error handling like:', error);
            alert(t('posts.errorConnecting'));
        } finally {
            setLikingInProgress(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('singlePost.unknownDate');
        const date = new Date(dateString);
        return date.toLocaleDateString('mk-MK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getAuthorName = (post) => {
        if (post.je_anonimen) {
            return t('singlePost.anonymousAuthor');
        }
        return post.user_ime && post.priimek ? `${post.user_ime} ${post.priimek}` : t('singlePost.unknownAuthor');
    };

    const getAuthorInitials = (post) => {
        if (post.je_anonimen) {
            return '🎭';
        }
        if (post.user_ime && post.priimek) {
            return `${post.user_ime.charAt(0)}${post.priimek.charAt(0)}`;
        }
        return '👤';
    };

    const getRegijaIcon = (regija) => {
        // Normalize the region first, then get the icon
        const normalizedRegion = normalizeRegion(regija);
        const regionIcons = {
            'Скопски': '🏛️',
            'Пелагониски': '🌾',
            'Источен': '🌄',
            'Југоисточен': '🗻',
            'Југозападен': '🏔️',
            'Вардарски': '🌊',
            'Североисточен': '🌲',
            'Полошки': '🌿'
        };
        return regionIcons[normalizedRegion] || '📍';
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

    if (loading) {
        return (
            <div className="single-post-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">{t('singlePost.loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="single-post-container">
                <div className="error-container">
                    <div className="error-message">
                        <h2 className="error-title">❌ {t('singlePost.error')}</h2>
                        <p className="error-text">{error}</p>
                        <button onClick={() => navigate(-1)} className="retry-button">
                            ← {t('singlePost.goBack')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Collect all media items (including legacy keys and fetched media)
    // Debug: log raw media sources
    console.log('mediaUrls:', mediaUrls);

    let allMedia = [];
    if (mediaUrls && Array.isArray(mediaUrls)) {
        allMedia = allMedia.concat(mediaUrls);
    }

    // Filter out any media items without a valid url
    // Only filter out items without a valid url, do not restrict by type
    allMedia = allMedia.filter(item => item && item.url);
    console.log('Final allMedia array:', allMedia);
    console.log('Post media count:', allMedia.length);

    // Debug: log when media section will be rendered
    if (allMedia.length > 0) {
        console.log('Rendering media section for post:', post.id || post._id);
        allMedia.forEach((mediaItem, idx) => {
            console.log(`Media item ${idx}:`, mediaItem);
        });
    } else {
        console.log('No media to display for post:', post.id || post._id);
    }

    return (
        <div className="single-post-container">
            <div className="single-post-wrapper">
                {/* Navigation */}
                <nav className="post-navigation">
                    <button onClick={() => navigate(-1)} className="back-button">
                        ← {t('singlePost.backToPosts')}
                    </button>
                    <div className="post-meta-info">
                        <span>{formatDate(post.datum_ustvarjen)}</span>
                    </div>
                </nav>

                {/* Main Post Card */}
                <article className="single-post-card">
                    {/* Header */}
                    <header className="single-post-header">
                        <h1 className="post-title-main">
                            {post.ime_plesa || t('singlePost.noTitle')}
                        </h1>

                        <div className="post-type-region">
                            <div className="post-type">
                                {getTipIcon(post.tip_plesa)}
                                <span>{post.tip_plesa || t('singlePost.unknownType')}</span>
                            </div>
                            <div className="post-region">
                                {getRegijaIcon(post.regija)}
                                <span>{getTranslatedRegionName(normalizeRegion(post.regija)) || t('singlePost.unknownRegion')}</span>
                            </div>
                        </div>
                    </header>

                    {/* Media Section - Always show if media exists */}
                    {allMedia.length > 0 && (
                        <section className="media-section">
                            {console.log('Media section is being rendered for post:', post.id || post._id)}
                            <h2 className="section-title">{t('singlePost.mediaGallery')}</h2>
                            <div className="media-grid">
                                {allMedia.map((mediaItem, index) => {
                                    let src = mediaItem.url;
                                    if (!isExternalUrl(src)) {
                                        src = `${process.env.REACT_APP_API_URL}/files/${src}`;
                                        console.log(src);
                                    }
                                    const key = mediaItem.id ? mediaItem.id : index;
                                    console.log(`Rendering media item ${index + 1}: `, mediaItem);
                                    if (mediaItem.type === 'slika' || mediaItem.type === 'image') {
                                        return (
                                            <div key={key} className="gallery-item">
                                                    <img
                                                        src={src}
                                                    alt={`${t('singlePost.media')} ${index + 1}`}
                                                    className="gallery-image"
                                                    style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                                />
                                            </div>
                                        );
                                    } else if (mediaItem.type === 'video') {
                                        return (
                                            <div key={key} className="gallery-item">
                                                <video controls className="gallery-video" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                                    <source src={src} type="video/mp4" />
                                                    {t('singlePost.videoNotSupported')}
                                                </video>
                                            </div>
                                        );
                                    } else if (mediaItem.type === 'avdio' || mediaItem.type === 'audio') {
                                        return (
                                            <div key={key} className="gallery-item gallery-audio-wrapper" style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                                                <div className="audio-icon" style={{ fontSize: '2rem', marginRight: '8px' }}>🎵</div>
                                                <audio controls className="gallery-audio" style={{ width: '100%' }}>
                                                    <source src={src} type="audio/mpeg" />
                                                    {t('singlePost.audioNotSupported')}
                                                </audio>
                                            </div>
                                        );
                                    } else {
                                        // fallback for other types
                                        return (
                                            <div key={key} className="gallery-item">
                                                <a href={src} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>{t('singlePost.downloadMedia')}</a>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </section>
                    )}

                    {/* Content */}
                    <main className="single-post-content">
                        {/* History Section */}
                        {post.kratka_zgodovina && (
                            <section className="content-section">
                                <h2 className="section-title">
                                    📜 {t('singlePost.danceHistory')}
                                </h2>
                                <div className="section-content">
                                    <p>{post.kratka_zgodovina}</p>
                                </div>
                            </section>
                        )}

                        {/* Technique Section */}
                        {post.opis_tehnike && (
                            <section className="content-section">
                                <h2 className="section-title">
                                    🎯 {t('singlePost.technique')}
                                </h2>
                                <div className="section-content">
                                    <p>{post.opis_tehnike}</p>
                                </div>
                            </section>
                        )}

                        {/* Description Section */}
                        {post.opis && (
                            <section className="content-section">
                                <h2 className="section-title">
                                    📝 {t('singlePost.postDescription')}
                                </h2>
                                <div className="section-content">
                                    <p>{post.opis}</p>
                                </div>
                            </section>
                        )}

                        {/* Reference Section */}
                        {(post.referenca_opis || post.referenca_url) && (
                            <section className="content-section reference-section">
                                <h2 className="section-title">
                                    📚 {t('singlePost.references')}
                                </h2>
                                <div className="section-content">
                                    {post.referenca_opis && <p>{post.referenca_opis}</p>}
                                    {post.referenca_url && (
                                        <a
                                            href={post.referenca_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="reference-link"
                                        >
                                            🔗 {t('singlePost.visitSource')}
                                        </a>
                                    )}
                                </div>
                            </section>
                        )}
                    </main>

                    {/* Footer */}
                    <footer className="single-post-footer">
                        <div className="author-info">
                            <div className="author-details">
                                <div className="author-avatar">
                                    {getAuthorInitials(post)}
                                </div>
                                <div className="author-text">
                                    <div className="author-name">
                                        {getAuthorName(post)}
                                    </div>
                                    <div className="post-date">
                                        {t('singlePost.publishedOn')} {formatDate(post.datum_ustvarjen)}
                                    </div>
                                </div>
                            </div>

                            <div className="post-actions">
                                <button
                                    className={`action-button like-button ${isLiked ? 'liked' : ''}`}
                                    onClick={handleLike}
                                    disabled={likingInProgress}
                                    title={isLiked ? t('posts.removeFromLiked') : t('posts.likePost')}
                                >
                                    {likingInProgress ? (
                                        <>🔄 {t('singlePost.like')}</>
                                    ) : (
                                        <>
                                            {isLiked ? '❤️' : '🤍'} {t('singlePost.like')}
                                            {likeCount > 0 && <span className="like-count"> ({likeCount})</span>}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </footer>
                </article>

                {/* Related Posts Placeholder */}
                <section className="related-posts">
                    <h2 className="related-posts-title">
                        🔗 {t('singlePost.relatedPosts')}
                    </h2>
                    <div className="related-posts-grid">
                        <div className="related-post-card">
                            <h3 className="related-post-title">{t('singlePost.youMightLike')}</h3>
                            <p className="related-post-region">{t('singlePost.browseOtherPosts')}</p>
                            <Link to="/prispevci" className="action-button share-button">
                                {t('singlePost.browseAll')}
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SinglePost;
