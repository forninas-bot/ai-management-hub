import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Layout from './components/Layout';
import AIChat from './pages/AIChat';
import AIManagementCenter from './pages/AIManagementCenter';
import AIProjectDesign from './pages/AIProjectDesign';
import Pomodoro from './pages/Pomodoro';
import Notebook from './pages/Notebook';
import TaskCenter from './pages/TaskCenter';
import ProjectManagement from './pages/ProjectManagement';
import Settings from './pages/Settings';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<AIChat />} />
            <Route path="ai-center" element={<AIManagementCenter />} />
            <Route path="ai-design" element={<AIProjectDesign />} />
            <Route path="pomodoro" element={<Pomodoro />} />
            <Route path="notebook" element={<Notebook />} />
            <Route path="tasks" element={<TaskCenter />} />
            <Route path="projects" element={<ProjectManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
