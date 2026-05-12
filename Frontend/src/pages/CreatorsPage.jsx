import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Layout/Layout';
import { creatorAPI } from '../services/api';
import { Card, Button, Spinner, Badge } from '../components/common/UIComponents';
import { Star } from 'lucide-react';
import { stashCreatorProfile } from '../utils/publicProfileCache';

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
    return value.map((item) => String(item).trim()).filter(Boolean);
  };

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
      if (ratingFilter !== '' && ratingFilter !== null && ratingFilter !== undefined) {
        params.rating = ratingFilter;
      }
      const res = await creatorAPI.getCreators(params);
      setCreators(extractArray(res));
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
    if (nextTags.length) params.set('niche', nextTags.join(','));
    if (nextRating !== '' && nextRating !== null && nextRating !== undefined) {
      params.set('rating', nextRating);
    }
    const search = params.toString();
    navigate(
      { pathname: location.pathname, search: search ? `?${search}` : '' },
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

  const openCreatorProfile = (creator) => {
    const id = creator?._id;
    if (!id) return;
    stashCreatorProfile(creator);
    navigate(`/creators/${id}`);
  };

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const niche = q.get('niche');
    const tags = niche ? niche.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const urlRating = q.get('rating');
    setRating(urlRating ?? '');
    setSelectedTags(tags);
    fetchCreators(tags, urlRating ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    syncFiltersToUrl(selectedTags, rating);
    fetchCreators(selectedTags, rating);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags]);

  useEffect(() => {
    if (firstLoadRef.current) return;
    syncFiltersToUrl(selectedTags, rating);
    fetchCreators(selectedTags, rating);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rating]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discover creators</h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Filter by niche tags and minimum rating. Open a profile for the full picture.
              </p>
            </div>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset filters
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-2">Niche tags</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    aria-label="Add filter tag"
                    placeholder="e.g. fashion, tech — press Enter"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const parts = inputValue.split(',').map((p) => p.trim()).filter(Boolean);
                        if (parts.length) {
                          setSelectedTags((prev) => {
                            const merged = Array.from(new Set([...prev, ...parts]));
                            return merged.slice(0, 10);
                          });
                          setInputValue('');
                        }
                      }
                    }}
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-2.5 focus:border-primary-500 focus:outline-none"
                  />
                  <Button
                    onClick={() => {
                      const parts = inputValue.split(',').map((p) => p.trim()).filter(Boolean);
                      if (parts.length) {
                        setSelectedTags((prev) => {
                          const merged = Array.from(new Set([...prev, ...parts]));
                          return merged.slice(0, 10);
                        });
                        setInputValue('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTags((prev) => prev.filter((x) => x !== t))}
                      className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-800 text-sm font-medium border border-primary-100"
                    >
                      {t} ×
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:w-48 shrink-0">
                <label className="text-sm font-medium text-gray-700 block mb-2">Min rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 bg-white focus:border-primary-500 focus:outline-none"
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
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Spinner />
          </div>
        )}

        {error && !loading && <p className="text-error mb-6">{error}</p>}

        {!loading && !error && (
          <div>
            <p className="text-sm text-gray-500 mb-6">
              Showing <span className="font-semibold text-gray-900">{creators.length}</span> creator
              {creators.length === 1 ? '' : 's'}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {creators.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
                  No creators found for the current filters.
                </div>
              )}

              {creators.map((creator, index) => {
                const name = getCreatorName(creator);
                const email = getCreatorEmail(creator);
                const niches = getCreatorNiches(creator).slice(0, 8);
                const avatar = creator?.user?.profilePicture_url;

                return (
                  <Card
                    key={creator._id || creator.id || `${name}-${index}`}
                    className="!p-0 overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-36 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center p-8 sm:p-6">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt=""
                            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-xl font-bold text-primary-600 shadow ring-4 ring-white">
                            {name
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((p) => p[0])
                              .join('')
                              .toUpperCase() || 'C'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6 flex flex-col min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate">{name}</h3>
                            {email ? (
                              <p className="text-sm text-gray-500 truncate">{email}</p>
                            ) : null}
                          </div>
                          <Badge variant="secondary" className="shrink-0 inline-flex items-center gap-1">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            {formatRating(creator.rating)}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {getCreatorBio(creator)}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                          {niches.length ? (
                            niches.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 text-primary-800"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No niches listed</span>
                          )}
                          <span className="text-xs text-gray-500 ml-auto sm:ml-0">
                            {creator.followersCount ?? 0} followers
                          </span>
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                          <Button size="sm" onClick={() => openCreatorProfile(creator)}>
                            View details
                          </Button>
                        </div>
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
