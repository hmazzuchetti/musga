'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Vocal, Genre, LicensingType, PaginatedResponse } from '@musga/shared';
import AudioPlayer from '@/components/AudioPlayer';
import PurchaseModal from '@/components/PurchaseModal';

export default function BrowsePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  
  const [vocals, setVocals] = useState<Vocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedVocal, setSelectedVocal] = useState<Vocal | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    minPrice: '',
    maxPrice: '',
    minBpm: '',
    maxBpm: '',
    key: '',
    licensingType: '',
  });

  useEffect(() => {
    if (!isLoading) {
      fetchVocals();
    }
  }, [isLoading, currentPage, filters]);

  const fetchVocals = async () => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '20');
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vocals?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vocals');
      }

      const data: PaginatedResponse<Vocal> = await response.json();
      setVocals(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch vocals');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVocals();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      genre: '',
      minPrice: '',
      maxPrice: '',
      minBpm: '',
      maxBpm: '',
      key: '',
      licensingType: '',
    });
    setCurrentPage(1);
  };

  const handlePurchaseClick = (vocal: Vocal) => {
    setSelectedVocal(vocal);
    setPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    // Refresh the vocals list
    fetchVocals();
    alert('Purchase successful! You can now download the vocal from your dashboard.');
  };

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
              <button
                onClick={() => router.push(user ? '/dashboard' : '/')}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
              >
                Musga
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-purple-200 hover:text-white transition-colors"
                  >
                    Dashboard
                  </button>
                  <span className="text-purple-200">Welcome, {user.firstName}</span>
                </>
              ) : (
                <button
                  onClick={() => router.push('/auth')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Vocals</h1>
          <p className="text-purple-200">Discover amazing vocal tracks for your music</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search vocals, singers, or descriptions..."
                className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Genre</label>
                <select
                  name="genre"
                  value={filters.genre}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="">All Genres</option>
                  {Object.values(Genre).map(genre => (
                    <option key={genre} value={genre}>
                      {genre.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Licensing</label>
                <select
                  name="licensingType"
                  value={filters.licensingType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="">All Types</option>
                  <option value={LicensingType.NON_EXCLUSIVE}>Non-Exclusive</option>
                  <option value={LicensingType.EXCLUSIVE}>Exclusive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Price Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">BPM Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="minBpm"
                    value={filters.minBpm}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-full px-3 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="number"
                    name="maxBpm"
                    value={filters.maxBpm}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={clearFilters}
                className="text-purple-300 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition-all"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-white text-xl">Loading vocals...</div>
          </div>
        ) : vocals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-purple-200 text-lg">No vocals found matching your criteria</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vocals.map((vocal) => (
                <div key={vocal.id} className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{vocal.title}</h3>
                      <p className="text-purple-200 text-sm">by {vocal.singer?.firstName} {vocal.singer?.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">${vocal.price}</p>
                      <p className="text-xs text-purple-300">{vocal.licensingType.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">Genre:</span>
                      <span className="text-white">{vocal.genre.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">BPM:</span>
                      <span className="text-white">{vocal.bpm}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">Key:</span>
                      <span className="text-white">{vocal.key}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-300">Tone:</span>
                      <span className="text-white">{vocal.tone}</span>
                    </div>
                  </div>

                  {vocal.description && (
                    <p className="text-purple-200 text-sm mb-4 line-clamp-3">{vocal.description}</p>
                  )}

                  <div className="mb-4">
                    <AudioPlayer
                      src={`${process.env.NEXT_PUBLIC_API_URL}/vocals/${vocal.id}/preview`}
                      title={vocal.title}
                      artist={`${vocal.singer?.firstName} ${vocal.singer?.lastName}`}
                      onPlay={() => setCurrentlyPlaying(vocal.id)}
                      onPause={() => setCurrentlyPlaying(null)}
                      className="mb-2"
                    />
                  </div>

                  <div className="flex space-x-2">
                    {user ? (
                      <button 
                        onClick={() => handlePurchaseClick(vocal)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg text-sm transition-all"
                      >
                        Buy Now
                      </button>
                    ) : (
                      <button 
                        onClick={() => router.push('/auth')}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg text-sm transition-all"
                      >
                        Sign In to Buy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 bg-black bg-opacity-30 text-white rounded-lg">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {selectedVocal && (
        <PurchaseModal
          vocal={selectedVocal}
          isOpen={purchaseModalOpen}
          onClose={() => setPurchaseModalOpen(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}