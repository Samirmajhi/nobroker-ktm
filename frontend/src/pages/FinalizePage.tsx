import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const FinalizePage: React.FC = () => {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const visitId = params.get('visitId') || '';
  const listingId = params.get('listingId') || '';
  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    // In a real flow, fetch visit + listing summary here to show context
  }, [visitId, listingId]);

  const handlePay = async () => {
    setIsPaying(true);
    // Simulate payment stub; integrate with real gateway later
    await new Promise((r) => setTimeout(r, 1500));
    setPaid(true);
    setIsPaying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Finalize Booking</h1>
          <p className="text-gray-600 mb-6">
            Both parties marked interest. To proceed, please pay the platform fee to secure the finalization.
          </p>
          <div className="mb-4 text-sm text-gray-600">
            <p><strong>Visit ID:</strong> {visitId}</p>
            <p><strong>Listing ID:</strong> {listingId}</p>
          </div>
          {!paid ? (
            <div>
              <div className="flex items-center justify-between bg-gray-50 rounded p-4 mb-6">
                <div>
                  <p className="text-gray-900 font-medium">Platform Fee</p>
                  <p className="text-gray-500 text-sm">One-time service fee</p>
                </div>
                <div className="text-lg font-semibold text-gray-900">Rs. 250</div>
              </div>
              <button
                onClick={handlePay}
                disabled={isPaying}
                className={`w-full py-3 rounded-md text-white font-semibold ${isPaying ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isPaying ? 'Processing Payment…' : 'Pay and Continue'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful</h2>
              <p className="text-gray-600 mb-6">We’re generating your agreement draft.</p>
              <Link to="/messages" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Go to Messages</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalizePage;


