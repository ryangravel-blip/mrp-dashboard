import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-[#80C7D1] rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Loading dashboard data...</p>
    </div>
  );
}
