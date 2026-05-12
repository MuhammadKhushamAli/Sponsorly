import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from '../components/Layout/Layout';
import { Card, Button, Badge, Spinner } from '../components/common/UIComponents';
import { creatorAPI } from '../services/api';
import { ArrowLeft, Link2, Star, BadgeCheck } from 'lucide-react';
import { readCachedCreator, stashCreatorProfile } from '../utils/publicProfileCache';
import ReviewsSection from '../components/common/ReviewsSection';

const formatRating = (value) => {
  if (value === null || value === undefined || value === '') return '0.0';
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0';
};

const CreatorPublicProfilePage = () => {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((s) => s.auth);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!creatorId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setCreator(null);
      setLoading(true);
      setError('');
      try {
        const { data } = await creatorAPI.getById(creatorId);
        const c = data?.creator;
        if (c && !cancelled) {
          setCreator(c);
          stashCreatorProfile(c);
          setLoading(false);
          return;
        }
      } catch {
        /* fall through */
      }

      const cached = readCachedCreator(creatorId);
      if (cached && !cancelled) {
        setCreator(cached);
        setLoading(false);
        return;
      }

      try {
        const res = await creatorAPI.getCreators({});
        const list = res.data?.creators || [];
        const found = list.find((c) => String(c._id) === String(creatorId));
        if (!cancelled) {
          if (found) {
            setCreator(found);
            stashCreatorProfile(found);
          } else {
            setError(
              'This creator profile could not be loaded. Open it from Discover creators, or check the link.'
            );
          }
        }
      } catch {
        if (!cancelled) {
          setError('Could not load this profile. Please try again later.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [creatorId]);

  const user = creator?.user;
  const name = user?.name || 'Creator';
  const email = user?.email || '';
  const bio = user?.bio || creator?.bio || '';
  const avatar = user?.profilePicture_url;
  const niches = Array.isArray(creator?.niche) ? creator.niche : [];
  const links = Array.isArray(creator?.links) ? creator.links : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="inline-flex gap-2">
            <ArrowLeft size={16} /> Back
          </Button>
          <Link to="/creators">
            <Button variant="ghost" size="sm">
              Discover creators
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && error && (
          <Card className="border border-gray-200 bg-gray-50">
            <p className="text-error font-medium">{error}</p>
            <Link to="/creators" className="inline-block mt-4">
              <Button>Go to Discover creators</Button>
            </Link>
          </Card>
        )}

        {!loading && !error && creator && (
          <div className="space-y-6">
            <div className="relative">
              <div className="h-24 rounded-t-xl bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />
              <Card className="relative -mt-12 rounded-xl shadow-lg border border-gray-100 !p-6 sm:!p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md bg-gray-100 overflow-hidden flex-shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-gray-400">👤</span>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
                    <p className="text-gray-600 mt-1">Content creator</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                      <Badge variant="secondary" className="inline-flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        {formatRating(creator.rating)} / 5
                      </Badge>
                      {user?.profileCompleted !== undefined && (
                        <Badge
                          variant={user.profileCompleted ? 'success' : 'warning'}
                          className="inline-flex items-center gap-1"
                        >
                          <BadgeCheck size={14} />
                          {user.profileCompleted ? 'Profile complete' : 'Profile incomplete'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-6 border-t border-gray-100 pt-8">
                  {email ? (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Email
                      </p>
                      <p className="text-gray-900 font-medium break-all">{email}</p>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Bio
                    </p>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {bio || 'No bio provided.'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Niches
                    </p>
                    {niches.length ? (
                      <div className="flex flex-wrap gap-2">
                        {niches.map((n, i) => (
                          <Badge key={`${n}-${i}`}>{n}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">None listed</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Followers
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {creator.followersCount ?? 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <Link2 size={14} />
                      Links
                    </p>
                    {links.length ? (
                      <ul className="space-y-2">
                        {links.map((link, i) => (
                          <li key={i}>
                            <span className="text-sm text-gray-600">
                              {(link.platform || 'Link') + ': '}
                            </span>
                            {link.url ? (
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:underline break-all"
                              >
                                {link.url}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500">—</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">None listed</p>
                    )}
                  </div>
                  {/* ── Reviews Section ── */}
                  <div className="border-t border-gray-100 pt-6">
                    <ReviewsSection
                      revieweeUserId={String(creator?.user?._id || creator?.user)}
                      revieweeName={name}
                      canReview={
                        !!authUser &&
                        authUser.role === 'sponsor' &&
                        String(authUser.id || authUser._id) !== String(creator?.user?._id || creator?.user)
                      }
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatorPublicProfilePage;
