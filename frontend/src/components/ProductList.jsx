import React, { useState, useEffect } from 'react';
import { getAllProducts, subscribeToProducts } from '../utils/productDatabase';

export default function ProductList() {
  const [products, setProducts] = useState(getAllProducts());

  useEffect(() => {
    const unsubscribe = subscribeToProducts(() => {
      setProducts(getAllProducts());
    });
    return () => unsubscribe();
  }, []);

  // Sort products by last updated date (most recent first)
  const sortedProducts = [...products].sort((a, b) => 
    new Date(b.lastUpdated) - new Date(a.lastUpdated)
  ).slice(0, 5); // Show only the 5 most recent products

  return (
    <div className="divide-y">
      {sortedProducts.map((product, index) => (
        <div key={index} className="py-4 flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
          <span className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-medium">
            {product.count}
          </span>
        </div>
      ))}
      {sortedProducts.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No products scanned yet
        </div>
      )}
    </div>
  );
}