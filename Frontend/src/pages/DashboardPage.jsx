import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Spinner, Badge } from '../components/common/UIComponents';
import { creatorAPI, sponsorAPI } from '../services/api';
import ReviewsSection from '../components/common/ReviewsSection';
import {
  Award, TrendingUp, Users, BadgeCheck, Link2, BarChart3,
  FolderOpen, MessageSquare, Bell, Clock, CheckCircle,
  XCircle, Hourglass, RefreshCw, ArrowRight, Star,
  Activity, Briefcase, ChevronRight,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v) => { const n = Number(v); return Number.isFinite(n) ? n.toFixed(1) : '0.0'; };
const fmtTime = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    working:   { cls: 'bg-primary-100 text-primary-700', icon: <Hourglass size={11} />, label: 'In Progress' },
    completed: { cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={11} />, label: 'Completed' },
    cancelled: { cls: 'bg-red-100 text-red-700', icon: <XCircle size={11} />, label: 'Cancelled' },
    pending:   { cls: 'bg-yellow-100 text-yellow-700', icon: <Hourglass size={11} />, label: 'Pending' },
    accepted:  { cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={11} />, label: 'Accepted' },
    rejected:  { cls: 'bg-red-100 text-red-700', icon: <XCircle size={11} />, label: 'Rejected' },
  };
  const { cls, icon, label } = cfg[status] || { cls: 'bg-gray-100 text-gray-600', icon: null, label: status };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${cls}`}>
      {icon} {label}
    </span>
  );
};

// ── Donut chart (pure CSS/SVG) ────────────────────────────────────────────────
const DonutChart = ({ segments, size = 80 }) => {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="14" />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circ;
        const gap = circ - dash;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circ}
            strokeLinecap="round"
            style={{ transform: `rotate(-90deg)`, transformOrigin: 'center', transition: 'stroke-dasharray 0.8s ease' }}
          />
        );
        offset += pct;
        return el;
      })}
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111827">
        {total}
      </text>
    </svg>
  );
};

// ── Mini bar chart (pure CSS) ─────────────────────────────────────────────────
const BarChart = ({ bars }) => {
  const MAX_H = 56; // px — max bar height
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div className="w-full">
      {/* Bar area — fixed height so bars never escape this box */}
      <div
        className="flex items-end gap-2"
        style={{ height: `${MAX_H}px` }}
      >
        {bars.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <div
              className="w-full rounded-t-md transition-all duration-700"
              style={{
                height: `${Math.max((b.value / max) * MAX_H, 3)}px`,
                background: b.color,
              }}
            />
          </div>
        ))}
      </div>
      {/* Labels row — always below bars, never overlapping */}
      <div className="flex gap-2 mt-1.5">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] text-gray-400 font-medium leading-tight block truncate">
              {b.label}
            </span>
            <span className="text-[10px] font-bold text-gray-700 block">
              {b.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, gradient, pulse }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-0.5 leading-tight">
        {value}
        {pulse && <span className="inline-block w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse" />}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Activity item ─────────────────────────────────────────────────────────────
const ActivityItem = ({ icon: Icon, iconColor, title, subtitle, time, badge }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
      <Icon size={14} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
    </div>
    <div className="flex flex-col items-end gap-1 shrink-0">
      {badge && <StatusBadge status={badge} />}
      <span className="text-[10px] text-gray-400">{time}</span>
    </div>
  </div>
);

// ── Project row ───────────────────────────────────────────────────────────────
const ProjectRow = ({ project }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
      ${project.status === 'working' ? 'bg-primary-100' : project.status === 'completed' ? 'bg-green-50' : 'bg-red-50'}`}>
      <FolderOpen size={16}
        className={project.status === 'working' ? 'text-primary-600' : project.status === 'completed' ? 'text-green-500' : 'text-error'} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">Project</p>
      <p className="text-xs text-gray-400">${project.payment ?? 0} · {fmtTime(project.updatedAt || project.createdAt)}</p>
    </div>
    <StatusBadge status={project.status} />
  </div>
);

