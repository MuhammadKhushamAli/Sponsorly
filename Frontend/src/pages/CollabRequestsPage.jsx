import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { collabAPI } from '../services/api';
import { Spinner, Badge, Button } from '../components/common/UIComponents';
import {
  setRequests,
  setLoading,
  setError,
  updateRequest,
  setProjectToast,
} from '../redux/slices/collabSlice';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Handshake,
  Mail,
  Star,
  FolderOpen,
  X,
} from 'lucide-react';

// ── Status badge helper ───────────────────────────────────────────────────────
const statusVariant = { pending: 'warning', accepted: 'success', rejected: 'error' };
const statusIcon = {
  pending: <Clock size={13} className="inline mr-1" />,
  accepted: <CheckCircle size={13} className="inline mr-1" />,
  rejected: <XCircle size={13} className="inline mr-1" />,
};

// ── Project Toast notification ────────────────────────────────────────────────
const ProjectToast = ({ toast, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 8000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[90vw] max-w-md
      bg-white border border-green-200 rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-slide-up">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shrink-0">
        <FolderOpen size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm">Project Created! 🎉</p>
        <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
          Collaboration on <span className="font-semibold text-gray-700">{toast.campaignTitle}</span> is now active.
          A project workspace and chat have been set up.
        </p>
      </div>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 shrink-0 p-0.5">
        <X size={16} />
      </button>
    </div>
  );
};

// ── Single request card ───────────────────────────────────────────────────────
const RequestCard = ({ request, role, onAccept, onReject, processing }) => {
  // creator requests on creator campaigns → sponsorId is populated
  // sponsor requests on sponsor campaigns → creatorId is populated
  const profile = role === 'creator' ? request.sponsorId : request.creatorId;
  const profileUser = profile?.user || {};
  const profileName = profileUser.name || 'Unknown';
  const profileEmail = profileUser.email || '';
  const profileRole = profileUser.role || (role === 'creator' ? 'sponsor' : 'creator');
  const isProcessing = processing === request._id;
  const isPending = request.status === 'pending';

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4
        ${isPending ? 'border-gray-200' : request.status === 'accepted' ? 'border-green-200 bg-green-50/30' : 'border-red-100 bg-red-50/20'}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        {/* Avatar + info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shrink-0 uppercase">
            {profileName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 leading-tight truncate">{profileName}</p>
            {profileEmail && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                <Mail size={11} /> {profileEmail}
              </p>
            )}
            <Badge variant="secondary" className="mt-1 capitalize text-[10px]">
              {profileRole}
            </Badge>
          </div>
        </div>

        {/* Status */}
        <Badge variant={statusVariant[request.status] || 'warning'} className="shrink-0 capitalize text-xs">
          {statusIcon[request.status]}
          {request.status}
        </Badge>
      </div>

      {/* Extra details */}
      {profile?.industries?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.industries.map((ind) => (
            <span key={ind} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100 font-medium">
              {ind}
            </span>
          ))}
        </div>
      )}
      {profile?.niche?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {profile.niche.map((n) => (
            <span key={n} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-100 font-medium">
              {n}
            </span>
          ))}
        </div>
      )}
      {profile?.rating != null && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          {Number(profile.rating).toFixed(1)} rating
        </p>
      )}

      {/* Action buttons — only when pending */}
      {isPending && (
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <Button
            id={`accept-request-${request._id}`}
            size="sm"
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[38px]"
            onClick={() => onAccept(request._id)}
            disabled={isProcessing}
          >
            {isProcessing ? <Spinner size="sm" /> : <CheckCircle size={15} />}
            Accept
          </Button>
          <Button
            id={`reject-request-${request._id}`}
            variant="outline"
            size="sm"
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[38px] text-error border-gray-300 hover:bg-red-50"
            onClick={() => onReject(request._id)}
            disabled={isProcessing}
          >
            {isProcessing ? <Spinner size="sm" /> : <XCircle size={15} />}
            Reject
          </Button>
        </div>
      )}

      {/* Accepted notice */}
      {request.status === 'accepted' && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 rounded-xl px-3 py-2 border border-green-200">
          <FolderOpen size={13} />
          Project workspace created — check your Messages for the project chat.
        </div>
      )}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
