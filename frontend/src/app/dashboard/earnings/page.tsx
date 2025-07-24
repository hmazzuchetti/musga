'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole, Transaction } from '@musga/shared';

interface SalesResponse {
  sales: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EarningsResponse {
  totalEarnings: number;
  totalSales: number;
}

export default function EarningsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState<SalesResponse>({
    sales: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [earnings, setEarnings] = useState<EarningsResponse>({
    totalEarnings: 0,
    totalSales: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.SINGER)) {
      router.push('/dashboard');
      return;
    }
    
    if (user && user.role === UserRole.SINGER) {
      fetchEarningsData(currentPage);
    }
  }, [user, isLoading, router, currentPage]);

  const fetchEarningsData = async (page: number) => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Fetch sales and earnings in parallel
      const [salesResponse, earningsResponse] = await Promise.all([
        fetch(`${apiUrl}/payments/sales?page=${page}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${apiUrl}/payments/earnings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!salesResponse.ok || !earningsResponse.ok) {
        throw new Error('Failed to fetch earnings data');
      }

      const salesData: SalesResponse = await salesResponse.json();
      const earningsData: EarningsResponse = await earningsResponse.json();

      setSales(salesData);
      setEarnings(earningsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earnings data');
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.SINGER) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="bg-black bg-opacity-20 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 group transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Musga
                </h1>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-1 text-purple-200 hover:text-white transition-colors duration-200"
              >
                <span>🏠</span>
                <span>Dashboard</span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-purple-200">👋</span>
                <span className="text-purple-200">Welcome, {user.firstName}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Earnings & Sales</h2>
          <p className="text-purple-200">
            Track your vocal sales and earnings performance
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400 text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {loadingData ? (
          <div className="text-center py-12">
            <div className="text-white text-xl">Loading earnings data...</div>
          </div>
        ) : (
          <>
            {/* Earnings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-2">Total Earnings</h3>
                <div className="text-4xl font-bold text-green-400">${earnings.totalEarnings.toFixed(2)}</div>
                <div className="text-sm text-purple-200 mt-2">After platform fees</div>
              </div>
              
              <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-2">Total Sales</h3>
                <div className="text-4xl font-bold text-purple-400">{earnings.totalSales}</div>
                <div className="text-sm text-purple-200 mt-2">Vocals sold</div>
              </div>
            </div>

            {/* Sales History */}
            <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-6">Sales History</h3>
              
              {!sales.sales || sales.sales.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-purple-200 text-lg">No sales yet</div>
                  <p className="text-purple-300 mt-2">Start by uploading your vocals!</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-purple-500/20">
                          <th className="text-left text-purple-200 font-medium py-3">Vocal</th>
                          <th className="text-left text-purple-200 font-medium py-3">Buyer</th>
                          <th className="text-left text-purple-200 font-medium py-3">Date</th>
                          <th className="text-left text-purple-200 font-medium py-3">Amount</th>
                          <th className="text-left text-purple-200 font-medium py-3">Your Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.sales?.map((sale) => (
                          <tr key={sale.id} className="border-b border-purple-500/10">
                            <td className="py-4">
                              <div className="text-white font-medium">{sale.vocal.title}</div>
                              <div className="text-sm text-purple-200">{sale.vocal.genre}</div>
                            </td>
                            <td className="py-4">
                              <div className="text-white">@{sale.buyer.username}</div>
                              <div className="text-sm text-purple-200">{sale.buyer.firstName} {sale.buyer.lastName}</div>
                            </td>
                            <td className="py-4">
                              <div className="text-white">{formatDate(sale.createdAt)}</div>
                              <div className="text-sm text-purple-200">{formatDateTime(sale.createdAt)}</div>
                            </td>
                            <td className="py-4">
                              <div className="text-white font-medium">${sale.amount.toFixed(2)}</div>
                              <div className="text-sm text-purple-200">{sale.vocal.licensingType}</div>
                            </td>
                            <td className="py-4">
                              <div className="text-green-400 font-medium">${sale.sellerAmount.toFixed(2)}</div>
                              <div className="text-sm text-purple-200">
                                Fee: ${(sale.amount - sale.sellerAmount).toFixed(2)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {sales.totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-6">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: sales.totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-md transition-colors ${
                              page === currentPage
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-600/30 text-purple-200 hover:bg-purple-600/50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(sales.totalPages, prev + 1))}
                        disabled={currentPage === sales.totalPages}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}