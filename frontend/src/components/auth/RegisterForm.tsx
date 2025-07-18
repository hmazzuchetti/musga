'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateUserDto, UserRole } from '@musga/shared';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.SINGER,
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await register(formData);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-black bg-opacity-40 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-purple-500/20">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Join Musga</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-400 text-red-100 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-purple-200 mb-1">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
              placeholder="First name"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-purple-200 mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-purple-200 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-purple-200 mb-1">
            I am a...
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
          >
            <option value={UserRole.SINGER}>Singer - I want to sell my vocals</option>
            <option value={UserRole.DJ}>DJ/Producer - I want to buy vocals</option>
          </select>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-purple-200 mb-1">
            Bio (Optional)
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 bg-black bg-opacity-30 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
            placeholder="Tell us about yourself..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-purple-200">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-purple-300 hover:text-purple-100 font-medium transition-colors duration-200"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};