import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PublishFormPage from './pages/PublishAssetPage';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/publish" element={<PublishFormPage />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;