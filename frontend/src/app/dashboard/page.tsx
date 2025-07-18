'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@musga/shared';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="bg-black bg-opacity-20 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Musga
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => router.push('/browse')}
                  className="flex items-center space-x-1 text-purple-200 hover:text-white transition-colors duration-200"
                >
                  <span>🎵</span>
                  <span>Browse</span>
                </button>
                {user.role === UserRole.SINGER && (
                  <button
                    onClick={() => router.push('/upload')}
                    className="flex items-center space-x-1 text-purple-200 hover:text-white transition-colors duration-200"
                  >
                    <span>⬆️</span>
                    <span>Upload</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-purple-200">👋</span>
                <span className="text-purple-200">Welcome, {user.firstName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {user.role === UserRole.SINGER ? 'Singer Dashboard' : 'DJ Dashboard'}
          </h2>
          <p className="text-purple-200">
            {user.role === UserRole.SINGER 
              ? 'Upload and manage your vocal tracks'
              : 'Discover and purchase vocal tracks for your music'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.role === UserRole.SINGER ? (
            <>
              <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">Upload Vocal</h3>
                <p className="text-purple-200 mb-4">
                  Share your voice with the world. Upload your vocal tracks and set your price.
                </p>
                <button 
                  onClick={() => router.push('/upload')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Upload Now
                </button>
              </div>

              <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">My Vocals</h3>
                <p className="text-purple-200 mb-4">
                  View and manage your uploaded vocal tracks.
                </p>
                <button 
                  onClick={() => router.push('/dashboard/vocals')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  View Vocals
                </button>
              </div>

              <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">Earnings</h3>
                <p className="text-purple-200 mb-4">
                  Track your sales and earnings from vocal sales.
                </p>
                <button 
                  onClick={() => router.push('/dashboard/earnings')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  View Earnings
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">Browse Vocals</h3>
                <p className="text-purple-200 mb-4">
                  Discover amazing vocal tracks from talented singers worldwide.
                </p>
                <button 
                  onClick={() => router.push('/browse')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Browse Now
                </button>
              </div>

              <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">My Purchases</h3>
                <p className="text-purple-200 mb-4">
                  Access your purchased vocal tracks and downloads.
                </p>
                <button 
                  onClick={() => router.push('/dashboard/purchases')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  View Purchases
                </button>
              </div>

              <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">Favorites</h3>
                <p className="text-purple-200 mb-4">
                  Quick access to your favorite vocal tracks and singers.
                </p>
                <button 
                  onClick={() => router.push('/dashboard/favorites')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  View Favorites
                </button>
              </div>
            </>
          )}
        </div>

        {/* Singer-specific additional sections */}
        {user.role === UserRole.SINGER && (
          <>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Total Vocals</span>
                    <span className="text-white font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Total Sales</span>
                    <span className="text-white font-medium">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Total Earnings</span>
                    <span className="text-green-400 font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Avg. Price</span>
                    <span className="text-white font-medium">-</span>
                  </div>
                </div>
              </div>

              <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="text-purple-200">
                    Connect your account to start tracking your vocal performance and see detailed analytics.
                  </div>
                  <div className="text-purple-300">
                    • Upload your first vocal
                  </div>
                  <div className="text-purple-300">
                    • Make your first sale
                  </div>
                  <div className="text-purple-300">
                    • Climb the leaderboard
                  </div>
                </div>
              </div>

              <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/upload')}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                  >
                    Upload New Vocal
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard/vocals')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Manage Vocals
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard/earnings')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    View Earnings
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-6">🏆 Singer Leaderboard</h3>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎤</div>
                <h4 className="text-lg font-medium text-white mb-2">Leaderboard Coming Soon!</h4>
                <p className="text-purple-200 mb-4">
                  We're building a leaderboard to showcase top singers based on:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="bg-black bg-opacity-30 rounded-lg p-4">
                    <div className="text-purple-300 font-medium mb-1">💰 Total Sales</div>
                    <div className="text-purple-200 text-sm">Most vocals sold</div>
                  </div>
                  <div className="bg-black bg-opacity-30 rounded-lg p-4">
                    <div className="text-purple-300 font-medium mb-1">⭐ Highest Rated</div>
                    <div className="text-purple-200 text-sm">Best community feedback</div>
                  </div>
                  <div className="bg-black bg-opacity-30 rounded-lg p-4">
                    <div className="text-purple-300 font-medium mb-1">🎵 Most Active</div>
                    <div className="text-purple-200 text-sm">Most uploads this month</div>
                  </div>
                  <div className="bg-black bg-opacity-30 rounded-lg p-4">
                    <div className="text-purple-300 font-medium mb-1">💎 Top Earners</div>
                    <div className="text-purple-200 text-sm">Highest revenue generated</div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-purple-200 text-sm">
                    Keep uploading and selling to secure your spot when the leaderboard launches!
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* DJ-specific additional sections */}
        {user.role === UserRole.DJ && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Your Music Library</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-purple-200">Total Purchases</span>
                  <span className="text-white font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Total Spent</span>
                  <span className="text-white font-medium">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Favorite Genres</span>
                  <span className="text-white font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Favorites</span>
                  <span className="text-white font-medium">-</span>
                </div>
              </div>
            </div>

            <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/browse')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Browse New Vocals
                </button>
                <button 
                  onClick={() => router.push('/dashboard/purchases')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Purchases
                </button>
                <button 
                  onClick={() => router.push('/dashboard/favorites')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Favorites
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
          <h3 className="text-xl font-semibold text-white mb-4">Your Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-purple-200 mb-2"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p className="text-purple-200 mb-2"><strong>Username:</strong> @{user.username}</p>
              <p className="text-purple-200 mb-2"><strong>Email:</strong> {user.email}</p>
              <p className="text-purple-200 mb-2"><strong>Role:</strong> {user.role === UserRole.SINGER ? 'Singer' : 'DJ/Producer'}</p>
            </div>
            <div>
              <p className="text-purple-200 mb-2"><strong>Bio:</strong></p>
              <p className="text-purple-200 italic">{user.bio || 'No bio added yet'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}