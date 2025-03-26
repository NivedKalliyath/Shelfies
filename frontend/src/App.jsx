import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Camera, 
  Database
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Scanning from './pages/Scanning';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'scanning':
        return <Scanning />;
      default:
        return <Scanning />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        items={[
          { id: 'scanning', icon: Camera, label: 'Scanning' },
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
