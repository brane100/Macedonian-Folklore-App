import React, { useState, useMemo, useEffect } from 'react';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useRole, ModeratorGuard } from './RoleBasedAccess';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './AppRouter.css';

// Import existing components
import MapMKD from './map/MapMKD';
import Login from './Login/Login';
import Register from './Register/Register';
import CreateContributionWizard from './contribution/CreateContributionWizard';
import AdminPanel from './admin/AdminPanel';
import Posts from './posts/Posts';
import SinglePost from './posts/SinglePost';
import UserSubmissions from './user/UserSubmissions';
import EditContribution from './user/EditContribution';
import Favorites from './favorites/Favorites';
import Navigation from './navigation/Navigation';

// 404 Component
function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>{t('errors.pageNotFound')}</h1>
        <p>{t('errors.pageNotFoundMessage')}</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">{t('buttons.homePage')}</Link>
          <Link to="/mapa" className="btn btn-secondary">{t('buttons.toMap')}</Link>
        </div>
      </div>
    </div>
  );
}

// Mock data for folk dances
const mockDances = [
  {
    id: 1,
    title: "Тешкото",
    region: "Западна Македонија",
    author: "Марија Петковска",
    date: "15.12.2024",
    description: "Традиционално машко оро од западниот дел на Македонија, познато по својата комплексна хореографија и енергични движења.",
    image: "🕺",
    tags: ["#Западна", "#Машко", "#Тешко"],
    likes: 24,
    comments: 8
  },
  {
    id: 2,
    title: "Калајџиското",
    region: "Штип",
    author: "Стефан Николовски",
    date: "12.12.2024",
    description: "Занаетчиско оро што го играат калајџиите во источна Македонија, со карактеристични ритмички обрасци.",
    image: "🔨",
    tags: ["#Источна", "#Занаетчиско", "#Калајџии"],
    likes: 31,
    comments: 12
  },
  {
    id: 3,
    title: "Неврокопчанка",
    region: "Струмица",
    author: "Ана Стојанова",
    date: "10.12.2024",
    description: "Женско оро од југоисточниот регион, познато по грациозните движења и традиционалните носии.",
    image: "💃",
    tags: ["#Југоисточна", "#Женско", "#Носии"],
    likes: 45,
    comments: 15
  },
  {
    id: 4,
    title: "Пајдушко",
    region: "Велес",
    author: "Димитар Митревски",
    date: "08.12.2024",
    description: "Брзо оро од централна Македонија, играно за време на младешки собири и весели настани.",
    image: "🎵",
    tags: ["#Централна", "#Брзо", "#Младешко"],
    likes: 18,
    comments: 6
  },
  {
    id: 5,
    title: "Букурешко",
    region: "Битола",
    author: "Елена Атанасова",
    date: "05.12.2024",
    description: "Соборно оро од Битола, со влијанија од балканската традиција и богата инструментална пратка.",
    image: "🪗",
    tags: ["#Битола", "#Соборно", "#Балкански"],
    likes: 52,
    comments: 20
  },
  {
    id: 6,
    title: "Старо городе",
    region: "Охрид",
    author: "Петар Здравески",
    date: "02.12.2024",
    description: "Историско оро од Охрид што ја прикажува убавината на старите македонски градови.",
    image: "🏛️",
    tags: ["#Охрид", "#Историско", "#Градско"],
    likes: 67,
    comments: 25
  }
];

