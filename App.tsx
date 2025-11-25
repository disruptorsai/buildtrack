import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { TimeClock } from './pages/TimeClock';
import { ProjectGantt } from './pages/ProjectGantt';
import { DriverLog } from './pages/DriverLog';
import { Forms } from './pages/Forms';
import { Financials } from './pages/Financials';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/time" element={<TimeClock />} />
          <Route path="/schedule" element={<ProjectGantt />} />
          <Route path="/fleet" element={<DriverLog />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;