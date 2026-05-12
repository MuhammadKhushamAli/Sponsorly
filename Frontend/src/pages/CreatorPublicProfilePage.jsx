import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from '../components/Layout/Layout';
import { Spinner } from '../components/common/UIComponents';
import { creatorAPI, chatAPI } from '../services/api';
import {
  ArrowLeft, Star, BadgeCheck, Users, ExternalLink,
  Twitter, Youtube, Instagram, Globe, MessageSquare, Link2
} from 'lucide-react';
import { readCachedCreator, stashCreatorProfile } from '../utils/publicProfileCache';
import ReviewsSection from '../components/common/ReviewsSection';

const fmt = (v) => { const n = Number(v); return Number.isFinite(n) ? n.toFixed(1) : '0.0'; };

const StarRow = ({ value }) => (
  <span className="inline-flex gap-0.5">
    {[1,2,3,4,5].map(n => (
      <Star key={n} size={15}
        className={n <= Math.round(Number(value)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'} />
    ))}
  </span>
);

const platformIcon = (platform = '') => {
  const p = platform.toLowerCase();
  if (p.includes('twitter') || p.includes('x')) return <Twitter size={16} />;
  if (p.includes('youtube')) return <Youtube size={16} />;
  if (p.includes('instagram')) return <Instagram size={16} />;
  return <Globe size={16} />;
};

const platformColor = (platform = '') => {
  const p = platform.toLowerCase();
  if (p.includes('twitter') || p.includes('x')) return 'bg-gray-800';
  if (p.includes('youtube')) return 'bg-red-500';
  if (p.includes('instagram')) return 'bg-gradient-to-br from-pink-500 to-orange-400';
  if (p.includes('tiktok')) return 'bg-gray-900';
  if (p.includes('linkedin')) return 'bg-primary-600';
  return 'bg-primary-700';
};

const CreatorPublicProfilePage = () => {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((s) => s.auth);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!creatorId) { setLoading(false); return; }
    let cancelled = false;

    const load = async () => {
      setCreator(null); setLoading(true); setError('');
      try {
        const { data } = await creatorAPI.getById(creatorId);
        const c = data?.creator;
        if (c && !cancelled) { setCreator(c); stashCreatorProfile(c); setLoading(false); return; }
      } catch { /* fall through */ }

      const cached = readCachedCreator(creatorId);
      if (cached && !cancelled) { setCreator(cached); setLoading(false); return; }

      try {
        const res = await creatorAPI.getCreators({});
        const list = res.data?.creators || [];
        const found = list.find(c => String(c._id) === String(creatorId));
        if (!cancelled) {
          if (found) { setCreator(found); stashCreatorProfile(found); }
          else setError('This creator profile could not be loaded.');
        }
      } catch {
        if (!cancelled) setError('Could not load this profile. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [creatorId]);

  const handleStartChat = async () => {
    const userId = creator?.user?._id || creator?.user;
    if (!userId || !authUser) return;
    setStartingChat(true);
    try {
      const res = await chatAPI.createDirectChat(String(userId));
      navigate('/chat');
    } catch { /* ignore */ } finally { setStartingChat(false); }
  };

  const user = creator?.user;
  const name = user?.name || 'Creator';
  const email = user?.email || '';
  const bio = user?.bio || creator?.bio || '';
  const avatar = user?.profilePicture_url;
  const niches = Array.isArray(creator?.niche) ? creator.niche : [];
  const links = Array.isArray(creator?.links) ? creator.links : [];
  const followers = creator?.followersCount ?? 0;
  const rating = fmt(creator?.rating);
  const revieweeUserId = String(user?._id || user || '');
  const isOwnProfile = authUser && String(authUser.id || authUser._id) === revieweeUserId;
  const canReview = !!authUser && authUser.role === 'sponsor' && !isOwnProfile;

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-error font-medium mb-4">{error}</p>
        <Link to="/creators" className="inline-block px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm">
          Browse Creators
        </Link>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {/* ── Hero card ── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          {/* Gradient cover */}
          <div className="h-48 sm:h-56 bg-gradient-to-br from-primary-600 via-secondary-500 to-accent-500" />

          {/* Profile content */}
          <div className="bg-white px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 mb-6">
              {/* Avatar */}
              <div className="shrink-0">
                {avatar ? (
                  <img src={avatar} alt=""
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl" />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600
                    border-4 border-white shadow-xl flex items-center justify-center text-4xl font-black text-white">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name + badges */}
              <div className="flex-1 min-w-0 pt-4 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 truncate">{name}</h1>
                  {user?.profileCompleted && (
                    <BadgeCheck size={22} className="text-primary-500 shrink-0" title="Profile complete" />
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-3">Content Creator</p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-1.5">
                    <StarRow value={creator?.rating} />
                    <span className="text-sm font-bold text-gray-800 ml-1">{rating}</span>
                    <span className="text-xs text-gray-400">/ 5</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                    <Users size={14} className="text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800">
                      {followers >= 1000 ? `${(followers/1000).toFixed(1)}k` : followers}
                    </span>
                    <span className="text-xs text-gray-400">followers</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              {authUser && !isOwnProfile && (
                <div className="flex gap-2 shrink-0 sm:self-end">
                  <button
                    id="creator-start-chat-btn"
                    onClick={handleStartChat}
                    disabled={startingChat}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600
                      text-white rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all
                      disabled:opacity-50"
                  >
                    {startingChat ? <Spinner size="sm" /> : <MessageSquare size={16} />}
                    Message
                  </button>
                </div>
              )}
            </div>

            {/* Bio */}
            {bio && (
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base max-w-2xl border-t border-gray-100 pt-6 mt-4">
                {bio}
              </p>
            )}

            {email && (
              <p className="text-xs text-gray-400 mt-3 break-all">{email}</p>
            )}
          </div>
        </div>

        {/* ── Two-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="space-y-5">
            {/* Niches */}
            {niches.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Niches</h3>
                <div className="flex flex-wrap gap-2">
                  {niches.map((n, i) => (
                    <span key={`${n}-${i}`}
                      className="text-sm font-semibold px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 border border-primary-100">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="font-bold text-gray-900">⭐ {rating}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Followers</span>
                  <span className="font-bold text-gray-900">
                    {followers >= 1000 ? `${(followers/1000).toFixed(1)}k` : followers}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Social Links Portfolio */}
          <div className="lg:col-span-2 space-y-5">
            {links.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Link2 size={14} /> Social Links & Portfolio
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {links.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200
                        hover:bg-primary-50 transition-all group">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${platformColor(link.platform)}`}>
                        {platformIcon(link.platform)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-700 capitalize">{link.platform || 'Link'}</p>
                        <p className="text-xs text-gray-400 truncate">{link.url}</p>
                      </div>
                      <ExternalLink size={14} className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <ReviewsSection
                revieweeUserId={revieweeUserId}
                revieweeName={name}
                canReview={canReview}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatorPublicProfilePage;
