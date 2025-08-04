import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './AppRouter.css';

// Import existing components
import MapMKD from './map/MapMKD';
import Login from './Login/Login';
import Register from './Register/Register';
import CreateContributionWizard from './contribution/CreateContributionWizard';

// 404 Component
function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>Страницата не е најдена</h1>
        <p>Извините, бараната страница не постои.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">Почетна страница</Link>
          <Link to="/mapa" className="btn btn-secondary">Кон мапата</Link>
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
          <h3>Потреба од помош?</h3>
          <p>Контактирајте не за било какви прашања околу македонската фолклорна традиција.</p>
          <button onClick={() => setIsOpen(false)}>Затвори</button>
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
  const topDances = mockDances.slice(0, 3).sort((a, b) => b.likes - a.likes);
  const popularRegions = ["Битола", "Охрид", "Штип", "Струмица"];
  
  return (
    <aside className="cultural-sidebar">
      <div className="sidebar-section">
        <h3>🎵 Топ ора</h3>
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
        <h3>📍 Популарни региони</h3>
        <div className="popular-regions">
          {popularRegions.map((region, index) => (
            <Link key={index} to={`/region/${region}`} className="region-link">
              {region}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="sidebar-section">
        <h3>📸 Скорешни медиуми</h3>
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
  return (
    <>
      {/* Hero Section with Cultural Background */}
      <section className="cultural-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Охрани културата што живее преку движење</h1>
          <p className="hero-subtitle">Истражи региони, откриј ора, зачувај наследство</p>
        </div>
      </section>

      {/* Regional Map Section */}
      <section className="regional-map-section">
        <div className="container">
          <h2>Истражи ја Македонија</h2>
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
              <h2>Фолклорни ора и традиции</h2>
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

// Navigation Component with Responsive Design
function NavigationBar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationLinks = [
    { path: '/', label: 'Почетна' },
    { path: '/plesi', label: 'Плеси' },
    { path: '/regioni', label: 'Региони' },
    { path: '/dodaj-prispevek', label: 'Зачлени се' },
    { path: '/kontakt', label: 'Контакт' }
  ];

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
          
          {/* Navigation Icons */}
          <div className="nav-icons">
            <button className="nav-icon-btn desktop-icon" title="Пребарај">
              🔍
            </button>
            <button className="nav-icon-btn desktop-icon" title="Фаворити">
              ❤️
            </button>
            <Link to="/prijava" className="nav-icon-btn desktop-icon" title="Профил">
              👤
            </Link>
            
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
              <button className="nav-icon-btn" title="Пребарај">
                🔍 Пребарај
              </button>
              <button className="nav-icon-btn" title="Фаворити">
                ❤️ Фаворити
              </button>
              <Link to="/prijava" className="nav-icon-btn" title="Профил" onClick={closeMobileMenu}>
                👤 Профил
              </Link>
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
            <button className="sidebar-icon-btn" title="Пребарај">
              🔍 Пребарај
            </button>
            <button className="sidebar-icon-btn" title="Фаворити">
              ❤️ Фаворити
            </button>
            <Link to="/prijava" className="sidebar-icon-btn" title="Профил" onClick={() => setIsSidebarOpen(false)}>
              👤 Профил
            </Link>
          </div>
        </div>
      </aside>
      
      {/* Overlay for Sidebar */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <div className="app-router">
        <NavigationBar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mapa" element={<MapMKD />} />
            <Route path="/prijava" element={<Login />} />
            <Route path="/registracija" element={<Register />} />
            <Route path="/dodaj-prispevek" element={<CreateContributionWizard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Enhanced Cultural Footer */}
        <footer className="cultural-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Охрани Култура</h4>
              <p>Зачувување на македонската фолклорна традиција за идните генерации.</p>
            </div>
            <div className="footer-section">
              <h4>Региони</h4>
              <ul>
                <li><Link to="/region/skopski">Скопски</Link></li>
                <li><Link to="/region/bitola">Битола</Link></li>
                <li><Link to="/region/ohrid">Охрид</Link></li>
                <li><Link to="/region/stip">Штип</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Ресурси</h4>
              <ul>
                <li><Link to="/za-nas">За нас</Link></li>
                <li><Link to="/kontakt">Контакт</Link></li>
                <li><Link to="/uslovni">Услови</Link></li>
                <li><Link to="/privatnost">Приватност</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Следи не</h4>
              <div className="social-links">
                <a href="#" aria-label="Facebook">📘</a>
                <a href="#" aria-label="Instagram">📷</a>
                <a href="#" aria-label="YouTube">📹</a>
                <a href="#" aria-label="TikTok">🎵</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 Охрани Култура. Сите права се заштитени.</p>
          </div>
        </footer>
        
        <FloatingChat />
      </div>
    </Router>
  );
}