// ── Main DashboardPage ────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const [dashData, setDashData] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [error, setError] = useState('');

  const role = dashData?.role || user?.role;
  const isCreator = role === 'creator';
  const profile = dashData?.creator || dashData?.sponsor || {};

  const fetchAll = useCallback(async () => {
    if (!user?.role) { setError('Please sign in again.'); return; }
    const api = user.role === 'creator' ? creatorAPI : sponsorAPI;

    // Parallel fetch — dashboard + activity
    setLoadingDash(true); setLoadingActivity(true); setError('');
    try {
      const [dashRes, actRes] = await Promise.allSettled([api.dashboard(), api.activity()]);

      if (dashRes.status === 'fulfilled') {
        setDashData(dashRes.value.data?.user || dashRes.value.data || null);
      } else {
        setError('Failed to load dashboard data.');
      }
      if (actRes.status === 'fulfilled') {
        setActivity(actRes.value.data || null);
      }
      // activity is optional — don't show error if it fails
    } finally {
      setLoadingDash(false);
      setLoadingActivity(false);
    }
  }, [user?.role]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loadingDash) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-400">Loading your dashboard…</p>
    </div>
  );

  if (error) return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-700 font-medium mb-3">{error}</p>
      <button onClick={fetchAll} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold">
        Try again
      </button>
    </div>
  );

  const stats = activity?.stats || {};
  const projects = activity?.projects || [];
  const sentRequests = activity?.sentRequests || [];
  const receivedRequests = activity?.receivedRequests || [];

  // Build activity feed (merge & sort by date)
  const feed = [
    ...sentRequests.slice(0, 5).map(r => ({
      type: 'sent',
      title: `Collab request sent`,
      subtitle: r.sponsorCampaignId?.title || r.creatorCampaignId?.title || 'Campaign',
      status: r.status,
      date: r.createdAt,
    })),
    ...receivedRequests.slice(0, 5).map(r => ({
      type: 'received',
      title: `New collab request received`,
      subtitle: r.sponsorCampaignId?.title || r.creatorCampaignId?.title || 'Your campaign',
      status: r.status,
      date: r.createdAt,
    })),
    ...projects.slice(0, 3).map(p => ({
      type: 'project',
      title: 'Project updated',
      subtitle: `$${p.payment ?? 0} · ${p.status}`,
      status: p.status,
      date: p.updatedAt || p.createdAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const revieweeUserId = String(
    dashData?.creator?.user?._id ||
    dashData?.sponsor?.user?._id ||
    user?.id || user?._id
  );

  return (
    <div className="space-y-6">

      {/* ── Welcome hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-7 md:p-10 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">
              {isCreator ? 'Creator' : 'Sponsor'} Dashboard
            </p>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              Welcome back, {dashData?.name || user?.name}! 👋
            </h1>
            <p className="text-white/70 mt-2 text-sm max-w-md">
              {isCreator
                ? 'Track your projects, collabs, and reviews all in one place.'
                : 'Manage your campaigns, collaborations, and creator partnerships.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/15 text-white border border-white/20 text-xs font-semibold px-3 py-1.5 rounded-xl capitalize">
              {role}
            </span>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border
              ${dashData?.profileCompleted
                ? 'bg-green-400/20 text-green-200 border-green-400/30'
                : 'bg-yellow-400/20 text-yellow-200 border-yellow-400/30'}`}>
              {dashData?.profileCompleted ? '✓ Profile complete' : '⚠ Profile incomplete'}
            </span>
          </div>
        </div>
        {/* Quick links */}
        <div className="relative z-10 mt-6 flex flex-wrap gap-2">
          <button onClick={() => navigate(isCreator ? '/sponsors' : '/creators')}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            {isCreator ? <Users size={14} /> : <Award size={14} />}
            {isCreator ? 'Find Sponsors' : 'Discover Creators'}
          </button>
          <button onClick={() => navigate('/campaigns')}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            <Briefcase size={14} /> Campaigns
          </button>
          <button onClick={() => navigate('/chat')}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            <MessageSquare size={14} /> Messages
          </button>
          <button onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
            <BadgeCheck size={14} /> Edit Profile
          </button>
        </div>
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-white/5 translate-y-1/2" />
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderOpen} label="Total Projects" value={stats.totalProjects ?? 0}
          sub={`${stats.workingProjects ?? 0} active`} gradient="from-primary-500 to-primary-600" pulse={!!stats.workingProjects} />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completedProjects ?? 0}
          sub="projects" gradient="from-green-500 to-green-600" />
        <StatCard icon={Bell} label="Pending Requests" value={(stats.pendingReceived ?? 0) + (stats.pendingSent ?? 0)}
          sub={`${stats.pendingReceived ?? 0} received`} gradient="from-orange-500 to-orange-600" pulse={!!(stats.pendingReceived)} />
        <StatCard icon={Star} label="Rating" value={`${fmt(profile?.rating)} ⭐`}
          sub="avg. from reviews" gradient="from-yellow-500 to-orange-500" />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Activity feed + Project tracker */}
        <div className="lg:col-span-2 space-y-6">

          {/* Activity feed */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Activity size={17} className="text-primary-500" /> Activity Feed
              </h2>
              <button onClick={fetchAll} disabled={loadingActivity}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                <RefreshCw size={14} className={loadingActivity ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="px-5 pb-3">
              {loadingActivity ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : feed.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Activity size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No recent activity yet</p>
                  <p className="text-xs mt-1">Start by creating a campaign or sending a collab request</p>
                </div>
              ) : (
                feed.map((item, i) => (
                  <ActivityItem key={i}
                    icon={
                      item.type === 'project' ? FolderOpen
                        : item.type === 'sent' ? ArrowRight
                        : Bell
                    }
                    iconColor={
                      item.type === 'project' ? 'bg-primary-500'
                        : item.type === 'sent' ? 'bg-primary-500'
                        : 'bg-orange-500'
                    }
                    title={item.title}
                    subtitle={item.subtitle}
                    time={fmtTime(item.date)}
                    badge={item.status}
                  />
                ))
              )}
            </div>
          </div>

          {/* Project tracker */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <FolderOpen size={17} className="text-primary-600" /> Projects
              </h2>
              <span className="text-xs text-gray-400">{projects.length} total</span>
            </div>
            <div className="p-3">
              {loadingActivity ? (
                <div className="flex justify-center py-6"><Spinner /></div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FolderOpen size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No projects yet</p>
                  <p className="text-xs mt-1">Accept a collab request to start your first project</p>
                </div>
              ) : (
                <div>
                  {projects.map((p, i) => <ProjectRow key={i} project={p} />)}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT: Analytics + Profile */}
        <div className="space-y-6">

          {/* Analytics chart */}
          {!loadingActivity && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-5">
                <BarChart3 size={17} className="text-secondary-500" /> Analytics
              </h2>

              {/* Donut */}
              <div className="flex items-center gap-4 mb-5">
                <DonutChart segments={[
                  { value: stats.workingProjects ?? 0, color: '#a77f60' },
                  { value: stats.completedProjects ?? 0, color: '#22c55e' },
                  { value: stats.cancelledProjects ?? 0, color: '#ef4444' },
                ]} size={90} />
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
                    <span className="text-gray-600">In Progress <span className="font-bold text-gray-900 ml-1">{stats.workingProjects ?? 0}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                    <span className="text-gray-600">Completed <span className="font-bold text-gray-900 ml-1">{stats.completedProjects ?? 0}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    <span className="text-gray-600">Cancelled <span className="font-bold text-gray-900 ml-1">{stats.cancelledProjects ?? 0}</span></span>
                  </div>
                </div>
              </div>

              {/* Request bar chart — separated from donut by a clear section */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Collab Requests</p>
                <BarChart bars={[
                  { value: stats.pendingReceived ?? 0, label: 'Incoming', color: '#f97316' },
                  { value: stats.pendingSent ?? 0, label: 'Sent', color: '#8a5f41' },
                  { value: stats.acceptedSent ?? 0, label: 'Accepted', color: '#22c55e' },
                  { value: stats.totalChats ?? 0, label: 'Chats', color: '#ccd67f' },
                ]} />
              </div>
            </div>
          )}

          {/* Profile snapshot */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-semibold text-gray-900 truncate ml-2">{dashData?.name || user?.name || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-semibold text-gray-900 truncate ml-2 text-xs">{dashData?.email || user?.email || '—'}</span>
              </div>
              {isCreator && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Followers</span>
                  <span className="font-semibold text-gray-900">{profile?.followersCount ?? 0}</span>
                </div>
              )}
              <div className="border-t border-gray-50 pt-3">
                <p className="text-xs text-gray-400 mb-2">{isCreator ? 'Niches' : 'Industries'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(isCreator ? profile?.niche : profile?.industries)?.slice(0, 6)?.map((tag, i) => (
                    <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                      {tag}
                    </span>
                  )) || <span className="text-xs text-gray-400">None added yet</span>}
                </div>
              </div>
              <button onClick={() => navigate('/profile')}
                className="w-full mt-2 py-2 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200
                  text-gray-700 hover:text-primary-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                <BadgeCheck size={13} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Recent collab requests received */}
          {receivedRequests.filter(r => r.status === 'pending').length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <h2 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                <Bell size={15} /> Pending Requests
              </h2>
              <div className="space-y-2">
                {receivedRequests.filter(r => r.status === 'pending').slice(0, 3).map((r, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 border border-orange-100">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {r.sponsorCampaignId?.title || r.creatorCampaignId?.title || 'Campaign request'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{fmtTime(r.createdAt)}</p>
                  </div>
                ))}
                <button onClick={() => navigate('/campaigns')}
                  className="w-full py-2 text-xs font-semibold text-orange-700 hover:underline flex items-center justify-center gap-1">
                  View all requests <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews Received ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <ReviewsSection
          revieweeUserId={revieweeUserId}
          revieweeName={dashData?.name || user?.name || 'You'}
          readOnly
        />
      </div>

    </div>
  );
};

export default DashboardPage;
