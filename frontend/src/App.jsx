import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  Database
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Scanning from './pages/Scanning';
import DatabaseView from './pages/Database';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'scanning':
        return <Scanning />;
      case 'database':
        return <DatabaseView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        items={[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'scanning', icon: Camera, label: 'Scanning' },
          { id: 'database', icon: Database, label: 'Database' }
        ]} 
      />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
