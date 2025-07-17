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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Musga
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-purple-200">Welcome, {user.firstName}</span>
              <button
                onClick={handleLogout}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
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
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium">
                  View Vocals
                </button>
              </div>

              <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">Earnings</h3>
                <p className="text-purple-200 mb-4">
                  Track your sales and earnings from vocal sales.
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium">
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
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium">
                  View Purchases
                </button>
              </div>

              <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4">Favorites</h3>
                <p className="text-purple-200 mb-4">
                  Quick access to your favorite vocal tracks and singers.
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium">
                  View Favorites
                </button>
              </div>
            </>
          )}
        </div>

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