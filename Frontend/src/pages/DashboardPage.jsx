import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Badge } from '../components/common/UIComponents';
import { creatorAPI, sponsorAPI } from '../services/api';
import { Award, TrendingUp, Users, BadgeCheck, Link2, BarChart3 } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.role) {
        setError('Unable to determine account role. Please sign in again.');
        return;
      }

      const api = user.role === 'creator' ? creatorAPI : sponsorAPI;
      const response = await api.dashboard();
      setDashboardData(response.data?.user || response.data || null);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const profile = dashboardData?.creator || dashboardData?.sponsor || {};
  const role = dashboardData?.role || user?.role;
  const isCreator = role === 'creator';
  const isSponsor = role === 'sponsor';

  const formatCount = (value) => {
    if (value === null || value === undefined) return 0;
    if (Array.isArray(value)) return value.length;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const formatRating = (value) => {
    if (value === null || value === undefined || value === '') return '0.0';
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0';
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  if (error) {
    return (
      <Card className="border border-red-200 bg-red-50 text-red-700">
        <p className="font-medium">{error}</p>
        <Button className="mt-4" onClick={fetchDashboard}>Try again</Button>
      </Card>
    );
  }

  const statsCards = [
    {
      icon: BadgeCheck,
      label: 'Profile Status',
      value: dashboardData?.profileCompleted ? 'Complete' : 'Incomplete',
      color: 'from-primary-500 to-secondary-500',
    },
    {
      icon: Users,
      label: isCreator ? 'Niches' : 'Industries',
      value: isCreator ? formatCount(profile?.niche) : formatCount(profile?.industries),
      color: 'from-accent-500 to-primary-500',
    },
    {
      icon: Link2,
      label: isCreator ? 'Links' : 'Bio length',
      value: isCreator ? formatCount(profile?.links) : (profile?.bio ? profile.bio.length : 0),
      color: 'from-secondary-500 to-accent-500',
    },
    {
      icon: TrendingUp,
      label: 'Rating',
      value: `${formatRating(profile?.rating)} ⭐`,
      color: 'from-primary-500 to-accent-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-brand text-white rounded-2xl p-8 md:p-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {dashboardData?.name || user?.name}! 👋</h1>
            <p className="text-white/80">
              {isCreator ? 'Your creator dashboard reflects your creator profile data.' : 'Your sponsor dashboard reflects your sponsor profile data.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {isCreator && (
              <Button
                variant="outline"
                className="bg-white/10 border-white/40 text-white hover:bg-white/20"
                onClick={() => navigate('/sponsors')}
              >
                Find sponsors
              </Button>
            )}
            {isSponsor && (
              <Button
                variant="outline"
                className="bg-white/10 border-white/40 text-white hover:bg-white/20"
                onClick={() => navigate('/creators')}
              >
                Discover creators
              </Button>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-white/15 text-white border-white/20">{role || 'account'}</Badge>
              <Badge variant="secondary" className="bg-white/15 text-white border-white/20">
                {dashboardData?.profileCompleted ? 'Profile complete' : 'Profile incomplete'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-xl transition-all">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} p-2 mb-4`}>
              <stat.icon className="w-full h-full text-white" />
            </div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Account Details */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="space-y-5">
          <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Name</p>
              <p>{dashboardData?.name || user?.name || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
              <p>{dashboardData?.email || user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Bio</p>
              <p>{dashboardData?.bio || profile?.bio || 'No bio added yet.'}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <h2 className="text-2xl font-bold text-gray-900">Role Data</h2>
          {isCreator ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Niches</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.niche?.length ? profile.niche.map((niche, index) => <Badge key={`${niche}-${index}`} variant="primary">{niche}</Badge>) : <p className="text-gray-600">No niches added yet.</p>}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Links</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.links?.length ? profile.links.map((link, index) => <Badge key={`${link}-${index}`} variant="secondary">{typeof link === 'string' ? link : `Link ${index + 1}`}</Badge>) : <p className="text-gray-600">No links added yet.</p>}
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-gray-600">Followers</span>
                <span className="font-bold text-gray-900">{profile?.followersCount ?? 0}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Industries</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.industries?.length ? profile.industries.map((industry, index) => <Badge key={`${industry}-${index}`} variant="primary">{industry}</Badge>) : <p className="text-gray-600">No industries added yet.</p>}
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-gray-600">Sponsor rating</span>
                <span className="font-bold text-gray-900">{formatRating(profile?.rating)} ⭐</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
