import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Posts.css';

const Posts = ({
    searchQuery = '',
    setSearchQuery,
    title = '🎭 Фолклорни објави',
    subtitle = 'Одобрени објави за македонските ора и традиции',
    apiEndpoint = 'http://localhost:3001/prispevki/odobren',
    }) => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchApprovedPosts();
    }, []);

    const fetchApprovedPosts = async () => {
        try {
            const response = await fetch(apiEndpoint, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched posts data:', data); // Debug log
                console.log('First post structure:', data[0]); // Debug log
                setPosts(data);
            } else {
                setError('Грешка при вчитување на присpevки');
            }
        } catch (err) {
            console.error('Error fetching approved posts:', err);
            setError('Грешка при поврзување со серверот');
        } finally {
            setLoading(false);
        }
    };

    const getRegions = () => {
        console.log('Posts array:', posts); // Debug log
        console.log('Posts length:', posts.length); // Debug log

        const allRegions = posts.map(post => {
            console.log('Post regija:', post.regija); // Debug each post's region
            return post.regija;
        });
        console.log('All regions (before filter):', allRegions); // Debug log

        const filteredRegions = allRegions.filter(Boolean);
        console.log('Filtered regions (after removing empty):', filteredRegions); // Debug log

        const uniqueRegions = [...new Set(filteredRegions)];
        console.log('Unique regions:', uniqueRegions); // Debug log

        const sortedRegions = uniqueRegions.sort();
        console.log('Available regions (final):', sortedRegions); // Debug log

        return sortedRegions;
    };

    const filteredAndSortedPosts = () => {
        let filteredPosts = posts;

        // Debug logs
        console.log('Total posts:', posts.length);
        console.log('Current filter:', filter);
        console.log('Search query:', searchQuery);

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

        console.log('After search filter:', filteredPosts.length);

        // Filter by region
        if (filter !== 'all') {
            const beforeRegionFilter = filteredPosts.length;
            filteredPosts = filteredPosts.filter(post => {
                console.log(`Comparing post region "${post.regija}" with filter "${filter}"`);
                return post.regija === filter;
            });
            console.log(`Region filter: ${beforeRegionFilter} -> ${filteredPosts.length}`);
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
            return 'Анонимен';
        }
        return post.user_ime && post.priimek ? `${post.user_ime} ${post.priimek}` : 'Непознат автор';
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
                    <p>Се вчитуваат прispevки...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="posts-container">
                <div className="error-message">
                    <h3>❌ Грешка</h3>
                    <p>{error}</p>
                    <button onClick={fetchApprovedPosts} className="retry-btn">
                        🔄 Обиди се повторно
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
                        <h1>🔍 Резултати од пребарување</h1>
                        <p>Резултати за: "<strong>{searchQuery}</strong>"</p>
                        <div className="search-actions">
                            <button
                                onClick={() => setSearchQuery('')}
                                className="clear-search-btn"
                            >
                                ✕ Исчисти пребарување
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h1>{title}</h1>
                        <p>{subtitle}</p>
                    </>
                )}
            </div>

            {/* Filters and Sorting */}
            <div className="posts-controls">
                <div className="filter-section">
                    <label htmlFor="region-filter">📍 Филтрирај по регион:</label>
                    <div className="filter-controls">
                        <select
                            id="region-filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">Сите региони</option>
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
                                title="Исчисти филтер"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="sort-section">
                    <label htmlFor="sort-select">📊 Сортирај по:</label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="newest">Најнови</option>
                        <option value="oldest">Најстари</option>
                        <option value="alphabetical">Алфабетски</option>
                    </select>
                </div>
            </div>

            <div className="posts-stats">
                <span className="stats-item">
                    📝 Вкупно: {posts.length} прispevки
                </span>
                <span className="stats-item">
                    🔍 Прикажани: {filteredAndSortedPosts().length} прispевки
                </span>
                {searchQuery && (
                    <span className="stats-item search-indicator">
                        🔍 Пребарување: "{searchQuery}"
                    </span>
                )}
                {filter !== 'all' && (
                    <span className="stats-item filter-indicator">
                        📍 Филтер: {filter}
                    </span>
                )}
            </div>

            {filteredAndSortedPosts().length === 0 ? (
                <div className="no-posts">
                    {searchQuery ? (
                        <>
                            <h3>🔍 Нема пронајдени резултати</h3>
                            <p>Не се пронајдени prispevки што содржат "{searchQuery}".</p>
                            <div className="no-posts-actions">
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="clear-search-btn"
                                >
                                    ✕ Исчисти пребарување
                                </button>
                                <Link to="/dodaj-prispevek" className="add-post-btn">
                                    ➕ Додај prispevok
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3>🔍 Нема пронајдени прispevки</h3>
                            <p>Обидете се со различен филтер или додајте нов prispevok.</p>
                            <Link to="/dodaj-prispevek" className="add-post-btn">
                                ➕ Додај prispevok
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                <div className="posts-grid">
                    {filteredAndSortedPosts().map(post => (
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
                                    {getTipIcon(post.tip_plesa)} {post.tip_plesa || 'Непознат тип'}
                                </div>
                                <div className="post-region">
                                    {getRegijaIcon(post.regija)} {post.regija || 'Непознат регион'}
                                </div>
                            </div>

                            <div className="post-card-content">
                                <h3 className="post-title">
                                    {post.ime_plesa || 'Без наслов'}
                                </h3>

                                {post.kratka_zgodovina && (
                                    <div className="post-history">
                                        <h4>📜 Историја:</h4>
                                        <p>{post.kratka_zgodovina}</p>
                                    </div>
                                )}

                                {post.opis_tehnike && (
                                    <div className="post-technique">
                                        <h4>🎯 Техника:</h4>
                                        <p>{post.opis_tehnike}</p>
                                    </div>
                                )}

                                {post.besedilo_opis && (
                                    <div className="post-description">
                                        <h4>📝 Опис:</h4>
                                        <p>{post.besedilo_opis}</p>
                                    </div>
                                )}

                                {post.referenca_opis && (
                                    <div className="post-reference">
                                        <h4>📚 Референца:</h4>
                                        <p>{post.referenca_opis}</p>
                                        {post.referenca_url && (
                                            <a
                                                href={post.referenca_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="reference-link"
                                            >
                                                🔗 Посети референца
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
                                    <button className="action-btn like-btn" title="Допадна ми се">
                                        ❤️ <span className="action-count">0</span>
                                    </button>
                                    <button className="action-btn share-btn" title="Сподели">
                                        📤
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Posts;
