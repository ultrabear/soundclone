import { useState } from "react";
import HomePage from './components/HomePage';
import './styles/Layout.css';

function App() {
    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <h1 className="app-title">SoundClone</h1>
                    <div className="header-right">
                        <input
                            type="search"
                            placeholder="Search..."
                            className="search-input"
                        />
                        <div className="user-avatar" />
                    </div>
                </div>
            </header>
            <HomePage />
        </div>
    );
}

export default App;