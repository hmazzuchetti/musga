'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@musga/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PerformanceStats {
  totalVocals: number;
  totalSales: number;
  totalEarnings: number;
  avgPrice: number;
}

interface RecentActivity {
  type: string;
  message: string;
  timestamp: string;
}

interface LeaderboardEntry {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  vocalCount: number;
  totalSales: number;
  totalEarnings: number;
}

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PerformanceStats>({
    totalVocals: 0,
    totalSales: 0,
    totalEarnings: 0,
    avgPrice: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    if (user && user.role === UserRole.SINGER) {
      fetchPerformanceStats();
      fetchRecentActivity();
    }
    // Load leaderboard for all users
    fetchLeaderboard();
  }, [user]);

  const fetchPerformanceStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const [vocalsResponse, earningsResponse] = await Promise.all([
        fetch(`${apiUrl}/vocals/my-vocals?page=1&limit=1`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${apiUrl}/payments/earnings`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ]);

      if (vocalsResponse.ok && earningsResponse.ok) {
        const vocalsData = await vocalsResponse.json();
        const earningsData = await earningsResponse.json();
        
        setStats({
          totalVocals: vocalsData.total || 0,
          totalSales: earningsData.totalSales || 0,
          totalEarnings: earningsData.totalEarnings || 0,
          avgPrice: vocalsData.total > 0 ? (earningsData.totalEarnings / earningsData.totalSales) || 0 : 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch performance stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/payments/sales?page=1&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const activities = data.sales?.map((sale: any) => ({
          type: 'sale',
          message: `Sold "${sale.vocal.title}" for $${sale.amount.toFixed(2)}`,
          timestamp: sale.createdAt
        })) || [];
        
        setRecentActivity(activities.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Since there's no leaderboard endpoint, we'll fetch singers and calculate stats
      const response = await fetch(`${apiUrl}/users?role=singer&limit=10`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const singers = data.users || [];
        
        // Create mock leaderboard with some sample data
        const mockLeaderboard: LeaderboardEntry[] = singers.slice(0, 5).map((singer: any, index: number) => ({
          user: {
            id: singer.id,
            firstName: singer.firstName,
            lastName: singer.lastName,
            username: singer.username
          },
          vocalCount: Math.max(0, 10 - index * 2), // Mock data: decreasing vocal count
          totalSales: Math.max(0, 25 - index * 5), // Mock data: decreasing sales
          totalEarnings: Math.max(0, (500 - index * 100)) // Mock data: decreasing earnings
        }));
        
        setLeaderboard(mockLeaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

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
                {loadingStats ? (
                  <div className="text-purple-200 text-center py-4">Loading stats...</div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Total Vocals</span>
                      <span className="text-white font-medium">{stats.totalVocals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Total Sales</span>
                      <span className="text-white font-medium">{stats.totalSales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Total Earnings</span>
                      <span className="text-green-400 font-medium">${stats.totalEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Avg. Price</span>
                      <span className="text-white font-medium">{stats.avgPrice > 0 ? `$${stats.avgPrice.toFixed(2)}` : '-'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  {recentActivity.length === 0 ? (
                    <div className="text-purple-200">
                      No recent activity yet. Start by uploading your first vocal!
                    </div>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-green-400 mt-1">•</span>
                        <div>
                          <div className="text-white">{activity.message}</div>
                          <div className="text-purple-300 text-xs">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {recentActivity.length === 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="text-purple-300 text-xs">
                        Next steps:
                      </div>
                      <div className="text-purple-300 text-xs">
                        • Upload your first vocal
                      </div>
                      <div className="text-purple-300 text-xs">
                        • Set competitive pricing
                      </div>
                      <div className="text-purple-300 text-xs">
                        • Share your profile with DJs
                      </div>
                    </div>
                  )}
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
              {loadingLeaderboard ? (
                <div className="text-center py-8">
                  <div className="text-purple-200">Loading leaderboard...</div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-purple-200">No singers found yet</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-black bg-opacity-30 rounded-lg p-4 text-center">
                      <div className="text-purple-300 font-medium mb-1">🎵 Most Active</div>
                      <div className="text-purple-200 text-sm">Based on vocals uploaded</div>
                    </div>
                    <div className="bg-black bg-opacity-30 rounded-lg p-4 text-center">
                      <div className="text-purple-300 font-medium mb-1">💰 Top Sales</div>
                      <div className="text-purple-200 text-sm">Most vocals sold</div>
                    </div>
                    <div className="bg-black bg-opacity-30 rounded-lg p-4 text-center">
                      <div className="text-purple-300 font-medium mb-1">💎 Top Earners</div>
                      <div className="text-purple-200 text-sm">Highest revenue</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.user.id} className="flex items-center justify-between bg-black bg-opacity-20 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium">{entry.user.firstName} {entry.user.lastName}</div>
                            <div className="text-purple-200 text-sm">@{entry.user.username}</div>
                          </div>
                        </div>
                        <div className="flex space-x-6 text-sm">
                          <div className="text-center">
                            <div className="text-white font-medium">{entry.vocalCount}</div>
                            <div className="text-purple-200">Vocals</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-medium">{entry.totalSales}</div>
                            <div className="text-purple-200">Sales</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-400 font-medium">${entry.totalEarnings}</div>
                            <div className="text-purple-200">Earned</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-purple-200 text-sm">
                      Rankings update daily. Keep uploading and selling to climb higher!
                    </p>
                  </div>
                </div>
              )}
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
        {/* shadcn/ui Components Demo */}
        <Card className="mt-12 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>✨</span>
              <span>New UI Components</span>
            </CardTitle>
            <CardDescription>
              Enhanced with shadcn/ui components for a better user experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">New</Badge>
              <Badge variant="secondary">Updated</Badge>
              <Badge variant="outline">Popular</Badge>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">Premium</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              These components are fully customized to match Musga's purple/pink theme and provide better accessibility and user experience.
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}