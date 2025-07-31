import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './AppRouter.css';

// Import existing components
import MapMKD from './map/MapMKD';
import Login from './Login/Login';
import CreateContributionWizard from './contribution/CreateContributionWizard';

// 404 Component
function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>🏛️ Страницата не е најдена</h1>
        <p>Извинете, бараната страница не постои.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">🏠 Назад кон почетна</Link>
          <Link to="/mapa" className="btn btn-secondary">🗺️ Кон мапата</Link>
        </div>
      </div>
    </div>
  );
}

// Simple Home placeholder
function Home() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🏛️ Македонски фолклор</h1>
      <p>Добредојдовте на нашата апликација за македонски фолклор!</p>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/mapa" className="btn btn-primary" style={{ margin: '0 1rem' }}>
          🗺️ Отвори мапа
        </Link>
        <Link to="/dodaj-prispevek" className="btn btn-secondary" style={{ margin: '0 1rem' }}>
          📝 Додај приспеќок
        </Link>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <div className="app-router">
        {/* Simple Navigation */}
        <nav style={{ 
          padding: '1rem', 
          backgroundColor: '#ffc107', 
          borderBottom: '3px solid #dc3545',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link to="/" style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              textDecoration: 'none', 
              color: '#8b0000' 
            }}>
              🏛️ Македонски фолклор
            </Link>
            <Link to="/" style={{ textDecoration: 'none', color: '#8b0000' }}>🏠 Почетна</Link>
            <Link to="/mapa" style={{ textDecoration: 'none', color: '#8b0000' }}>🗺️ Мапа</Link>
            <Link to="/dodaj-prispevek" style={{ textDecoration: 'none', color: '#8b0000' }}>📝 Додај приспеќок</Link>
            <Link to="/prijava" style={{ textDecoration: 'none', color: '#8b0000' }}>👤 Prijava</Link>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            {/* Home page */}
            <Route path="/" element={<Home />} />
            
            {/* Map page */}
            <Route path="/mapa" element={<MapMKD />} />
            
            {/* Authentication routes */}
            <Route path="/prijava" element={<Login />} />
            
            {/* Contribution routes */}
            <Route path="/dodaj-prispevek" element={<CreateContributionWizard />} />
            
            {/* 404 route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Simple Footer */}
        <footer style={{ 
          padding: '2rem', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          textAlign: 'center',
          marginTop: 'auto'
        }}>
          <p>🏛️ Македонски фолклор © 2025</p>
        </footer>
      </div>
    </Router>
  );
}