// Floating Chat Component
function FloatingChat() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="floating-chat">
      <button
        className={`chat-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>
      {isOpen && (
        <div className="chat-modal">
          <h3>{t('chat.needHelp')}</h3>
          <p>{t('chat.contactMessage')}</p>
          <button onClick={() => setIsOpen(false)}>{t('chat.close')}</button>
        </div>
      )}
    </div>
  );
}

// Dance Card Component
function DanceCard({ dance }) {
  return (
    <div className="dance-card">
      <div className="dance-card-image">
        <span className="dance-emoji">{dance.image}</span>
      </div>
      <div className="dance-card-content">
        <div className="dance-meta">
          од {dance.author} – {dance.date}
        </div>
        <h3 className="dance-title">{dance.title}</h3>
        <p className="dance-description">{dance.description}</p>
        <div className="dance-tags">
          {dance.tags.map((tag, index) => (
            <span key={index} className="dance-tag">{tag}</span>
          ))}
        </div>
        <div className="dance-actions">
          <span className="dance-reaction">
            ❤️ {dance.likes}
          </span>
          <span className="dance-reaction">
            💬 {dance.comments}
          </span>
          <span className="dance-region-badge">{dance.region}</span>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar() {
  const { t } = useTranslation();
  const topDances = mockDances.slice(0, 3).sort((a, b) => b.likes - a.likes);
  const popularRegions = ["Битола", "Охрид", "Штип", "Струмица"];

  return (
    <aside className="cultural-sidebar">
      <div className="sidebar-section">
        <h3>🎵 {t('sections.topDances')}</h3>
        <div className="top-dances">
          {topDances.map(dance => (
            <div key={dance.id} className="top-dance-item">
              <span className="top-dance-emoji">{dance.image}</span>
              <div>
                <div className="top-dance-title">{dance.title}</div>
                <div className="top-dance-likes">❤️ {dance.likes}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>📍 {t('sections.popularRegions')}</h3>
        <div className="popular-regions">
          {popularRegions.map((region, index) => (
            <Link key={index} to={`/region/${region}`} className="region-link">
              {region}
            </Link>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>📸 {t('sections.recentMedia')}</h3>
        <div className="recent-media">
          <div className="media-preview">🎥 Тешкото - видео</div>
          <div className="media-preview">🎵 Калајџиското - аудио</div>
          <div className="media-preview">📷 Традиционални носии</div>
        </div>
      </div>
    </aside>
  );
}

// Enhanced Home Component with Hero Section and Masonry Grid
function Home() {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero Section with Cultural Background */}
      <section className="cultural-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
        </div>
      </section>

      {/* Regional Map Section */}
      <section className="regional-map-section">
        <div className="container">
          <h2>{t('sections.exploreMacedonia')}</h2>
          <div className="map-container">
            <MapMKD />
          </div>
        </div>
      </section>

      {/* Main Content with Masonry Grid and Sidebar */}
      <section className="main-cultural-content">
        <div className="container">
          <div className="content-layout">
            <div className="content-main">
              <h2>{t('sections.folkloreAndTraditions')}</h2>
              <div className="masonry-grid">
                {mockDances.map(dance => (
                  <DanceCard key={dance.id} dance={dance} />
                ))}
              </div>
            </div>
            <Sidebar />
          </div>
        </div>
      </section>
    </>
  );
}

export default function AppRouter() {
  const { t } = useTranslation();

  return (
    <AuthProvider>
      <Router>
        <div className="app-router">
          <Navigation />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mapa" element={<MapMKD />} />
              <Route path="/plesi" element={<Posts />} />
              <Route path="/prispevci" element={<Posts />} />
              <Route path="/prispevci/:id" element={<SinglePost />} />

                <Route path="/favorites" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />

              {/* Public routes - redirect to home if already logged in */}
              <Route
                path="/prijava"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/registracija"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected routes - require authentication */}
              <Route
                path="/dodaj-prispevek"
                element={
                  <ProtectedRoute>
                    <CreateContributionWizard />
                  </ProtectedRoute>
                }
              />

              {/* User submissions route - requires authentication */}
              <Route
                path="/moji-prispevki"
                element={
                  <ProtectedRoute>
                    <UserSubmissions />
                  </ProtectedRoute>
                }
              />

              {/* Edit contribution route - requires authentication */}
              <Route
                path="/prispevki/uredi/:id"
                element={
                  <ProtectedRoute>
                    <EditContribution />
                  </ProtectedRoute>
                }
              />

              {/* Admin route - requires moderator role */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <ModeratorGuard
                      fallback={
                        <div style={{
                          textAlign: 'center',
                          padding: '2rem',
                          background: '#fff3cd',
                          border: '1px solid #ffeaa7',
                          borderRadius: '8px',
                          margin: '2rem'
                        }}>
                          <h3>🚫 {t('errors.insufficientPermissions')}</h3>
                          <p>{t('errors.insufficientPermissionsMessage')}</p>
                        </div>
                      }
                    >
                      <AdminPanel />
                    </ModeratorGuard>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Enhanced Cultural Footer */}
          <footer className="cultural-footer">
            <div className="footer-content">
              <div className="footer-section">
                <h4>{t('footer.preserveCulture')}</h4>
                <p>{t('footer.preserveDescription')}</p>
              </div>
              <div className="footer-section">
                <h4>{t('footer.regions')}</h4>
                <ul>
                  <li><Link to="/region/skopski">Скопски</Link></li>
                  <li><Link to="/region/bitola">Битола</Link></li>
                  <li><Link to="/region/ohrid">Охрид</Link></li>
                  <li><Link to="/region/stip">Штип</Link></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>{t('footer.resources')}</h4>
                <ul>
                  <li><Link to="/za-nas">{t('footer.aboutUs')}</Link></li>
                  <li><Link to="/kontakt">{t('footer.contact')}</Link></li>
                  <li><Link to="/uslovni">{t('footer.terms')}</Link></li>
                  <li><Link to="/privatnost">{t('footer.privacy')}</Link></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>{t('footer.followUs')}</h4>
                <div className="social-links">
                  <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">📘</a>
                  <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">📷</a>
                  <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer">📹</a>
                  <a href="https://tiktok.com" aria-label="TikTok" target="_blank" rel="noopener noreferrer">🎵</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>{t('footer.copyright')}</p>
            </div>
          </footer>

          <FloatingChat />
        </div>
      </Router>
    </AuthProvider>
  );
}