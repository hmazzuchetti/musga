'use client';

import React, { useState } from 'react';
import { Vocal } from '@musga/shared';
import { useAuth } from '@/contexts/AuthContext';

interface PurchaseModalProps {
  vocal: Vocal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseModal({ vocal, isOpen, onClose, onSuccess }: PurchaseModalProps) {
  const { token } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setProcessing(true);
    setError('');

    try {
      // Create payment intent
      const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ vocalId: vocal.id }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }

      const { clientSecret } = await paymentResponse.json();
      
      // For the prototype, we'll simulate payment success
      // In a real implementation, this would integrate with Stripe Elements
      const paymentIntentId = clientSecret.split('_secret_')[0];
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Confirm payment
      const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/confirm-payment/${paymentIntentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!confirmResponse.ok) {
        throw new Error('Payment confirmation failed');
      }

      const { success } = await confirmResponse.json();
      
      if (success) {
        onSuccess();
        onClose();
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Purchase failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg p-8 max-w-md w-full mx-4 border border-purple-500/20">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Purchase Vocal</h3>
          <p className="text-purple-200">Complete your purchase to download this vocal</p>
        </div>

        <div className="bg-black bg-opacity-20 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-white mb-2">{vocal.title}</h4>
          <p className="text-purple-200 text-sm mb-4">
            by {vocal.singer?.firstName} {vocal.singer?.lastName}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Genre:</span>
              <span className="text-white">{vocal.genre.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">BPM:</span>
              <span className="text-white">{vocal.bpm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Key:</span>
              <span className="text-white">{vocal.key}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Licensing:</span>
              <span className="text-white">{vocal.licensingType.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="bg-black bg-opacity-20 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-purple-200">Price:</span>
            <span className="text-2xl font-bold text-white">${vocal.price}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-purple-300">Platform fee (10%):</span>
            <span className="text-purple-300">${(vocal.price * 0.1).toFixed(2)}</span>
          </div>
          <div className="border-t border-purple-500/20 mt-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Total:</span>
              <span className="text-xl font-bold text-white">${vocal.price}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={processing}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-purple-500 disabled:to-pink-500 text-white py-3 px-4 rounded-lg font-medium transition-all"
          >
            {processing ? 'Processing...' : 'Purchase'}
          </button>
        </div>

        <p className="text-xs text-purple-300 text-center mt-4">
          This is a prototype with simulated payment processing
        </p>
      </div>
    </div>
  );
}