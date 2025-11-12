'use client';

import { useState, useEffect } from 'react';
import { useAdmin, getAdminHeaders } from '@/contexts/AdminContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function KennyPage() {
  const { isAdmin, adminKey } = useAdmin();
  const [textInput, setTextInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [imageCount, setImageCount] = useState<number>(0);
  const [apiUsage, setApiUsage] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [gearCount, setGearCount] = useState<number>(0);

  useEffect(() => {
    if (isAdmin) {
      fetchApiUsage();
      fetchGearCount();
    }
  }, [isAdmin]);

  const fetchGearCount = async () => {
    try {
      const response = await fetch('/api/gear?pageSize=1');
      if (response.ok) {
        const data = await response.json();
        setGearCount(data.totalItems || 0);
      }
    } catch (error) {
      console.error('Error fetching gear count:', error);
    }
  };

  const fetchApiUsage = async () => {
    try {
      const response = await fetch('/api/admin/api-usage', {
        headers: getAdminHeaders(adminKey),
      });
      if (response.ok) {
        const data = await response.json();
        setApiUsage(data);
      }
    } catch (error) {
      console.error('Error fetching API usage:', error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleProcess = async () => {
    if (!textInput.trim()) {
      setError('Please paste some gear data');
      return;
    }

    setProcessing(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(adminKey),
        },
        body: JSON.stringify({ 
          text: textInput,
          imageCount: imageCount > 0 ? imageCount : undefined
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process gear list');
      }

      const data = await response.json();
      setResults(data);
      setTextInput(''); // Clear input on success
      
      // Refresh API usage stats and gear count
      fetchApiUsage();
      fetchGearCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process gear list');
    } finally {
      setProcessing(false);
    }
  };

  const handleClearGear = async () => {
    if (!confirm('⚠️ WARNING: This will DELETE ALL GEAR from the database!\n\nProjects will be kept but their gear assignments will be removed.\n\nThis action CANNOT be undone.\n\nAre you sure?')) {
      return;
    }

    if (!confirm('Final confirmation: Delete all gear?')) {
      return;
    }

    setClearing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(adminKey),
        },
        body: JSON.stringify({ 
          clearGear: true,
          clearProjects: false,
          clearImages: true,
          clearProjectAssignments: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clear gear');
      }

      const data = await response.json();
      toast.success(`Gear cleared! Deleted ${data.deleted.gear} items, ${data.deleted.gearImages} images`);
      
      setResults(null);
      setTextInput('');
      
      // Refresh gear count
      fetchGearCount();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to clear gear';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setClearing(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-mono">Admin Access Required</h1>
          <p className="text-gray-600">You need admin access to use this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 font-mono">KENNY KLOUD</h1>
              <p className="text-gray-600 font-mono">Bulk Gear Upload via Text Parsing</p>
            </div>
            <div className="flex gap-3 items-center">
              {gearCount === 0 ? (
                <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-mono text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  No gear in catalogue
                </div>
              ) : (
                <button
                  onClick={handleClearGear}
                  disabled={clearing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {clearing ? 'Clearing...' : `Clear Gear (${gearCount})`}
                </button>
              )}
              <Link 
                href="/gear"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                ← Back to Catalog
              </Link>
            </div>
          </div>
        </div>

        {/* API Usage Stats */}
        {!loadingUsage && apiUsage && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 font-mono">Google Image API Usage</h3>
                  <p className="text-sm text-gray-600">Daily limit: 100 calls | Resets at midnight</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600 font-mono">
                    {apiUsage.remaining}
                  </div>
                  <div className="text-sm text-gray-600 font-mono">calls remaining</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Used: {apiUsage.used} / {apiUsage.limit}</span>
                  <span className="font-semibold text-purple-600">{apiUsage.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all rounded-full ${
                      apiUsage.percentage > 90 ? 'bg-red-500' :
                      apiUsage.percentage > 70 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${apiUsage.percentage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 font-mono">Paste Gear List</h2>
              
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="font-semibold text-blue-900 mb-2">Super Simple Format:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Category headers end with <code className="bg-blue-100 px-1 rounded">:</code> (e.g., <code className="bg-blue-100 px-1 rounded">Mics:</code>)</li>
                  <li>• Each line after = one gear item</li>
                  <li>• Just type gear names: <code className="bg-blue-100 px-1 rounded">Neumann U87</code></li>
                  <li>• Or: <code className="bg-blue-100 px-1 rounded">Brand - Name</code></li>
                  <li>• System auto-fills description, tags, etc.</li>
                  <li>• Optional tags: <code className="bg-blue-100 px-1 rounded">#vintage #tube</code></li>
                </ul>
              </div>

              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your gear list here...

Example:

Mics:
Neumann U87 #condenser #vintage
Shure SM57
AKG C414

Guitars:
Fender Stratocaster
Gibson Les Paul #humbucker #vintage

Keyboards:
Moog Minimoog
Rhodes Mark I"
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />

              {/* Image API Calls Selector */}
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <label className="block text-sm font-semibold text-gray-900 mb-2 font-mono">
                  Google Image API Calls for This Upload
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  {apiUsage && (
                    <span>
                      {apiUsage.remaining} calls remaining today. 
                      {apiUsage.remaining === 0 && ' No images will be fetched.'}
                    </span>
                  )}
                  {!apiUsage && 'Loading usage...'}
                </p>
                <input
                  type="number"
                  min="0"
                  max={apiUsage?.remaining || 0}
                  value={imageCount || ''}
                  onChange={(e) => setImageCount(parseInt(e.target.value) || 0)}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      setImageCount(0);
                      e.target.value = '';
                    }
                  }}
                  placeholder={`Auto (max ${apiUsage?.remaining || 0})`}
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to automatically fetch images for as many items as possible (up to daily limit).
                  Or enter a specific number to limit API calls for this upload.
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleProcess}
                  disabled={processing || !textInput.trim()}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Process & Upload
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setTextInput('');
                    setResults(null);
                    setError(null);
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 font-mono">Results</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">Error:</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <p className="font-semibold">✓ Upload Complete!</p>
                    <p className="text-sm mt-1">
                      Successfully created {results.created} gear item{results.created !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {results.needsReview && results.needsReview.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">📋 {results.needsReview.length} Item{results.needsReview.length !== 1 ? 's' : ''} Need Review</p>
                          <p className="text-sm mt-1">
                            These items couldn't be auto-categorized. Please categorize them manually.
                          </p>
                          <ul className="text-sm mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {results.needsReview.map((item: any, idx: number) => (
                              <li key={idx}>• Line {item.lineNumber}: {item.originalLine}</li>
                            ))}
                          </ul>
                        </div>
                        <Link
                          href="/reviewer"
                          className="ml-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
                        >
                          Review Now →
                        </Link>
                      </div>
                    </div>
                  )}

                  {results.errors && results.errors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                      <p className="font-semibold">⚠ {results.errors.length} Error{results.errors.length !== 1 ? 's' : ''}</p>
                      <ul className="text-sm mt-2 space-y-1 max-h-40 overflow-y-auto">
                        {results.errors.map((err: string, idx: number) => (
                          <li key={idx}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {results.items && results.items.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Created Items:</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {results.items.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white border border-gray-200 p-3 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-600">{item.brand}</p>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {item.category}
                                </Badge>
                              </div>
                              <Link
                                href={`/gear/${item.id}`}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                View →
                              </Link>
                            </div>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!results && !error && (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Paste gear list and click "Process & Upload"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Advanced Format Options:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-1">Super Simple:</p>
                <code className="block bg-gray-100 p-2 rounded text-xs whitespace-pre">
                  Mics:{'\n'}
                  Neumann U87{'\n'}
                  Shure SM57
                </code>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">With Tags:</p>
                <code className="block bg-gray-100 p-2 rounded text-xs whitespace-pre">
                  Guitars:{'\n'}
                  Fender Strat #vintage{'\n'}
                  Gibson Les Paul #humbucker
                </code>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Category Aliases:</p>
                <p className="text-gray-600 text-xs">Mics, Guitars, Bass, Keys/Synths, Amps, Cabs, Preamps, Comp/Dynamics, EQ, Effects, Monitors, Drums</p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">Smart Features:</p>
                <p className="text-gray-600 text-xs">Auto-detects brands (Neumann, Fender, etc.), generates descriptions, randomizes tags/characteristics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

