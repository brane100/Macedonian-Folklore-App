
import './App.css';
import MapMKD from './components/map/MapMKD.jsx';

function App() {
  return (
    <>
      <header className="App-header">
        <h1>Macedonian Folklore App</h1>
      </header>
      <main>
        <p>Explore the rich folklore of Macedonia through this interactive map.</p>
      </main>
      <footer className="App-footer">
        <p>&copy; 2023 Macedonian Folklore App</p>
      </footer>
      {/* Render the map component */}
      <div className="map-container">
        <MapMKD />
      </div>
    </>
  );
}

export default App;
