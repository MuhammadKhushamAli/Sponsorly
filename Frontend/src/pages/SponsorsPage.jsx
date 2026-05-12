import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Layout/Layout';
import { sponsorAPI } from '../services/api';
import { Spinner } from '../components/common/UIComponents';
import { Star, Building2, SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react';
import { stashSponsorProfile } from '../utils/publicProfileCache';

const fmt = (v) => { const n = Number(v); return Number.isFinite(n) ? n.toFixed(1) : '0.0'; };

const POPULAR_INDUSTRIES = ['tech', 'fashion', 'beauty', 'finance', 'health', 'gaming', 'food', 'travel', 'education', 'automotive'];

const StarDisplay = ({ value }) => (
  <span className="inline-flex gap-0.5">
    {[1,2,3,4,5].map(n => (
      <Star key={n} size={11}
        className={n <= Math.round(Number(value)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'} />
    ))}
  </span>
);

const SponsorCard = ({ sponsor, onClick }) => {
  const name = sponsor?.user?.name || 'Sponsor';
  const avatar = sponsor?.user?.profilePicture_url;
  const industries = (Array.isArray(sponsor?.industries) ? sponsor.industries : []).slice(0, 5);
  const rating = fmt(sponsor?.rating);
  const bio = sponsor?.user?.bio || 'No bio provided yet.';

  return (
    <div
      onClick={() => onClick(sponsor)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1
        transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="h-20 bg-gradient-to-br from-secondary-500 via-primary-500 to-accent-500 relative shrink-0">
        <div className="absolute -bottom-8 left-5">
          {avatar ? (
            <img src={avatar} alt="" className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center">
              <Building2 className="w-8 h-8 text-secondary-500" />
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1
          flex items-center gap-1.5 shadow-sm">
          <Star size={13} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-gray-800">{rating}</span>
        </div>
      </div>

      <div className="pt-10 px-5 pb-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-secondary-600 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <StarDisplay value={sponsor?.rating} />
            <span className="text-xs text-gray-400 ml-1">{rating}/5</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 flex-1">{bio}</p>

        {industries.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {industries.map(ind => (
              <span key={ind} className="text-[10px] font-semibold px-2.5 py-1 rounded-full
                bg-secondary-50 text-secondary-700 border border-secondary-100">
                {ind}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto">
          <span className="text-xs text-gray-400">Sponsor</span>
          <span className="text-xs font-semibold text-secondary-600 group-hover:underline">View profile →</span>
        </div>
      </div>
    </div>
  );
};

const SponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [minRating, setMinRating] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const location = useLocation();
  const navigate = useNavigate();
  const firstLoadRef = useRef(true);

  const fetchSponsors = useCallback(async (tags) => {
    if (!tags.length) { setSponsors([]); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const res = await sponsorAPI.findSponsors(tags.join(','));
      const payload = res?.data;
      const list = Array.isArray(payload?.sponsors) ? payload.sponsors
        : Array.isArray(payload) ? payload : [];
      setSponsors(list);
    } catch {
      setError('Failed to load sponsors. Please sign in.');
      setSponsors([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const tags = (q.get('industries') || '').split(',').map(t=>t.trim()).filter(Boolean);
    const r = q.get('rating') || '';
    setSelectedTags(tags); setMinRating(r);
    fetchSponsors(tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstLoadRef.current) { firstLoadRef.current = false; return; }
    const p = new URLSearchParams();
    if (selectedTags.length) p.set('industries', selectedTags.join(','));
    if (minRating) p.set('rating', minRating);
    navigate({ pathname: location.pathname, search: p.toString() ? `?${p}` : '' }, { replace: true });
    fetchSponsors(selectedTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags, minRating]);

  const addTag = (tag) => {
    const clean = tag.trim().toLowerCase();
    if (!clean) return;
    setSelectedTags(prev => Array.from(new Set([...prev, clean])).slice(0, 10));
    setInputValue('');
  };

  const resetAll = () => {
    setSelectedTags([]); setMinRating(''); setInputValue(''); setSearch('');
    navigate({ pathname: location.pathname, search: '' }, { replace: true });
    setSponsors([]);
  };

  const displayed = [...sponsors]
    .filter(s => {
      const r = Number(fmt(s?.rating));
      if (minRating !== '' && r < Number(minRating)) return false;
      if (!search) return true;
      const name = (s?.user?.name || '').toLowerCase();
      const inds = (Array.isArray(s?.industries) ? s.industries : []).join(' ').toLowerCase();
      return name.includes(search.toLowerCase()) || inds.includes(search.toLowerCase());
    })
    .sort((a, b) => Number(fmt(b?.rating)) - Number(fmt(a?.rating)));

  const activeFilterCount = selectedTags.length + (minRating ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-600 via-secondary-500 to-primary-600 p-8 sm:p-12 mb-8 text-white">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black mb-2">Find Sponsors</h1>
            <p className="text-white/75 max-w-lg leading-relaxed">
              Discover brands and sponsors by industry. Connect and grow your creator career.
            </p>
            <div className="mt-6 flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-md">
              <Search size={18} className="text-white/60 shrink-0" />
              <input
                id="sponsors-search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sponsors by name or industry…"
                className="bg-transparent flex-1 text-white placeholder-white/50 focus:outline-none text-sm"
              />
              {search && <button onClick={() => setSearch('')} className="text-white/60 hover:text-white"><X size={16} /></button>}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-white/5 translate-y-1/2" />
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex flex-wrap gap-2 flex-1">
              {POPULAR_INDUSTRIES.map(n => (
                <button key={n}
                  onClick={() => {
                    if (selectedTags.includes(n)) setSelectedTags(p => p.filter(x => x !== n));
                    else addTag(n);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                    ${selectedTags.includes(n)
                      ? 'bg-secondary-600 text-white border-secondary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-secondary-400 hover:text-secondary-600'}`}>
                  {n}
                </button>
              ))}
            </div>

            <button id="sponsors-advanced-filter-btn"
              onClick={() => setFiltersOpen(p => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition-colors
                ${activeFilterCount > 0
                  ? 'border-secondary-500 text-secondary-600 bg-secondary-50'
                  : 'border-gray-200 text-gray-600 hover:border-secondary-300'}`}>
              <SlidersHorizontal size={15} />
              Filters {activeFilterCount > 0 && <span className="bg-secondary-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
              <ChevronDown size={14} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>
            {activeFilterCount > 0 && (
              <button onClick={resetAll} className="text-sm text-gray-400 hover:text-error flex items-center gap-1">
                <X size={14} /> Reset
              </button>
            )}
          </div>

          {filtersOpen && (
            <div className="border-t border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Custom industry</label>
                <div className="flex gap-2">
                  <input value={inputValue} onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); inputValue.split(',').map(p=>p.trim()).filter(Boolean).forEach(addTag); }}}
                    placeholder="e.g. retail, logistics…"
                    className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-secondary-500 focus:outline-none" />
                  <button onClick={() => inputValue.split(',').map(p=>p.trim()).filter(Boolean).forEach(addTag)}
                    className="px-3 py-2 bg-secondary-600 text-white rounded-xl text-sm font-semibold hover:bg-secondary-700">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedTags.map(t => (
                    <span key={t} className="text-xs bg-secondary-100 text-secondary-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      {t}
                      <button onClick={() => setSelectedTags(p => p.filter(x => x !== t))} className="hover:text-error"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Min rating</label>
                <select value={minRating} onChange={e => setMinRating(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-secondary-500 focus:outline-none bg-white">
                  <option value="">Any</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ ★</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading…' : selectedTags.length
              ? <><span className="font-bold text-gray-900">{displayed.length}</span> sponsor{displayed.length !== 1 ? 's' : ''} found</>
              : 'Select industries above to discover sponsors'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : error ? (
          <p className="text-error text-center py-8">{error}</p>
        ) : !selectedTags.length ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 bg-white">
            <Building2 size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-700">Pick an industry to get started</p>
            <p className="text-sm text-gray-400 mt-1">Click any industry chip above to find matching sponsors</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 bg-white">
            <p className="font-semibold text-gray-700">No sponsors matched</p>
            <p className="text-sm text-gray-400 mt-1">Try different industries</p>
            <button onClick={resetAll} className="mt-4 px-4 py-2 bg-secondary-600 text-white rounded-xl text-sm font-semibold">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayed.map((sponsor, i) => (
              <SponsorCard key={sponsor._id || i} sponsor={sponsor}
                onClick={s => { stashSponsorProfile(s); navigate(`/sponsors/${s._id}`); }} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SponsorsPage;
