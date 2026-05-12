import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from '../components/Layout/Layout';
import { Spinner } from '../components/common/UIComponents';
import { sponsorAPI, chatAPI } from '../services/api';
import {
  ArrowLeft, Star, Building2, MessageSquare, BadgeCheck, Briefcase
} from 'lucide-react';
import { readCachedSponsor, stashSponsorProfile } from '../utils/publicProfileCache';
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

const SponsorPublicProfilePage = () => {
  const { sponsorId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((s) => s.auth);
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!sponsorId) { setLoading(false); return; }
    let cancelled = false;

    const load = async () => {
      setSponsor(null); setLoading(true); setError('');
      try {
        const { data } = await sponsorAPI.getById(sponsorId);
        const s = data?.sponsor;
        if (s && !cancelled) { setSponsor(s); stashSponsorProfile(s); setLoading(false); return; }
      } catch { /* fall through */ }

      const cached = readCachedSponsor(sponsorId);
      if (cached && !cancelled) { setSponsor(cached); setLoading(false); return; }

      if (!cancelled) setError('This sponsor profile could not be loaded. Open it from Find sponsors.');
      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [sponsorId]);

  const handleStartChat = async () => {
    const userId = sponsor?.user?._id || sponsor?.user;
    if (!userId || !authUser) return;
    setStartingChat(true);
    try {
      await chatAPI.createDirectChat(String(userId));
      navigate('/chat');
    } catch { /* ignore */ } finally { setStartingChat(false); }
  };

  const user = sponsor?.user;
  const name = user?.name || 'Sponsor';
  const email = user?.email || '';
  const bio = user?.bio || '';
  const avatar = user?.profilePicture_url;
  const industries = Array.isArray(sponsor?.industries) ? sponsor.industries : [];
  const rating = fmt(sponsor?.rating);
  const revieweeUserId = String(user?._id || user || '');
  const isOwnProfile = authUser && String(authUser.id || authUser._id) === revieweeUserId;
  const canReview = !!authUser && authUser.role === 'creator' && !isOwnProfile;

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
        <Link to="/sponsors" className="inline-block px-5 py-2.5 bg-secondary-600 text-white rounded-xl font-semibold text-sm">
          Browse Sponsors
        </Link>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-secondary-600 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {/* ── Hero card ── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <div className="h-48 sm:h-56 bg-gradient-to-br from-secondary-600 via-primary-500 to-accent-500" />

          <div className="bg-white px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 mb-6">
              {/* Avatar / Logo */}
              <div className="shrink-0">
                {avatar ? (
                  <img src={avatar} alt=""
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl" />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white border-4 border-white shadow-xl
                    flex items-center justify-center">
                    <Building2 className="w-14 h-14 text-secondary-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-4 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 truncate">{name}</h1>
                  {user?.profileCompleted && (
                    <BadgeCheck size={22} className="text-secondary-500 shrink-0" title="Profile complete" />
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-3 flex items-center gap-1.5">
                  <Briefcase size={14} /> Sponsor
                </p>
                <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-1.5 w-fit">
                  <StarRow value={sponsor?.rating} />
                  <span className="text-sm font-bold text-gray-800 ml-1">{rating}</span>
                  <span className="text-xs text-gray-400">/ 5</span>
                </div>
              </div>

              {/* CTA */}
              {authUser && !isOwnProfile && (
                <button
                  id="sponsor-start-chat-btn"
                  onClick={handleStartChat}
                  disabled={startingChat}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-secondary-600 to-primary-600
                    text-white rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all
                    disabled:opacity-50 sm:self-end shrink-0"
                >
                  {startingChat ? <Spinner size="sm" /> : <MessageSquare size={16} />}
                  Message
                </button>
              )}
            </div>

            {bio && (
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base max-w-2xl border-t border-gray-100 pt-6 mt-4">
                {bio}
              </p>
            )}
            {email && <p className="text-xs text-gray-400 mt-3 break-all">{email}</p>}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left */}
          <div className="space-y-5">
            {industries.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Industries</h3>
                <div className="flex flex-wrap gap-2">
                  {industries.map((ind, i) => (
                    <span key={`${ind}-${i}`}
                      className="text-sm font-semibold px-3 py-1.5 rounded-xl bg-secondary-50 text-secondary-700 border border-secondary-100">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="font-bold text-gray-900">⭐ {rating}/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Industries</span>
                  <span className="font-bold text-gray-900">{industries.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2">
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

export default SponsorPublicProfilePage;
