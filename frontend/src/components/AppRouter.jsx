import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import existing components
import MapMKD from './map/MapMKD';
import Login from './Login/Login';

// Import new page components
import Home from '../pages/Home';
import CreateContribution from '../pages/CreateContribution';
import ViewContributions from '../pages/ViewContributions';
import ContributionDetail from '../pages/ContributionDetail';
import About from '../pages/About';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Navigation from './navigation/Navigation';
import Footer from './footer/Footer';

// 404 Component
function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>🏛️ Страницата не е најдена</h1>
        <p>Извинете, бараната страница не постои.</p>
        <div className="not-found-actions">
          <a href="/" className="btn btn-primary">🏠 Назад кон почетна</a>
          <a href="/prispevki" className="btn btn-secondary">🎭 Разгледај традиции</a>
        </div>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <div className="app-router">
        <Navigation />
        
        <main className="main-content">
          <Routes>
            {/* Home page */}
            <Route path="/" element={<Home />} />
            
            {/* Map page */}
            <Route path="/mapa" element={<MapMKD />} />
            
            {/* Authentication routes */}
            <Route path="/prijava" element={<Login />} />
            <Route path="/registracija" element={<Register />} />
            <Route path="/profil" element={<Profile />} />
            
            {/* Contribution routes */}
            <Route path="/dodaj-prispevek" element={<CreateContribution />} />
            <Route path="/prispevki" element={<ViewContributions />} />
            <Route path="/prispevek/:id" element={<ContributionDetail />} />
            
            {/* Info pages */}
            <Route path="/o-nas" element={<About />} />
            
            {/* 404 route - must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}