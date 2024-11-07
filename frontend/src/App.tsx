import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/Home/HomePage';
import PlaylistView from './components/Playlist/PlaylistView';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/playlist/:id" element={<PlaylistView />} />
                {/* other routes to be added */}
            </Routes>
        </Router>
    );
}

export default App;