import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './SinglePost.css';

const SinglePost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/prispevki/${id}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setPost(data);
                console.log('Fetched ime_plesa:', data.ime_plesa);
            } else {
                setError('Прispevокот не е пронајден');
            }
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Грешка при вчитување на prispevокот');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Непознато';
        const date = new Date(dateString);
        return date.toLocaleDateString('mk-MK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getAuthorName = (post) => {
        if (post.je_anonimen) {
            return 'Анонимен автор';
        }
        return post.user_ime && post.priimek ? `${post.user_ime} ${post.priimek}` : 'Непознат автор';
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
                    <p className="loading-text">Се вчитува prispevокот...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="single-post-container">
                <div className="error-container">
                    <div className="error-message">
                        <h2 className="error-title">❌ Грешка</h2>
                        <p className="error-text">{error}</p>
                        <button onClick={() => navigate(-1)} className="retry-button">
                            ← Назад
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
                        ← Назад кон прispevци
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
                            {post.ime_plesa || 'Без наслов'}
                        </h1>
                        
                        <div className="post-type-region">
                            <div className="post-type">
                                {getTipIcon(post.tip_plesa)}
                                <span>{post.tip_plesa || 'Непознат тип'}</span>
                            </div>
                            <div className="post-region">
                                {getRegijaIcon(post.regija)}
                                <span>{post.regija || 'Непознат регион'}</span>
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
                                        Вашиот прегледувач не поддржува видео елемент.
                                    </video>
                                </div>
                            )}

                            {/* Image Content */}
                            {(post.image_url || (post.media && post.media.find(m => m.type === 'image'))) && (
                                <div className="multimedia-item image-container">
                                    <img 
                                        src={post.image_url || post.media.find(m => m.type === 'image')?.url}
                                        alt={`Слика за ${post.ime_plesa || 'плесот'}`}
                                        className="multimedia-image"
                                    />
                                </div>
                            )}

                            {/* Audio Content */}
                            {(post.audio_url || (post.media && post.media.find(m => m.type === 'audio'))) && (
                                <div className="multimedia-item audio-container">
                                    <div className="audio-header">
                                        🎵 Аудио запис на плесот
                                    </div>
                                    <audio 
                                        controls 
                                        className="multimedia-audio"
                                    >
                                        <source 
                                            src={post.audio_url || post.media.find(m => m.type === 'audio')?.url} 
                                            type="audio/mpeg" 
                                        />
                                        Вашиот прегледувач не поддржува аудио елемент.
                                    </audio>
                                </div>
                            )}

                            {/* Multiple Media Items */}
                            {post.media && post.media.length > 1 && (
                                <div className="multimedia-gallery">
                                    <div className="gallery-header">
                                        📸 Медиумска галерија
                                    </div>
                                    <div className="media-grid">
                                        {post.media.map((mediaItem, index) => (
                                            <div key={index} className="gallery-item">
                                                {mediaItem.type === 'image' && (
                                                    <img 
                                                        src={mediaItem.url} 
                                                        alt={`Медиум ${index + 1}`}
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
                                    📜 Историја на плесот
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
                                    🎯 Техника на извведување
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
                                    📝 Опис на прispevокот
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
                                    📚 Референци и извори
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
                                            🔗 Посети извор
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
                                        Објавено на {formatDate(post.datum_ustvarjen)}
                                    </div>
                                </div>
                            </div>

                            <div className="post-actions">
                                <button className="action-button like-button">
                                    ❤️ Допадна ми се
                                </button>
                                <button className="action-button share-button">
                                    📤 Сподели
                                </button>
                                <Link to="/prispevci" className="action-button edit-button">
                                    📋 Сите прispevци
                                </Link>
                            </div>
                        </div>
                    </footer>
                </article>

                {/* Related Posts Placeholder */}
                <section className="related-posts">
                    <h2 className="related-posts-title">
                        🔗 Поврзани прispevци
                    </h2>
                    <div className="related-posts-grid">
                        <div className="related-post-card">
                            <h3 className="related-post-title">Исто така може да ве интересира...</h3>
                            <p className="related-post-region">Прегледајте други прispevци за македонски фолклор</p>
                            <Link to="/prispevci" className="action-button share-button">
                                Прегледај сите
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SinglePost;
