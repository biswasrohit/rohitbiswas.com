import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import PageRankDemo from './pages/PageRankDemo.jsx';
import First90DaysPage from './pages/First90DaysPage.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/pagerank" element={<PageRankDemo />} />
      <Route path="/first-90-days" element={<First90DaysPage />} />
    </Routes>
  </BrowserRouter>
);
