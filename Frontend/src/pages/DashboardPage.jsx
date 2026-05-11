import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Spinner, Badge } from '../components/common/UIComponents';
import { creatorAPI, sponsorAPI } from '../services/api';
import { Award, TrendingUp, Users, MessageSquare } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useSelector(state => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const api = user?.role === 'creator' ? creatorAPI : sponsorAPI;
      const response = await api.dashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  const statsCards = [
    {
      icon: Award,
      label: 'Active Campaigns',
      value: dashboardData?.campaigns?.length || 0,
      color: 'from-primary-500 to-secondary-500',
    },
    {
      icon: Users,
      label: 'Collaborations',
      value: dashboardData?.collaborations?.length || 0,
      color: 'from-accent-500 to-primary-500',
    },
    {
      icon: MessageSquare,
      label: 'Active Chats',
      value: dashboardData?.chats?.length || 0,
      color: 'from-secondary-500 to-accent-500',
    },
    {
      icon: TrendingUp,
      label: 'Total Rating',
      value: dashboardData?.rating ? `${dashboardData.rating.toFixed(1)} ⭐` : '—',
      color: 'from-primary-500 to-accent-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-brand text-white rounded-2xl p-8 md:p-12">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-white/80">Here's what's happening with your account today</p>
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

      {/* Recent Activity */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {dashboardData?.recentActivity?.length > 0 ? (
            dashboardData.recentActivity.map((activity, index) => (
              <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.timestamp}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No recent activity yet</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
