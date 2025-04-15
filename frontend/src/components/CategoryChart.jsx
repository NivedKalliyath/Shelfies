import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getAllProducts, subscribeToProducts } from '../utils/productDatabase';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryChart() {
  const [products, setProducts] = useState(getAllProducts());

  useEffect(() => {
    const unsubscribe = subscribeToProducts(() => {
      setProducts(getAllProducts());
    });
    return () => unsubscribe();
  }, []);
  
  // Calculate category totals
  const categoryTotals = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + product.count;
    return acc;
  }, {});

  const categoryData = {
    labels: Object.keys(categoryTotals),
    values: Object.values(categoryTotals),
  };

  const data = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.values,
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(201, 203, 207, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: '300px' }}>
      {categoryData.labels.length > 0 ? (
        <Pie data={data} options={options} />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No category data available
        </div>
      )}
    </div>
  );
}