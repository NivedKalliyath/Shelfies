import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, items }) {
  return (
    <aside className="w-72 bg-white shadow-lg">
      <div className="p-8 text-center border-b border-gray-200">
        <h1 className="text-3xl font-bold text-blue-600">Shelfies</h1>
        <p className="text-sm text-gray-500 mt-2">Smart Inventory Management</p>
      </div>
      <nav className="p-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg mb-2 transition-colors ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}