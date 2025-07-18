'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole, Vocal } from '@musga/shared';

interface VocalResponse {
  vocals: Vocal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function MyVocalsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [vocals, setVocals] = useState<VocalResponse>({
    vocals: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loadingVocals, setLoadingVocals] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.SINGER)) {
      router.push('/dashboard');
      return;
    }
    
    if (user && user.role === UserRole.SINGER) {
      fetchMyVocals(currentPage);
    }
  }, [user, isLoading, router, currentPage]);

  const fetchMyVocals = async (page: number) => {
    try {
      setLoadingVocals(true);
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/vocals/my-vocals?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vocals');
      }

      const data: VocalResponse = await response.json();
      setVocals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vocals');
    } finally {
      setLoadingVocals(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          <h2 className="text-3xl font-bold text-white mb-2">My Vocals</h2>
          <p className="text-purple-200">
            Manage your uploaded vocal tracks and monitor their performance
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400 text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {loadingVocals ? (
          <div className="text-center py-12">
            <div className="text-white text-xl">Loading your vocals...</div>
          </div>
        ) : vocals.vocals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white text-xl mb-4">No vocals uploaded yet</div>
            <button
              onClick={() => router.push('/upload')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Upload Your First Vocal
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {vocals.vocals.map((vocal) => (
                <div
                  key={vocal.id}
                  className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{vocal.title}</h3>
                      <p className="text-purple-200 mb-2">{vocal.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">${vocal.price}</div>
                      <div className="text-sm text-purple-200">{vocal.licensingType}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-purple-200">Genre</div>
                      <div className="text-white">{vocal.genre}</div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-200">BPM</div>
                      <div className="text-white">{vocal.bpm}</div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-200">Key</div>
                      <div className="text-white">{vocal.key}</div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-200">Duration</div>
                      <div className="text-white">{formatDuration(vocal.duration)}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-purple-200">
                      Uploaded on {formatDate(vocal.createdAt)}
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Edit
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {vocals.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: vocals.totalPages }, (_, i) => i + 1).map(page => (
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
                  onClick={() => setCurrentPage(prev => Math.min(vocals.totalPages, prev + 1))}
                  disabled={currentPage === vocals.totalPages}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}