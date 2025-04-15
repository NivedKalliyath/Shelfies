import React, { useState, useEffect } from 'react';
import CategoryChart from '../components/CategoryChart';
import ProductList from '../components/ProductList';
import { Package, TrendingUp, ShoppingCart, AlertCircle } from 'lucide-react';
import { getAllProducts, subscribeToProducts } from '../utils/productDatabase';

export default function Dashboard() {
  const [products, setProducts] = useState(getAllProducts());
  
  useEffect(() => {
    // Subscribe to product updates
    const unsubscribe = subscribeToProducts(() => {
      setProducts(getAllProducts());
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // Calculate statistics
  const totalProducts = products.reduce((sum, product) => sum + product.count, 0);
  const uniqueCategories = new Set(products.map(product => product.category)).size;
  const lowStockThreshold = 5;
  const lowStockItems = products.filter(product => product.count <= lowStockThreshold).length;
  const scannedToday = products.filter(product => {
    const today = new Date().toDateString();
    const productDate = new Date(product.lastUpdated).toDateString();
    return today === productDate;
  }).length;

  const stats = [
    { label: 'Total Products', value: totalProducts.toString(), icon: Package, color: 'blue' },
    { label: 'Categories', value: uniqueCategories.toString(), icon: ShoppingCart, color: 'green' },
    { label: 'Low Stock', value: lowStockItems.toString(), icon: AlertCircle, color: 'red' },
    { label: 'Scanned Today', value: scannedToday.toString(), icon: TrendingUp, color: 'purple' }
  ];

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Monitor your inventory metrics and analytics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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