'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <p className="text-gray-700 mb-6">{message}</p>
            
            <div className="flex justify-end gap-4">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-6 py-2 text-white rounded-md transition-colors ${variantStyles[variant]}`}
              >
                {confirmText}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




