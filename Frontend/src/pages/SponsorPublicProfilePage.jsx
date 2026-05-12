import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Layout/Layout';
import { Card, Button, Badge, Spinner } from '../components/common/UIComponents';
import { sponsorAPI } from '../services/api';
import { ArrowLeft, Star, Building2 } from 'lucide-react';
import { readCachedSponsor, stashSponsorProfile } from '../utils/publicProfileCache';

const formatRating = (value) => {
  if (value === null || value === undefined || value === '') return '0.0';
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0';
};

const SponsorPublicProfilePage = () => {
  const { sponsorId } = useParams();
  const navigate = useNavigate();
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sponsorId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setSponsor(null);
      setLoading(true);
      setError('');
      try {
        const { data } = await sponsorAPI.getById(sponsorId);
        const s = data?.sponsor;
        if (s && !cancelled) {
          setSponsor(s);
          stashSponsorProfile(s);
          setLoading(false);
          return;
        }
      } catch {
        /* fall through */
      }

      const cached = readCachedSponsor(sponsorId);
      if (cached && !cancelled) {
        setSponsor(cached);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setError(
          'This sponsor profile could not be loaded. Open it from Find sponsors, or sign in again.'
        );
      }
      if (!cancelled) setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [sponsorId]);

  const user = sponsor?.user;
  const name = user?.name || 'Sponsor';
  const email = user?.email || '';
  const bio = user?.bio || '';
  const avatar = user?.profilePicture_url;
  const industries = Array.isArray(sponsor?.industries) ? sponsor.industries : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="inline-flex gap-2">
            <ArrowLeft size={16} /> Back
          </Button>
          <Link to="/sponsors">
            <Button variant="ghost" size="sm">
              Find sponsors
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
            <Link to="/sponsors" className="inline-block mt-4">
              <Button>Go to Find sponsors</Button>
            </Link>
          </Card>
        )}

        {!loading && !error && sponsor && (
          <div className="space-y-6">
            <div className="relative">
              <div className="h-24 rounded-t-xl bg-gradient-to-r from-secondary-500 via-primary-500 to-accent-500" />
              <Card className="relative -mt-12 rounded-xl shadow-lg border border-gray-100 !p-6 sm:!p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md bg-gray-100 overflow-hidden flex-shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
                    <p className="text-gray-600 mt-1">Sponsor</p>
                    <Badge variant="secondary" className="inline-flex items-center gap-1 mt-3">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      {formatRating(sponsor.rating)} / 5
                    </Badge>
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
                      Industries
                    </p>
                    {industries.length ? (
                      <div className="flex flex-wrap gap-2">
                        {industries.map((ind, i) => (
                          <Badge key={`${ind}-${i}`}>{ind}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">None listed</p>
                    )}
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

export default SponsorPublicProfilePage;