const CollabRequestsPage = () => {
  const dispatch = useDispatch();
  const { campaignId } = useParams();
  const { user } = useSelector((s) => s.auth);
  const { requests, isLoading, error, projectToast } = useSelector((s) => s.collabs);

  const role = user?.role; // 'creator' | 'sponsor'
  const isCreator = role === 'creator';

  const [processing, setProcessing] = useState(null); // requestId being mutated
  const [campaignTitle, setCampaignTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [banner, setBanner] = useState('');

  // ── Fetch requests for this campaign ────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    if (!campaignId) return;
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      // Creator owns the campaign → sponsor requests came in  (getSponsorRequests)
      // Sponsor owns the campaign → creator requests came in  (getCreatorRequests)
      const res = isCreator
        ? await collabAPI.getSponsorRequests(campaignId)
        : await collabAPI.getCreatorRequests(campaignId);

      const data = res.data;
      setCampaignTitle(data.campaign?.title || '');
      dispatch(setRequests(data.requests || []));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to load requests.'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [campaignId, isCreator, dispatch]);

  useEffect(() => {
    fetchRequests();
    return () => dispatch(setRequests([]));
  }, [fetchRequests, dispatch]);

  // ── Accept ───────────────────────────────────────────────────────────────────
  const handleAccept = async (requestId) => {
    setProcessing(requestId);
    try {
      // Creator accepts sponsor request  → acceptSponsorRequest
      // Sponsor accepts creator request  → acceptCreatorRequest
      const res = isCreator
        ? await collabAPI.acceptSponsorRequest(requestId)
        : await collabAPI.acceptCreatorRequest(requestId);

      const updatedReq = res.data?.request;
      if (updatedReq) dispatch(updateRequest(updatedReq));

      // Show project-created toast
      dispatch(setProjectToast({ projectId: res.data?.project?._id, campaignTitle }));
      setBanner('Collaboration accepted! A project has been created.');
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to accept request.'));
    } finally {
      setProcessing(null);
    }
  };

  // ── Reject ───────────────────────────────────────────────────────────────────
  const handleReject = async (requestId) => {
    setProcessing(requestId);
    try {
      const res = isCreator
        ? await collabAPI.rejectSponsorRequest(requestId)
        : await collabAPI.rejectCreatorRequest(requestId);

      const updatedReq = res.data?.request;
      if (updatedReq) dispatch(updateRequest(updatedReq));
      setBanner('Request rejected.');
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Failed to reject request.'));
    } finally {
      setProcessing(null);
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter((r) => r.status === filterStatus);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        to="/campaigns"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Campaigns
      </Link>

      {/* Header */}
      <div className="bg-gradient-brand text-white rounded-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Handshake size={18} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold">Collaboration Requests</h1>
            </div>
            {campaignTitle && (
              <p className="text-white/75 text-sm">
                Campaign: <span className="text-white font-semibold">{campaignTitle}</span>
              </p>
            )}
            <p className="text-white/65 text-xs mt-1">
              {isCreator
                ? 'Sponsors who want to collaborate on your campaign'
                : 'Creators who applied to your campaign'}
            </p>
          </div>
          <button
            id="refresh-requests-btn"
            onClick={fetchRequests}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Banner */}
      {banner && (
        <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 shadow-sm animate-fade-in">
          <span>{banner}</span>
          <button onClick={() => setBanner('')} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm w-full overflow-x-auto gap-1">
        {['all', 'pending', 'accepted', 'rejected'].map((s) => (
          <button
            key={s}
            id={`filter-${s}-btn`}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={`flex-1 min-w-[70px] min-h-[38px] rounded-lg py-1.5 px-2 text-xs font-semibold capitalize transition-colors whitespace-nowrap
              ${filterStatus === s ? 'bg-gradient-brand text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {s} {counts[s] > 0 && <span className="ml-0.5 opacity-70">({counts[s]})</span>}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <Users size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700">No {filterStatus === 'all' ? '' : filterStatus} requests</p>
          <p className="text-gray-400 text-sm mt-1">
            {filterStatus === 'pending'
              ? 'No pending requests at the moment.'
              : filterStatus === 'all'
              ? 'No collaboration requests for this campaign yet.'
              : `No ${filterStatus} requests.`}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((req) => (
            <RequestCard
              key={req._id}
              request={req}
              role={role}
              onAccept={handleAccept}
              onReject={handleReject}
              processing={processing}
            />
          ))}
        </div>
      )}

      {/* Global Project Toast (bottom-center) */}
      {projectToast && (
        <ProjectToast
          toast={projectToast}
          onDismiss={() => dispatch(setProjectToast(null))}
        />
      )}
    </div>
  );
};

export default CollabRequestsPage;
