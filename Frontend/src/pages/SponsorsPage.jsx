import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Layout/Layout';
import { sponsorAPI } from '../services/api';
import { Card, Button, Spinner, Badge } from '../components/common/UIComponents';
import { Building2, Star } from 'lucide-react';
import { stashSponsorProfile } from '../utils/publicProfileCache';

const SponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const firstLoadRef = useRef(true);

  const formatRating = (value) => {
    if (value === null || value === undefined || value === '') return '0.0';
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0';
  };

  const getSponsorName = (s) => s?.user?.name || 'Sponsor';
  const getSponsorEmail = (s) => s?.user?.email || '';
  const getSponsorBio = (s) => s?.user?.bio || 'No bio provided yet.';

  const extractSponsors = (res) => {
    const payload = res?.data ?? res;
    if (Array.isArray(payload?.sponsors)) return payload.sponsors;
    if (Array.isArray(payload)) return payload;
    return [];
  };

  const fetchSponsors = async (tags) => {
    if (!tags.length) {
      setSponsors([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const csv = tags.join(',');
      const res = await sponsorAPI.findSponsors(csv);
      setSponsors(extractSponsors(res));
    } catch (err) {
      console.error(err);
      setError('Failed to load sponsors. Make sure you are signed in.');
      setSponsors([]);
    } finally {
      setLoading(false);
    }
  };

  const syncFiltersToUrl = (nextTags = selectedTags) => {
    const params = new URLSearchParams();
    if (nextTags.length) params.set('industries', nextTags.join(','));
    const search = params.toString();
    navigate(
      { pathname: location.pathname, search: search ? `?${search}` : '' },
      { replace: true }
    );
  };

  const handleResetFilters = () => {
    setSelectedTags([]);
    setInputValue('');
    syncFiltersToUrl([]);
    setSponsors([]);
  };

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const raw = q.get('industries');
    const tags = raw ? raw.split(',').map((t) => t.trim()).filter(Boolean) : [];
    setSelectedTags(tags);
    fetchSponsors(tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    syncFiltersToUrl(selectedTags);
    fetchSponsors(selectedTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags]);

  const openSponsorProfile = (sponsor) => {
    const id = sponsor?._id;
    if (!id) return;
    stashSponsorProfile(sponsor);
    navigate(`/sponsors/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find sponsors</h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Add industries you care about (same filter style as Discover creators). We match
                sponsors who list any of those industries.
              </p>
            </div>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset filters
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Industry tags
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                aria-label="Add industry tag"
                placeholder="e.g. tech, beauty — press Enter"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const parts = inputValue.split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
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
                  const parts = inputValue.split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
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
                  className="px-3 py-1.5 rounded-full bg-secondary-50 text-secondary-800 text-sm font-medium border border-secondary-100"
                >
                  {t} ×
                </button>
              ))}
            </div>
            {!selectedTags.length && (
              <p className="text-sm text-gray-500 mt-4">
                Add at least one industry to search. Results appear below.
              </p>
            )}
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
              {selectedTags.length ? (
                <>
                  Showing <span className="font-semibold text-gray-900">{sponsors.length}</span>{' '}
                  sponsor{sponsors.length === 1 ? '' : 's'} for your industries.
                </>
              ) : (
                'Enter industries above to see sponsors.'
              )}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {selectedTags.length > 0 && sponsors.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
                  No sponsors matched these industries. Try different tags.
                </div>
              )}

              {sponsors.map((sponsor, index) => {
                const name = getSponsorName(sponsor);
                const email = getSponsorEmail(sponsor);
                const bio = getSponsorBio(sponsor);
                const industries = Array.isArray(sponsor.industries) ? sponsor.industries : [];
                const showIndustries = industries.slice(0, 6);

                return (
                  <Card
                    key={sponsor._id || index}
                    className="!p-0 overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-36 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center p-8 sm:p-6">
                        {sponsor?.user?.profilePicture_url ? (
                          <img
                            src={sponsor.user.profilePicture_url}
                            alt=""
                            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow ring-4 ring-white">
                            <Building2 className="w-9 h-9 text-primary-500" />
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
                            {formatRating(sponsor.rating)}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 line-clamp-3 leading-relaxed">{bio}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {showIndustries.length ? (
                            showIndustries.map((ind) => (
                              <span
                                key={ind}
                                className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700"
                              >
                                {ind}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No industries listed</span>
                          )}
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                          <Button size="sm" onClick={() => openSponsorProfile(sponsor)}>
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

export default SponsorsPage;
