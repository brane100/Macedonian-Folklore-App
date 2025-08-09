import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../RoleBasedAccess';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './Navigation.css';

export default function Navigation() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { isModerator } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Initialize search query from URL params
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || '';
    setSearchQuery(urlSearchQuery);
  }, [searchParams]);

  // Clear search when route changes (except to posts pages)
  useEffect(() => {
    if (!location.pathname.startsWith('/plesi') && !location.pathname.startsWith('/prispevci')) {
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  }, [location.pathname]);

  // Handle search functionality
  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Navigate to plesi page with search parameter
      navigate(`/plesi?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchExpanded(false);
    }
    if (e.key === 'Escape') {
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setIsSearchExpanded(false);
    }
  };

  const handleMouseEnter = () => {
    setIsSearchExpanded(true);
  };

  const handleMouseLeave = () => {
    if (!searchQuery) {
      setIsSearchExpanded(false);
    }
  };

  const handleSearchChange = (e) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    
    // Update URL params if we're on a posts page
    if (location.pathname.startsWith('/plesi') || location.pathname.startsWith('/prispevci')) {
      const newSearchParams = new URLSearchParams(searchParams);
      if (newSearchQuery.trim()) {
        newSearchParams.set('search', newSearchQuery.trim());
      } else {
        newSearchParams.delete('search');
      }
      setSearchParams(newSearchParams);
    }
  };

  // Mobile menu controls
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Sidebar controls
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if path is active
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSidebarOpen(false);
  }, [location]);

  // Memoize navigation links to prevent unnecessary re-renders
  const navigationLinks = useMemo(() => {
    const baseNavigationLinks = [
      { path: '/plesi', label: t('navigation.posts') },
      { path: '/mapa', label: t('navigation.map') }
    ];

    const authenticatedLinks = [
      { path: '/dodaj-prispevek', label: 'Додај' },
    ];

    // Only show admin link to moderators/superadmins
    const adminLinks = [];
    if (isAuthenticated && isModerator) {
      adminLinks.push({ path: '/admin', label: '🛡️ Админ' });
    }

    return isAuthenticated
      ? [...baseNavigationLinks, ...authenticatedLinks, ...adminLinks]
      : baseNavigationLinks;
  }, [isAuthenticated, isModerator, t]);

  // Show loading state for critical auth-dependent elements
  if (loading) {
    return (
      <nav className="cultural-nav">
        <div className="nav-container">
          <Link to="/" className="cultural-logo">
            🪗 {t('navigation.home')}
          </Link>
          <div className="nav-center desktop-nav">
            <span style={{ opacity: 0.6 }}>{t('common.loading')}</span>
          </div>
          <div className="nav-icons">
            <span style={{ opacity: 0.6 }}>🔄</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Top Navigation Bar for Wide Screens */}
      <nav className="cultural-nav">
        <div className="nav-container">
          <Link to="/" className="cultural-logo">
            🪗 Охрани Култура
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-center desktop-nav">
            {navigationLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Compact Navigation for smaller screens */}
          <div className="nav-center compact-nav">
            {navigationLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Navigation Icons */}
          <div className="nav-icons">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Compact Search with Hover Expansion */}
            <div
              className="search-container"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`nav-icon-btn desktop-icon search-btn ${isSearchExpanded ? 'hidden' : ''}`}
                title="Пребарај"
                onClick={handleSearchClick}
              >
                🔍
              </button>
              <input
                type="text"
                placeholder="Пребарај плесови..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className={`search-input-hover ${isSearchExpanded ? 'expanded' : ''}`}
              />
            </div>

            <button className="nav-icon-btn desktop-icon" title="Фаворити" onClick={() => navigate('/favorites')}>
              ❤️
            </button>

            {/* Authentication-based Profile/Login section */}
            {isAuthenticated ? (
              <div className="user-dropdown desktop-icon">
                <button className="user-profile-btn" title={`Најавен како ${user?.ime || 'Корисник'}`}>
                  👤
                </button>
                <div className="dropdown-menu">
                  <div className="dropdown-item user-info">
                    {user?.ime || 'Корисник'}
                  </div>
                  <Link to="/moji-prispevki">
                    <button className="dropdown-item">
                      🚪 Мои објави
                    </button>
                  </Link>
                  <button
                    onClick={logout}
                    className="dropdown-item"
                  >
                    🚪 {t('navigation.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/prijava" className="nav-icon-btn desktop-icon" title={t('navigation.login')}>
                👤
              </Link>
            )}

            {/* Hamburger Menu for Small Screens */}
            <button
              className="hamburger-btn mobile-only"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            </button>

            {/* Sidebar Toggle for Medium Screens */}
            <button
              className="sidebar-toggle tablet-only"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className={`mobile-dropdown ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            {navigationLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            <div className="mobile-nav-icons">
              <div className="mobile-search">
                <input
                  type="text"
                  placeholder="Пребарај плесови..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="mobile-search-input"
                />
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      navigate(`/plesi?search=${encodeURIComponent(searchQuery.trim())}`);
                      closeMobileMenu();
                    }
                  }}
                  className="mobile-search-btn"
                >
                  🔍
                </button>
              </div>
              <button className="nav-icon-btn" title="Фаворити" onClick={() => navigate('/favorites')}>
                ❤️ Фаворити
              </button>

              {/* Authentication-based mobile menu */}
              {isAuthenticated ? (
                <>
                  <div className="mobile-user-info">
                    👤 {user?.ime || 'Корисник'}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className="nav-icon-btn logout-mobile"
                  >
                    🚪 {t('navigation.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/prijava" className="nav-icon-btn" onClick={closeMobileMenu}>
                    👤 {t('navigation.login')}
                  </Link>
                  <Link to="/registracija" className="nav-icon-btn" onClick={closeMobileMenu}>
                    ✏️ Регистрирај се
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar for Medium Screens */}
      <aside className={`nav-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={() => setIsSidebarOpen(false)}>
            🪗 Охрани Култура
          </Link>
          <button
            className="sidebar-close"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            {navigationLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`sidebar-nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-icons">
            <div className="sidebar-search">
              <input
                type="text"
                placeholder="Пребарај плесови..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="sidebar-search-input"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate(`/plesi?search=${encodeURIComponent(searchQuery.trim())}`);
                    setIsSidebarOpen(false);
                  }
                }}
                className="sidebar-search-btn"
              >
                🔍
              </button>
            </div>
            <button className="sidebar-icon-btn" title="Фаворити" onClick={() => navigate('/favorites')}>
              ❤️ Фаворити
            </button>

            {/* Authentication-based sidebar */}
            {isAuthenticated ? (
              <>
                <div className="sidebar-user-info">
                  👤 {user?.ime || 'Корисник'}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsSidebarOpen(false);
                  }}
                  className="sidebar-icon-btn logout-sidebar"
                >
                  � {t('navigation.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/prijava" className="sidebar-icon-btn" onClick={() => setIsSidebarOpen(false)}>
                  👤 {t('navigation.login')}
                </Link>
                <Link to="/registracija" className="sidebar-icon-btn" onClick={() => setIsSidebarOpen(false)}>
                  ✏️ Регистрирај се
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}