import React from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav style={{ padding: '1rem', backgroundColor: '#ffc107' }}>
      <Link to="/" style={{ margin: '0 1rem' }}>🏠 Почетна</Link>
      <Link to="/mapa" style={{ margin: '0 1rem' }}>🗺️ Мапа</Link>
      <Link to="/prispevki" style={{ margin: '0 1rem' }}>🎭 Традиции</Link>
      <Link to="/dodaj-prispevek" style={{ margin: '0 1rem' }}>📝 Додај</Link>
      <Link to="/prijava" style={{ margin: '0 1rem' }}>👤 Prijava</Link>
    </nav>
  );
}