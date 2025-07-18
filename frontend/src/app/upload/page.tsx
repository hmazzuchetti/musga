'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole, Genre, LicensingType } from '@musga/shared';

export default function UploadPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: Genre.HOUSE,
    bpm: '',
    key: '',
    tone: '',
    price: '',
    licensingType: LicensingType.NON_EXCLUSIVE,
  });
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.SINGER) {
    router.push('/dashboard');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/flac'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload an audio file (MP3, WAV, FLAC).');
        return;
      }
      
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size too large. Maximum size is 50MB.');
        return;
      }
      
      setAudioFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    if (!formData.title || !formData.bpm || !formData.key || !formData.tone || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('audio', audioFile);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('genre', formData.genre);
      uploadData.append('bpm', formData.bpm);
      uploadData.append('key', formData.key);
      uploadData.append('tone', formData.tone);
      uploadData.append('price', formData.price);
      uploadData.append('licensingType', formData.licensingType);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vocals/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      // Redirect to dashboard on success
      router.push('/dashboard?success=upload');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <nav className="bg-black bg-opacity-20 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
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
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-purple-200">
                  <span>⬆️</span>
                  <span>Upload Vocal</span>
                </div>
              </div>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Vocal Track</h1>
          <p className="text-purple-200">Share your voice with the world</p>
        </div>

        <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-lg p-8 border border-purple-500/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Audio File *
              </label>
              <input
                type="file"
                accept=".mp3,.wav,.flac"
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                disabled={uploading}
              />
              <p className="text-sm text-purple-300 mt-1">
                Supported formats: MP3, WAV, FLAC (Max 50MB)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="Enter track title"
                  disabled={uploading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Genre *
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  disabled={uploading}
                >
                  {Object.values(Genre).map(genre => (
                    <option key={genre} value={genre}>
                      {genre.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  BPM *
                </label>
                <input
                  type="number"
                  name="bpm"
                  value={formData.bpm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="e.g., 128"
                  min="60"
                  max="200"
                  disabled={uploading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Key *
                </label>
                <select
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  disabled={uploading}
                  required
                >
                  <option value="">Select a key</option>
                  <option value="C major">C major</option>
                  <option value="G major">G major</option>
                  <option value="D major">D major</option>
                  <option value="A major">A major</option>
                  <option value="E major">E major</option>
                  <option value="B major">B major</option>
                  <option value="F# major">F# major</option>
                  <option value="C# major">C# major</option>
                  <option value="F major">F major</option>
                  <option value="Bb major">Bb major</option>
                  <option value="Eb major">Eb major</option>
                  <option value="Ab major">Ab major</option>
                  <option value="Db major">Db major</option>
                  <option value="Gb major">Gb major</option>
                  <option value="Cb major">Cb major</option>
                  <option value="A minor">A minor</option>
                  <option value="E minor">E minor</option>
                  <option value="B minor">B minor</option>
                  <option value="F# minor">F# minor</option>
                  <option value="C# minor">C# minor</option>
                  <option value="G# minor">G# minor</option>
                  <option value="D# minor">D# minor</option>
                  <option value="A# minor">A# minor</option>
                  <option value="D minor">D minor</option>
                  <option value="G minor">G minor</option>
                  <option value="C minor">C minor</option>
                  <option value="F minor">F minor</option>
                  <option value="Bb minor">Bb minor</option>
                  <option value="Eb minor">Eb minor</option>
                  <option value="Ab minor">Ab minor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Tone *
                </label>
                <input
                  type="text"
                  name="tone"
                  value={formData.tone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="e.g., Happy, Energetic, Melancholic"
                  disabled={uploading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="e.g., 19.99"
                  min="1"
                  max="100"
                  step="0.01"
                  disabled={uploading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Licensing Type *
              </label>
              <select
                name="licensingType"
                value={formData.licensingType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                disabled={uploading}
              >
                <option value={LicensingType.NON_EXCLUSIVE}>Non-Exclusive</option>
                <option value={LicensingType.EXCLUSIVE}>Exclusive</option>
              </select>
              <p className="text-sm text-purple-300 mt-1">
                Non-exclusive allows multiple buyers, exclusive is one-time purchase
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                placeholder="Describe your vocal track..."
                disabled={uploading}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Track'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}