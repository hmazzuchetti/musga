'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole, Vocal } from '@musga/shared';

// Note: This is a placeholder implementation since the favorites functionality 
// is not yet implemented in the backend. This shows the UI/UX structure.

export default function FavoritesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Vocal[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.DJ)) {
      router.push('/dashboard');
      return;
    }
    
    if (user && user.role === UserRole.DJ) {
      fetchFavorites();
    }
  }, [user, isLoading, router]);

  const fetchFavorites = async () => {
    try {
      setLoadingData(true);
      setError('');
      
      // TODO: Implement when backend favorites API is ready
      // const token = localStorage.getItem('token');
      // const response = await fetch('/api/favorites', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to fetch favorites');
      // }

      // const data = await response.json();
      // setFavorites(data.favorites || []);
      
      // For now, simulate empty favorites
      setFavorites([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoadingData(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRemoveFavorite = async (vocalId: string) => {
    try {
      // TODO: Implement when backend favorites API is ready
      // const token = localStorage.getItem('token');
      // await fetch(`/api/favorites/${vocalId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // Remove from local state
      setFavorites(prev => prev.filter(vocal => vocal.id !== vocalId));
    } catch (err) {
      setError('Failed to remove from favorites');
    }
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
          <h2 className="text-3xl font-bold text-white mb-2">My Favorites</h2>
          <p className="text-purple-200">
            Quick access to your favorite vocal tracks and singers
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400 text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {loadingData ? (
          <div className="text-center py-12">
            <div className="text-white text-xl">Loading your favorites...</div>
          </div>
        ) : (
          <>
            {/* Feature Coming Soon Notice */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-lg p-8 border border-purple-500/30 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-4">💜</div>
                <h3 className="text-2xl font-bold text-white mb-4">Favorites Feature Coming Soon!</h3>
                <p className="text-purple-200 mb-6">
                  We're working on implementing the favorites system so you can easily save and access your favorite vocal tracks. 
                  This feature will allow you to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="bg-black bg-opacity-30 rounded-lg p-4">
                    <div className="text-purple-300 font-medium mb-2">❤️ Save Favorites</div>
                    <div className="text-purple-200 text-sm">
                      Heart vocals you love for quick access later
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-30 rounded-lg p-4">
                    <div className="text-purple-300 font-medium mb-2">📂 Organize Collections</div>
                    <div className="text-purple-200 text-sm">
                      Create playlists and collections of your favorite tracks
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-30 rounded-lg p-4">
                    <div className="text-purple-300 font-medium mb-2">🔔 Get Notifications</div>
                    <div className="text-purple-200 text-sm">
                      Be notified when your favorite singers upload new content
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-30 rounded-lg p-4">
                    <div className="text-purple-300 font-medium mb-2">🎵 Quick Access</div>
                    <div className="text-purple-200 text-sm">
                      Easily find and purchase vocals you've saved
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder for when favorites exist */}
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-purple-200 text-lg mb-4">No favorites yet</div>
                <p className="text-purple-300 mb-6">
                  Once the favorites feature is implemented, you'll be able to save vocals you love!
                </p>
                <button
                  onClick={() => router.push('/browse')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Browse Vocals
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {favorites.map((vocal) => (
                  <div
                    key={vocal.id}
                    className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{vocal.title}</h3>
                        <p className="text-purple-200 mb-2">{vocal.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-purple-200">
                          <span>by @{vocal.singer.username}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">${vocal.price}</div>
                        <div className="text-sm text-purple-200">{vocal.licensingType}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
                      <div>
                        <div className="text-sm text-purple-200">Tone</div>
                        <div className="text-white">{vocal.tone}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-purple-200">
                        Added to favorites
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRemoveFavorite(vocal.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200">
                          Purchase
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}