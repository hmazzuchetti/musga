'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole, Transaction } from '@musga/shared';

interface PurchasesResponse {
  purchases: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PurchasesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<PurchasesResponse>({
    purchases: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.DJ)) {
      router.push('/dashboard');
      return;
    }
    
    if (user && user.role === UserRole.DJ) {
      fetchPurchases(currentPage);
    }
  }, [user, isLoading, router, currentPage]);

  const fetchPurchases = async (page: number) => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/payments/purchases?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }

      const data: PurchasesResponse = await response.json();
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchases');
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = (vocal: any) => {
    // In a real implementation, this would download the purchased vocal file
    alert(`Download functionality for "${vocal.title}" would be implemented here`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.DJ) {
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
          <h2 className="text-3xl font-bold text-white mb-2">My Purchases</h2>
          <p className="text-purple-200">
            Access your purchased vocal tracks and download files
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400 text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {loadingData ? (
          <div className="text-center py-12">
            <div className="text-white text-xl">Loading your purchases...</div>
          </div>
        ) : purchases.purchases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white text-xl mb-4">No purchases yet</div>
            <p className="text-purple-200 mb-6">Browse our vocal marketplace to find amazing tracks!</p>
            <button
              onClick={() => router.push('/browse')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Browse Vocals
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {purchases.purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{purchase.vocal.title}</h3>
                      <p className="text-purple-200 mb-2">{purchase.vocal.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-purple-200">
                        <span>by @{purchase.vocal.singer.username}</span>
                        <span>•</span>
                        <span>Purchased on {formatDate(purchase.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">${purchase.amount.toFixed(2)}</div>
                      <div className="text-sm text-purple-200">{purchase.vocal.licensingType}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div>
                      <div className="text-sm text-purple-200">Genre</div>
                      <div className="text-white">{purchase.vocal.genre}</div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-200">BPM</div>
                      <div className="text-white">{purchase.vocal.bpm}</div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-200">Key</div>
                      <div className="text-white">{purchase.vocal.key}</div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-200">Duration</div>
                      <div className="text-white">{formatDuration(purchase.vocal.duration)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-200">Tone</div>
                      <div className="text-white">{purchase.vocal.tone}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-purple-200">
                      Transaction ID: {purchase.id.slice(0, 8)}...
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(purchase.vocal)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                      >
                        Download
                      </button>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {purchases.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: purchases.totalPages }, (_, i) => i + 1).map(page => (
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
                  onClick={() => setCurrentPage(prev => Math.min(purchases.totalPages, prev + 1))}
                  disabled={currentPage === purchases.totalPages}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            <div className="mt-8 bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-4">Purchase Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{purchases.total}</div>
                  <div className="text-sm text-purple-200">Total Purchases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    ${purchases.purchases.reduce((total, purchase) => total + purchase.amount, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-purple-200">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">
                    {new Set(purchases.purchases.map(p => p.vocal.genre)).size}
                  </div>
                  <div className="text-sm text-purple-200">Unique Genres</div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}