import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Layout/Layout';
import { creatorAPI } from '../services/api';
import { Spinner, Badge } from '../components/common/UIComponents';
import { Star, Users, SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react';
import { stashCreatorProfile } from '../utils/publicProfileCache';

const fmt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(1) : '0.0';
};

const POPULAR_NICHES = ['fashion', 'tech', 'beauty', 'gaming', 'fitness', 'food', 'travel', 'music', 'education', 'finance'];

const StarDisplay = ({ value }) => (
  <span className="inline-flex gap-0.5">
    {[1,2,3,4,5].map(n => (
      <Star key={n} size={11}
        className={n <= Math.round(Number(value)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'} />
    ))}
  </span>
);

const CreatorCard = ({ creator, onClick }) => {
  const name = creator?.user?.name || 'Creator';
  const avatar = creator?.user?.profilePicture_url;
  const niches = (Array.isArray(creator?.niche) ? creator.niche : []).slice(0, 5);
  const links = Array.isArray(creator?.links) ? creator.links.slice(0, 3) : [];
  const initials = name.split(' ').filter(Boolean).slice(0,2).map(p=>p[0]).join('').toUpperCase() || 'C';
  const followers = creator?.followersCount ?? 0;
  const rating = fmt(creator?.rating);

  return (
    <div
      onClick={() => onClick(creator)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1
        transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Gradient header */}
      <div className="h-20 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 relative shrink-0">
        {/* Avatar */}
        <div className="absolute -bottom-8 left-5">
          {avatar ? (
            <img src={avatar} alt=""
              className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center
              text-xl font-black text-primary-600">
              {initials}
            </div>
          )}
        </div>
        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1
          flex items-center gap-1.5 shadow-sm">
          <Star size={13} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold text-gray-800">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 px-5 pb-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-primary-600 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <StarDisplay value={creator?.rating} />
            <span className="text-xs text-gray-400 ml-1">{rating}/5</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 flex-1">
          {creator?.user?.bio || creator?.bio || 'No bio provided yet.'}
        </p>

        {/* Niches */}
        {niches.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {niches.map(n => (
              <span key={n} className="text-[10px] font-semibold px-2.5 py-1 rounded-full
                bg-primary-50 text-primary-700 border border-primary-100">
                {n}
              </span>
            ))}
          </div>
        )}

        {/* Social links preview */}
        {links.length > 0 && (
          <div className="flex gap-2 mb-3">
            {links.map((l, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium truncate max-w-[90px]">
                {l.platform || `Link ${i+1}`}
              </span>
            ))}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} />
            <span>{followers >= 1000 ? `${(followers/1000).toFixed(1)}k` : followers} followers</span>
          </div>
          <span className="text-xs font-semibold text-primary-600 group-hover:underline">
            View profile →
          </span>
        </div>
      </div>
    </div>
  );
};

const CreatorsPage = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [rating, setRating] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // rating | followers
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const firstLoadRef = useRef(true);

  const fetchCreators = useCallback(async (tags, ratingFilter, followersFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (tags.length) params.niche = tags.join(',');
      if (ratingFilter !== '') params.rating = ratingFilter;
      if (followersFilter !== '') params.minFollowers = followersFilter;
      const res = await creatorAPI.getCreators(params);
      const payload = res?.data;
      const list = Array.isArray(payload?.creators) ? payload.creators
        : Array.isArray(payload) ? payload : [];
      setCreators(list);
    } catch (err) {
      setError('Failed to load creators');
      setCreators([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const tags = (q.get('niche') || '').split(',').map(t=>t.trim()).filter(Boolean);
    const urlRating = q.get('rating') || '';
    const urlFollowers = q.get('minFollowers') || '';
    setSelectedTags(tags);
    setRating(urlRating);
    setMinFollowers(urlFollowers);
    fetchCreators(tags, urlRating, urlFollowers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstLoadRef.current) { firstLoadRef.current = false; return; }
    const p = new URLSearchParams();
    if (selectedTags.length) p.set('niche', selectedTags.join(','));
    if (rating !== '') p.set('rating', rating);
    if (minFollowers !== '') p.set('minFollowers', minFollowers);
    navigate({ pathname: location.pathname, search: p.toString() ? `?${p}` : '' }, { replace: true });
    fetchCreators(selectedTags, rating, minFollowers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTags, rating, minFollowers]);

  const addTag = (tag) => {
    const clean = tag.trim().toLowerCase();
    if (!clean) return;
    setSelectedTags(prev => Array.from(new Set([...prev, clean])).slice(0, 10));
    setInputValue('');
  };

  const handleInputKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      inputValue.split(',').map(p=>p.trim()).filter(Boolean).forEach(addTag);
    }
  };

  const resetAll = () => {
    setSelectedTags([]); setRating(''); setMinFollowers(''); setInputValue(''); setSearch('');
    navigate({ pathname: location.pathname, search: '' }, { replace: true });
    fetchCreators([], '', '');
  };

  // Client-side: filter by name search + sort
  const displayed = [...creators]
    .filter(c => {
      if (!search) return true;
      const name = (c?.user?.name || c?.name || '').toLowerCase();
      const niches = (Array.isArray(c?.niche) ? c.niche : []).join(' ').toLowerCase();
      return name.includes(search.toLowerCase()) || niches.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'followers') return (b?.followersCount ?? 0) - (a?.followersCount ?? 0);
      return Number(fmt(b?.rating)) - Number(fmt(a?.rating));
    });

  const activeFilterCount = selectedTags.length + (rating ? 1 : 0) + (minFollowers ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Hero header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-8 sm:p-12 mb-8 text-white">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black mb-2">Discover Creators</h1>
            <p className="text-white/75 max-w-lg leading-relaxed">
              Find talented content creators by niche, rating, and follower count. Start a collaboration today.
            </p>
            <div className="mt-6 flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-md">
              <Search size={18} className="text-white/60 shrink-0" />
              <input
                id="creators-search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or niche…"
                className="bg-transparent flex-1 text-white placeholder-white/50 focus:outline-none text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-white/60 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-white/5 translate-y-1/2" />
        </div>

        {/* ── Filter bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-3 p-4">
            {/* Popular niches quick-pick */}
            <div className="flex flex-wrap gap-2 flex-1">
              {POPULAR_NICHES.map(n => (
                <button
                  key={n}
                  onClick={() => {
                    if (selectedTags.includes(n)) setSelectedTags(p => p.filter(x => x !== n));
                    else addTag(n);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                    ${selectedTags.includes(n)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'}`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Advanced filter toggle */}
            <button
              id="creators-advanced-filter-btn"
              onClick={() => setFiltersOpen(p => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition-colors
                ${activeFilterCount > 0
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
            >
              <SlidersHorizontal size={15} />
              Filters {activeFilterCount > 0 && <span className="bg-primary-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
              <ChevronDown size={14} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>

            {activeFilterCount > 0 && (
              <button onClick={resetAll} className="text-sm text-gray-400 hover:text-error flex items-center gap-1">
                <X size={14} /> Reset
              </button>
            )}
          </div>

          {/* Advanced filters panel */}
          {filtersOpen && (
            <div className="border-t border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50">
              {/* Custom niche input */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Custom niche</label>
                <div className="flex gap-2">
                  <input
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleInputKey}
                    placeholder="e.g. crypto, vlog…"
                    className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                  <button
                    onClick={() => inputValue.split(',').map(p=>p.trim()).filter(Boolean).forEach(addTag)}
                    className="px-3 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700"
                  >Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedTags.map(t => (
                    <span key={t} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      {t}
                      <button onClick={() => setSelectedTags(p => p.filter(x => x !== t))} className="hover:text-error"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Min rating */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Min rating</label>
                <select value={rating} onChange={e => setRating(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white">
                  <option value="">Any</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+ ★</option>)}
                </select>
              </div>

              {/* Min followers */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Min followers</label>
                <select value={minFollowers} onChange={e => setMinFollowers(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none bg-white">
                  <option value="">Any</option>
                  <option value="100">100+</option>
                  <option value="1000">1,000+</option>
                  <option value="10000">10,000+</option>
                  <option value="100000">100k+</option>
                  <option value="1000000">1M+</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── Results header ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading…' : <><span className="font-bold text-gray-900">{displayed.length}</span> creator{displayed.length !== 1 ? 's' : ''} found</>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort:</span>
            {['rating', 'followers'].map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors
                  ${sortBy === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'}`}>
                {s === 'rating' ? '⭐ Rating' : '👥 Followers'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : error ? (
          <p className="text-error text-center py-8">{error}</p>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 bg-white">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-semibold text-gray-700">No creators found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            <button onClick={resetAll} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayed.map((creator, i) => (
              <CreatorCard
                key={creator._id || i}
                creator={creator}
                onClick={c => { stashCreatorProfile(c); navigate(`/creators/${c._id}`); }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatorsPage;
