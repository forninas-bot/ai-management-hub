import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Layout from './components/Layout';
import AIChat from './pages/AIChat';
import AIManagementCenter from './pages/AIManagementCenter';
import AIProjectDesign from './pages/AIProjectDesign';
import AIShowcase from './pages/AIShowcase';
import Pomodoro from './pages/Pomodoro';
import Notebook from './pages/Notebook';
import TaskCenter from './pages/TaskCenter';
import ProjectManagement from './pages/ProjectManagement';
import Settings from './pages/Settings';
import MouseEffectsDemo from './pages/MouseEffectsDemo';
import EnhancedMouseEffectsDemo from './pages/EnhancedMouseEffectsDemo';
import SimpleEnhancedMouseEffectsDemo from './pages/SimpleEnhancedMouseEffectsDemo';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<AIChat />} />
            <Route path="ai-center" element={<AIManagementCenter />} />
            <Route path="ai-design" element={<AIProjectDesign />} />
            <Route path="ai-showcase" element={<AIShowcase />} />
            <Route path="pomodoro" element={<Pomodoro />} />
            <Route path="notebook" element={<Notebook />} />
            <Route path="tasks" element={<TaskCenter />} />
            <Route path="projects" element={<ProjectManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="mouse-effects" element={<MouseEffectsDemo />} />
            <Route path="enhanced-mouse-effects" element={<SimpleEnhancedMouseEffectsDemo />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
