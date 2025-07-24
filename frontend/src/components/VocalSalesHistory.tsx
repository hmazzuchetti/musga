'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface VocalSalesHistoryProps {
  vocalId: string;
}

interface VocalSale {
  id: string;
  amount: number;
  sellerAmount: number;
  createdAt: string;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
}

export default function VocalSalesHistory({ vocalId }: VocalSalesHistoryProps) {
  const [sales, setSales] = useState<VocalSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchVocalSales = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/payments/sales?vocalId=${vocalId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vocal sales');
      }

      const data = await response.json();
      setSales(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  }, [vocalId]);

  useEffect(() => {
    fetchVocalSales();
  }, [fetchVocalSales]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-xs text-purple-300">Loading sales history...</div>;
  }

  if (error) {
    return <div className="text-xs text-red-400">Error: {error}</div>;
  }

  if (sales.length === 0) {
    return (
      <div className="text-xs text-purple-300">
        No sales yet. Share your vocal to get your first sale!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sales.map((sale) => (
        <div key={sale.id} className="bg-black bg-opacity-20 rounded-md p-3 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-white font-medium">
                Sold to @{sale.buyer.username}
              </div>
              <div className="text-purple-300">
                {sale.buyer.firstName} {sale.buyer.lastName}
              </div>
              <div className="text-purple-400 mt-1">
                {formatDate(sale.createdAt)}
              </div>
            </div>            <div className="text-right">
              <div className="text-white font-medium">
                ${Number(sale.amount).toFixed(2)}
              </div>
              <div className="text-green-400">
                You earned: ${Number(sale.sellerAmount).toFixed(2)}
              </div>
              <div className="text-purple-300">
                Fee: ${(Number(sale.amount) - Number(sale.sellerAmount)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}