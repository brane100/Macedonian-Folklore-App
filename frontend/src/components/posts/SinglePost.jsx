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
    
    // Like-related state
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likingInProgress, setLikingInProgress] = useState(false);

    const fetchPost = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_API_URL}/prispevki/${id}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setPost(data);
                setLikeCount(data.like_count || 0);
                console.log('Fetched ime_plesa:', data.ime_plesa);
            } else {
                setError(t('singlePost.notFound'));
            }
        } catch (err) {
            console.error('Error fetching post:', err);
            setError(t('singlePost.loadingError'));
        } finally {
            setLoading(false);
        }
    }, [id]);

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
                                <span>{post.regija || t('singlePost.unknownRegion')}</span>
                            </div>
                        </div>
                    </header>

                    {/* Multimedia Section - Full Width */}
                    {(post.media || post.video_url || post.image_url || post.audio_url || post.multimedia) && (
                        <section className="multimedia-section">
                            {/* Video Content */}
                            {(post.video_url || (post.media && post.media.find(m => m.type === 'video'))) && (
                                <div className="multimedia-item video-container">
                                    <video 
                                        controls 
                                        className="multimedia-video"
                                        poster={post.video_thumbnail}
                                    >
                                        <source 
                                            src={post.video_url || post.media.find(m => m.type === 'video')?.url} 
                                            type="video/mp4" 
                                        />
                                        {t('singlePost.videoNotSupported')}
                                    </video>
                                </div>
                            )}

                            {/* Image Content */}
                            {(post.image_url || (post.media && post.media.find(m => m.type === 'image'))) && (
                                <div className="multimedia-item image-container">
                                    <img 
                                        src={post.image_url || post.media.find(m => m.type === 'image')?.url}
                                        alt={`${t('singlePost.imageAlt')} ${post.ime_plesa || t('singlePost.theDance')}`}
                                        className="multimedia-image"
                                    />
                                </div>
                            )}

                            {/* Audio Content */}
                            {(post.audio_url || (post.media && post.media.find(m => m.type === 'audio'))) && (
                                <div className="multimedia-item audio-container">
                                    <div className="audio-header">
                                        🎵 {t('singlePost.audioRecording')}
                                    </div>
                                    <audio 
                                        controls 
                                        className="multimedia-audio"
                                    >
                                        <source 
                                            src={post.audio_url || post.media.find(m => m.type === 'audio')?.url} 
                                            type="audio/mpeg" 
                                        />
                                        {t('singlePost.audioNotSupported')}
                                    </audio>
                                </div>
                            )}

                            {/* Multiple Media Items */}
                            {post.media && post.media.length > 1 && (
                                <div className="multimedia-gallery">
                                    <div className="gallery-header">
                                        📸 {t('singlePost.mediaGallery')}
                                    </div>
                                    <div className="media-grid">
                                        {post.media.map((mediaItem, index) => (
                                            <div key={index} className="gallery-item">
                                                {mediaItem.type === 'image' && (
                                                    <img 
                                                        src={mediaItem.url} 
                                                        alt={`${t('singlePost.media')} ${index + 1}`}
                                                        className="gallery-image"
                                                    />
                                                )}
                                                {mediaItem.type === 'video' && (
                                                    <video 
                                                        controls 
                                                        className="gallery-video"
                                                    >
                                                        <source src={mediaItem.url} type="video/mp4" />
                                                    </video>
                                                )}
                                                {mediaItem.type === 'audio' && (
                                                    <div className="gallery-audio-wrapper">
                                                        <div className="audio-icon">🎵</div>
                                                        <audio controls className="gallery-audio">
                                                            <source src={mediaItem.url} type="audio/mpeg" />
                                                        </audio>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                <button className="action-button share-button">
                                    📤 {t('singlePost.share')}
                                </button>
                                <Link to="/prispevci" className="action-button edit-button">
                                    📋 {t('singlePost.allPosts')}
                                </Link>
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
