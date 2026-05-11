import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Layout/Layout';
import { creatorAPI } from '../services/api';
import { Card, Button, Spinner } from '../components/common/UIComponents';

const CreatorsPage = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [rating, setRating] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const firstLoadRef = useRef(true);

  const formatRating = (value) => {
    if (value === null || value === undefined || value === '') return '0.0';
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0';
  };

  const getCreatorName = (creator) => creator?.user?.name || creator?.name || 'Creator';

  const getCreatorEmail = (creator) => creator?.user?.email || creator?.email || '';

  const getCreatorBio = (creator) => creator?.user?.bio || creator?.bio || 'No bio provided yet.';

  const getCreatorNiches = (creator) => {
    const value = Array.isArray(creator?.niche) ? creator.niche : [];
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 4);
  };

  // Helper to extract array safely from responses
  const extractArray = (res) => {
    if (!res) return [];
    const payload = res.data ?? res;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.creators)) return payload.creators;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  };

  const fetchCreators = async (tags = [], ratingFilter = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (tags.length) params.niche = tags.join(',');
      if (ratingFilter !== '' && ratingFilter !== null && ratingFilter !== undefined) params.rating = ratingFilter;
      const res = await creatorAPI.getCreators(params);
      const arr = extractArray(res);
      setCreators(arr);
    } catch (err) {
      console.error(err);
      setError('Failed to load creators');
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  const syncFiltersToUrl = (nextTags = selectedTags, nextRating = rating) => {
    const params = new URLSearchParams();

    if (nextTags.length) {
      params.set('niche', nextTags.join(','));
    }

    if (nextRating !== '' && nextRating !== null && nextRating !== undefined) {
      params.set('rating', nextRating);
    }

    const search = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: search ? `?${search}` : '',
      },
      { replace: true }
    );
  };

  const handleResetFilters = () => {
    setSelectedTags([]);
    setInputValue('');
    setRating('');
    syncFiltersToUrl([], '');
    fetchCreators([], '');
  };

  // Initialize from URL query (niche=tag1,tag2)
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const niche = q.get('niche');
    const tags = niche ? niche.split(',').map(t => t.trim()).filter(Boolean) : [];
    const urlRating = q.get('rating');
    setRating(urlRating ?? '');
    setSelectedTags(tags);
    // On first load, fetch immediately
    fetchCreators(tags, urlRating ?? '');
    // no local history: just initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch whenever selectedTags change (user adds/removes)
  useEffect(() => {
    // skip immediate second call if initial load already fetched
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    // Update URL query to reflect current filters
    syncFiltersToUrl(selectedTags, rating);
    fetchCreators(selectedTags, rating);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags]);

  // When rating changes, trigger a fetch and URL sync
  useEffect(() => {
    // don't run on first render twice
    if (firstLoadRef.current) return;
    syncFiltersToUrl(selectedTags, rating);
    fetchCreators(selectedTags, rating);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rating]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Discover Creators</h1>
            <div className="flex items-center gap-3">
              <Button onClick={handleResetFilters}>Reset</Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <input
                  aria-label="Add filter tag"
                  placeholder="Type a tag and press Enter (e.g. fashion,tech)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const parts = inputValue.split(',').map(p => p.trim()).filter(Boolean);
                      if (parts.length) {
                        setSelectedTags(prev => {
                          const merged = Array.from(new Set([...prev, ...parts]));
                          return merged.slice(0, 10);
                        });
                        setInputValue('');
                      }
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                />
                <Button onClick={() => {
                  const parts = inputValue.split(',').map(p => p.trim()).filter(Boolean);
                  if (parts.length) {
                    setSelectedTags(prev => {
                      const merged = Array.from(new Set([...prev, ...parts]));
                      return merged.slice(0, 10);
                    });
                    setInputValue('');
                  }
                }}>Add</Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTags(prev => prev.filter(x => x !== t))}
                    className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm border border-primary-100"
                  >
                    {t} ×
                  </button>
                ))}
              </div>
            </div>

                    {/* no recent searches UI - users add up to 10 tags directly */}
            
            <div className="sm:ml-4 mt-3 sm:mt-0">
              <label className="text-sm text-gray-600 block mb-1">Min rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 bg-white"
              >
                <option value="">Any</option>
                <option value="0">0+</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="text-red-500 mb-6">{error}</div>
        )}

        {!loading && !error && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{creators.length}</span> creator{creators.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {creators.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
                  No creators found for the current filters.
                </div>
              )}

              {creators.map((creator, index) => {
                const name = getCreatorName(creator);
                const email = getCreatorEmail(creator);
                const niches = getCreatorNiches(creator);
                const initials = name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase() || 'C';

                return (
                  <Card
                    key={creator._id || creator.id || `${name}-${index}`}
                    className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-brand" />
                    <div className="flex h-full flex-col justify-between p-6">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 text-lg font-bold text-white shadow-lg ring-4 ring-primary-50">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-xl font-semibold text-gray-900">{name}</h3>
                              <p className="truncate text-sm text-gray-500">{email || 'Creator profile'}</p>
                            </div>
                          </div>

                          <div className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 ring-1 ring-amber-100">
                            {formatRating(creator.rating)} ★
                          </div>
                        </div>

                        <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                          {getCreatorBio(creator)}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {niches.length > 0 ? (
                            niches.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-100"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                              General creator
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <span className="rounded-full bg-gray-50 px-3 py-1 ring-1 ring-gray-100">
                            Followers {creator.followersCount ?? '0'}
                          </span>
                          <span className="rounded-full bg-gray-50 px-3 py-1 ring-1 ring-gray-100">
                            Min rating matched
                          </span>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => alert('View profile not implemented')}
                          className="shrink-0 rounded-full px-4"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatorsPage;
