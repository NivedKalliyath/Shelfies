import React, { useState, useEffect } from 'react';
import CategoryChart from '../components/CategoryChart';
import ProductList from '../components/ProductList';
import { Package, TrendingUp, ShoppingCart, AlertCircle } from 'lucide-react';
import { getAllProducts, subscribeToProducts } from '../utils/productDatabase';
import { api } from '../utils/api';

export default function Dashboard() {
  const [products, setProducts] = useState(getAllProducts());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Subscribe to product updates
    const unsubscribe = subscribeToProducts(() => {
      setProducts(getAllProducts());
      loadStats(); // Reload stats when products change
    });

    // Load initial stats
    loadStats();

    return () => unsubscribe();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await api.getStats();
      if (response.success) {
        setStats(response.stats);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback to calculated stats if API fails
  const displayStats = stats || {
    totalProducts: products.reduce((sum, p) => sum + p.count, 0),
    categories: new Set(products.map(p => p.category)).size,
    lowStock: products.filter(p => p.count <= 5).length,
    scannedToday: products.filter(p => {
      const today = new Date().toDateString();
      const productDate = new Date(p.lastUpdated).toDateString();
      return today === productDate;
    }).length
  };

  const statsData = [
    { 
      label: 'Total Products', 
      value: displayStats.totalProducts.toString(), 
      icon: Package, 
      color: 'blue' 
    },
    { 
      label: 'Categories', 
      value: displayStats.categories.toString(), 
      icon: ShoppingCart, 
      color: 'green' 
    },
    { 
      label: 'Low Stock', 
      value: displayStats.lowStock.toString(), 
      icon: AlertCircle, 
      color: 'red' 
    },
    { 
      label: 'Scanned Today', 
      value: displayStats.scannedToday.toString(), 
      icon: TrendingUp, 
      color: 'purple' 
    }
  ];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Monitor your inventory metrics and analytics</p>
      </header>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            {error} - Showing cached data
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className={`inline-flex p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">Category Distribution</h2>
          <CategoryChart />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">Recent Products</h2>
          <ProductList />
        </div>
      </div>
    </div>
  );
}