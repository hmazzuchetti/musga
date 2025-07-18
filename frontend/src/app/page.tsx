'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="bg-black bg-opacity-20 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Musga
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/auth')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                🚀 Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The Future of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Electronic Music
            </span>
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-3xl mx-auto">
            Connect singers with DJs and producers. Upload your vocals, discover amazing tracks, 
            and create the next electronic music hit together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              Start Creating
            </button>
            <button
              onClick={() => router.push('/browse')}
              className="bg-black bg-opacity-20 backdrop-blur-lg border border-purple-500/20 hover:bg-opacity-30 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all"
            >
              Browse Vocals
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-16">
          <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-8 border border-purple-500/20">
            <div className="text-3xl mb-4">🎤</div>
            <h3 className="text-xl font-semibold text-white mb-4">For Singers</h3>
            <p className="text-purple-200">
              Share your voice with the world. Upload your vocal tracks, set your price, 
              and earn money from your talent.
            </p>
          </div>

          <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-8 border border-purple-500/20">
            <div className="text-3xl mb-4">🎧</div>
            <h3 className="text-xl font-semibold text-white mb-4">For DJs & Producers</h3>
            <p className="text-purple-200">
              Find the perfect vocals for your tracks. Browse by genre, BPM, key, 
              and licensing options at affordable prices.
            </p>
          </div>

          <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-8 border border-purple-500/20">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white mb-4">Easy to Use</h3>
            <p className="text-purple-200">
              Simple upload process, secure payments, and instant downloads. 
              Focus on creating amazing music, not dealing with complicated systems.
            </p>
          </div>
        </div>

        <div className="text-center py-16">
          <h2 className="text-3xl font-bold text-white mb-8">Ready to Get Started?</h2>
          <p className="text-purple-200 text-lg mb-8">
            Join thousands of singers and DJs creating the future of electronic music
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
          >
            Join Musga Today
          </button>
        </div>
      </main>

      <footer className="bg-black bg-opacity-20 backdrop-blur-lg border-t border-purple-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-purple-200">
            <p>&copy; 2024 Musga. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
