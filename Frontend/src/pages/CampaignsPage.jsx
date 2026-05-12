import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Spinner } from '../components/common/UIComponents';
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  RefreshCw,
  Handshake,
  Users,
} from 'lucide-react';
import { creatorCampaignAPI, sponsorCampaignAPI, collabAPI } from '../services/api';

const emptyForm = () => ({
  title: '',
  description: '',
  tags: [],
  ratePerHour: '',
  budget: '',
});

const extractCampaigns = (res) => {
  const d = res?.data;
  if (Array.isArray(d?.campaigns)) return d.campaigns;
  return [];
};

const formatMoney = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);
};

const isCreatorCampaignDoc = (c) =>
  c != null && c.creatorId != null && c.sponsorId == null;

const isSponsorCampaignDoc = (c) =>
  c != null && c.sponsorId != null && c.creatorId == null;

const isCreatorCampaignMine = (c, userId) => {
  const u = c?.creatorId?.user;
  const id = u?._id ?? u;
  return id != null && String(id) === String(userId);
};

const isSponsorCampaignMine = (c, userId) => {
  const u = c?.sponsorId?.user;
  const id = u?._id ?? u;
  return id != null && String(id) === String(userId);
};

/** Posted-by label for a card */
const cardOwnerLabel = (c, { tab, isCreatorRole }) => {
  if (tab === 'discover') {
    if (isCreatorRole) return isSponsorCampaignDoc(c) ? c?.sponsorId?.user?.name || 'Sponsor' : '—';
    return isCreatorCampaignDoc(c) ? c?.creatorId?.user?.name || 'Creator' : '—';
  }
  if (isCreatorRole) return c?.creatorId?.user?.name || 'You';
  return c?.sponsorId?.user?.name || 'You';
};

const cardPriceBadge = (c) => {
  if (isSponsorCampaignDoc(c)) {
    return { label: formatMoney(c.budget), sub: 'budget' };
  }
  if (isCreatorCampaignDoc(c)) {
    return { label: `${formatMoney(c.ratePerHour)}/hr`, sub: 'rate' };
  }
  return { label: '—', sub: '' };
};

const CampaignsPage = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const role = user?.role;
  const isCreator = role === 'creator';
  const isSponsor = role === 'sponsor';

  // Track per-campaign request status { [campaignId]: 'idle'|'loading'|'done'|'error' }
  const [requestStatus, setRequestStatus] = useState({});

  /** Own listings + CRUD */
  const myCampaignApi = isCreator ? creatorCampaignAPI : sponsorCampaignAPI;
  /** Cross-side discovery: creators browse sponsor campaigns; sponsors browse creator campaigns */
  const discoverCampaignApi = isCreator ? sponsorCampaignAPI : creatorCampaignAPI;

  const [tab, setTab] = useState('discover');
  const [discoverList, setDiscoverList] = useState([]);
  const [mineList, setMineList] = useState([]);
  const [loadingDiscover, setLoadingDiscover] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState('');

  const [filterTitle, setFilterTitle] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [filterTagInput, setFilterTagInput] = useState('');
  const [minRange, setMinRange] = useState('');
  const [maxRange, setMaxRange] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const formTagRef = useRef(null);

  /** Discover filters match the API of the campaign type being listed */
  const buildDiscoverParams = useCallback(() => {
    const params = {};
    const t = filterTitle.trim();
    if (t) params.title = t;
    if (filterTags.length) params.tags = filterTags.join(',');
    const min = minRange.trim();
    const max = maxRange.trim();
    if (isCreator) {
      if (min !== '') params.minBudget = min;
      if (max !== '') params.maxBudget = max;
    } else if (isSponsor) {
      if (min !== '') params.minRatePerHour = min;
      if (max !== '') params.maxRatePerHour = max;
    }
    return params;
  }, [filterTitle, filterTags, minRange, maxRange, isCreator, isSponsor]);

  const fetchDiscover = useCallback(
    async (paramsOverride) => {
      if (!isCreator && !isSponsor) return;
      setLoadingDiscover(true);
      setError('');
      try {
        const params =
          paramsOverride !== undefined ? paramsOverride : buildDiscoverParams();
        const res = await discoverCampaignApi.find(params);
        setDiscoverList(extractCampaigns(res));
      } catch (e) {
        console.error(e);
        setError(
          e.response?.data?.message ||
            'Could not load campaigns. Check filters (tag filter needs at least one tag).'
        );
        setDiscoverList([]);
      } finally {
        setLoadingDiscover(false);
      }
    },
    [buildDiscoverParams, discoverCampaignApi, isCreator, isSponsor]
  );

  const fetchMine = useCallback(async () => {
    if (!isCreator && !isSponsor) return;
    setLoadingMine(true);
    setError('');
    try {
      const res = await myCampaignApi.find({});
      const all = extractCampaigns(res);
      const mine = all.filter((c) =>
        isCreator
          ? isCreatorCampaignMine(c, user?.id)
          : isSponsorCampaignMine(c, user?.id)
      );
      setMineList(mine);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Could not load your campaigns.');
      setMineList([]);
    } finally {
      setLoadingMine(false);
    }
  }, [isCreator, isSponsor, myCampaignApi, user?.id]);

  useEffect(() => {
    if (!isCreator && !isSponsor) return;
    let cancelled = false;
    (async () => {
      setLoadingDiscover(true);
      setError('');
      try {
        const client = isCreator ? sponsorCampaignAPI : creatorCampaignAPI;
        const res = await client.find({});
        if (!cancelled) setDiscoverList(extractCampaigns(res));
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError(
            e.response?.data?.message || 'Could not load campaigns. Try again later.'
          );
          setDiscoverList([]);
        }
      } finally {
        if (!cancelled) setLoadingDiscover(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isCreator, isSponsor]);

  useEffect(() => {
    if (tab === 'mine' && (isCreator || isSponsor)) {
      fetchMine();
    }
  }, [tab, isCreator, isSponsor, fetchMine]);

  const addFilterTag = () => {
    const tag = String(filterTagInput).trim().toLowerCase();
    if (!tag) return;
    setFilterTags((prev) =>
      prev.includes(tag) ? prev : [...prev, tag].slice(0, 12)
    );
    setFilterTagInput('');
  };

  const removeFilterTag = (tag) => {
    setFilterTags((prev) => prev.filter((x) => x !== tag));
  };

  const resetFilters = () => {
    setFilterTitle('');
    setFilterTags([]);
    setFilterTagInput('');
    setMinRange('');
    setMaxRange('');
  };

  const openCreate = () => {
    setModalMode('create');
    setEditingId(null);
    setForm(emptyForm());
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setModalMode('edit');
    setEditingId(c._id);
    setForm({
      title: c.title || '',
      description: c.description || '',
      tags: Array.isArray(c.tags) ? [...c.tags] : [],
      ratePerHour: isCreator ? String(c.ratePerHour ?? '') : '',
      budget: isSponsor ? String(c.budget ?? '') : '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const addFormTag = () => {
    const raw = formTagRef.current?.value || '';
    const tag = String(raw).trim().toLowerCase();
    if (!tag) return;
    setForm((prev) =>
      prev.tags.includes(tag) ? prev : { ...prev, tags: [...prev.tags, tag] }
    );
    if (formTagRef.current) formTagRef.current.value = '';
  };

  const removeFormTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const validateForm = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.tags.length) return 'Add at least one tag.';
    if (isCreator) {
      const r = Number(form.ratePerHour);
      if (!form.ratePerHour || Number.isNaN(r) || r <= 0)
        return 'Rate per hour must be a positive number.';
    }
    if (isSponsor) {
      const b = Number(form.budget);
      if (!form.budget || Number.isNaN(b) || b <= 0)
        return 'Budget must be a positive number.';
    }
    return '';
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const v = validateForm();
    if (v) {
      setFormError(v);
      return;
    }
    setFormSaving(true);
    setFormError('');
    try {
      if (modalMode === 'create') {
        const body = {
          title: form.title.trim(),
          description: form.description.trim(),
          tags: form.tags,
          ...(isCreator
            ? { ratePerHour: Number(form.ratePerHour) }
            : { budget: Number(form.budget) }),
        };
        await myCampaignApi.create(body);
        setBanner('Campaign created.');
      } else if (editingId) {
        const body = {
          title: form.title.trim(),
          description: form.description.trim(),
          tags: form.tags,
          ...(isCreator
            ? { ratePerHour: Number(form.ratePerHour) }
            : { budget: Number(form.budget) }),
        };
        await myCampaignApi.update(editingId, body);
        setBanner('Campaign updated.');
      }
      setModalOpen(false);
      await fetchDiscover({});
      await fetchMine();
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Save failed. Please try again.'
      );
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign? This cannot be undone.')) return;
    setError('');
    try {
      await myCampaignApi.delete(id);
      setBanner('Campaign deleted.');
      await fetchDiscover({});
      await fetchMine();
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed.');
    }
  };

  const handleRequestCollab = async (campaignId) => {
    setRequestStatus((prev) => ({ ...prev, [campaignId]: 'loading' }));
    try {
      // Creator requests to join a sponsor campaign; Sponsor requests to join a creator campaign
      if (isCreator) {
        await collabAPI.creatorRequests(campaignId);
      } else {
        await collabAPI.sponsorRequests(campaignId);
      }
      setRequestStatus((prev) => ({ ...prev, [campaignId]: 'done' }));
      setBanner('Collaboration request sent! The campaign owner will review it.');
    } catch (e) {
      const msg = e.response?.data?.message || '';
      // Already requested — treat as soft-done
      if (msg.toLowerCase().includes('already')) {
        setRequestStatus((prev) => ({ ...prev, [campaignId]: 'done' }));
        setBanner('You have already sent a request for this campaign.');
      } else {
        setRequestStatus((prev) => ({ ...prev, [campaignId]: 'error' }));
        setError(msg || 'Failed to send collaboration request.');
      }
    }
  };

  const list = tab === 'discover' ? discoverList : mineList;
  const loading = tab === 'discover' ? loadingDiscover : loadingMine;

  if (!isCreator && !isSponsor) {
    return (
      <Card className="border border-gray-200">
        <p className="text-gray-700">
          Campaigns are available for creator and sponsor accounts. Switch role or sign in
          with the correct account.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-0 sm:px-0 -mx-1 sm:mx-0">
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className="inline-flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-md">
                <Megaphone size={20} className="sm:w-[22px] sm:h-[22px]" />
              </span>
              <span className="break-words">Campaigns</span>
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-xl leading-relaxed">
              {isCreator
                ? 'Discover sponsor campaigns (budgets). Manage your own creator campaigns (hourly rates).'
                : 'Discover creator campaigns (hourly rates). Manage your own sponsor campaigns (budgets).'}
            </p>
          </div>
          <Button
            size="lg"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 min-h-[44px]"
            onClick={openCreate}
          >
            <Plus size={20} /> New campaign
          </Button>
        </div>
      </div>

      {banner && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 text-gray-800 px-3 sm:px-4 py-3 text-sm font-medium flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="min-w-0 break-words">{banner}</span>
          <button
            type="button"
            className="text-gray-600 hover:text-gray-900 self-end sm:self-auto shrink-0 p-1"
            onClick={() => setBanner('')}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <p className="text-error text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-3 break-words">
          {error}
        </p>
      )}

      <div className="flex rounded-xl border border-gray-200 bg-white p-1 w-full shadow-sm">
        <button
          type="button"
          onClick={() => setTab('discover')}
          className={`flex-1 min-h-[44px] rounded-lg py-2.5 px-2 text-sm font-semibold transition-colors ${
            tab === 'discover'
              ? 'bg-gradient-brand text-white shadow'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Discover
        </button>
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={`flex-1 min-h-[44px] rounded-lg py-2.5 px-2 text-sm font-semibold transition-colors ${
            tab === 'mine'
              ? 'bg-gradient-brand text-white shadow'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          My campaigns
        </button>
      </div>

      {tab === 'discover' && (
        <Card className="space-y-4 sm:space-y-5 border border-gray-100 shadow-sm !p-4 sm:!p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
            <Search size={18} className="text-primary-600 shrink-0 sm:w-5 sm:h-5" />
            Search & filters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Title contains
              </label>
              <input
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
                placeholder="Search by title…"
                className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-base sm:text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Tags (optional — omit to show all)
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={filterTagInput}
                    onChange={(e) => setFilterTagInput(e.target.value)}
                    placeholder="e.g. ugc, tech — Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFilterTag();
                      }
                    }}
                    className="flex-1 min-h-[44px] min-w-0 px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-base sm:text-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addFilterTag}
                    className="w-full sm:w-auto shrink-0 min-h-[44px]"
                  >
                    Add tag
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {filterTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => removeFilterTag(t)}
                    className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-800 text-sm border border-primary-100 max-w-full truncate"
                  >
                    {t} ×
                  </button>
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {isCreator ? 'Min budget' : 'Min rate / hr'}
              </label>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={minRange}
                onChange={(e) => setMinRange(e.target.value)}
                className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-base sm:text-sm"
              />
            </div>
            <div className="min-w-0">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {isCreator ? 'Max budget' : 'Max rate / hr'}
              </label>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={maxRange}
                onChange={(e) => setMaxRange(e.target.value)}
                className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-base sm:text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
            <Button
              type="button"
              onClick={() => fetchDiscover(buildDiscoverParams())}
              className="inline-flex justify-center gap-2 w-full sm:flex-1 sm:w-auto min-h-[44px]"
            >
              <RefreshCw size={18} className="shrink-0" /> Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetFilters();
                fetchDiscover({});
              }}
              className="w-full sm:flex-1 sm:w-auto min-h-[44px]"
            >
              Reset
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16 sm:py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {list.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3 text-center py-10 sm:py-14 border border-dashed border-gray-200 !p-4 sm:!p-6">
              <p className="text-gray-600 text-sm sm:text-base">
                {tab === 'mine'
                  ? 'You have no campaigns yet. Create one with “New campaign”.'
                  : 'No campaigns match these filters.'}
              </p>
            </Card>
          )}

          {list.map((c) => {
            const price = cardPriceBadge(c);
            return (
              <Card
                key={c._id}
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col min-w-0 !p-4 sm:!p-6"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start gap-y-2 sm:gap-x-3 mb-3 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug break-words min-w-0 flex-1">
                    {c.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-xs self-start sm:self-auto whitespace-nowrap"
                  >
                    {price.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 sm:line-clamp-4 flex-1 mb-4 break-words">
                  {c.description || '—'}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(c.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 max-w-full truncate"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mb-1 break-words">
                  <span className="font-medium text-gray-600">
                    {tab === 'discover'
                      ? isCreator
                        ? 'Sponsor'
                        : 'Creator'
                      : isCreator
                        ? 'Creator'
                        : 'Sponsor'}
                    :
                  </span>{' '}
                  <span className="font-semibold text-gray-700">
                    {cardOwnerLabel(c, { tab, isCreatorRole: isCreator })}
                  </span>
                </p>
                {tab === 'discover' && (() => {
                  const status = requestStatus[c._id] || 'idle';
                  return (
                    <div className="pt-3 border-t border-gray-100 mt-auto">
                      <Button
                        id={`request-collab-${c._id}`}
                        type="button"
                        size="sm"
                        disabled={status === 'loading' || status === 'done'}
                        onClick={() => handleRequestCollab(c._id)}
                        className={`w-full inline-flex justify-center items-center gap-1.5 min-h-[44px] sm:min-h-[36px] transition-all
                          ${status === 'done' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {status === 'loading' ? (
                          <><Spinner size="sm" /> Sending…</>
                        ) : status === 'done' ? (
                          <><Handshake size={15} /> Requested</>  
                        ) : (
                          <><Handshake size={15} /> Request Collab</>
                        )}
                      </Button>
                    </div>
                  );
                })()}

                {tab === 'mine' && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100 mt-auto">
                    <Button
                      id={`view-requests-${c._id}`}
                      type="button"
                      size="sm"
                      className="flex-1 inline-flex justify-center items-center gap-1 min-h-[44px] sm:min-h-[36px]"
                      onClick={() => navigate(`/campaigns/${c._id}/requests`)}
                    >
                      <Users size={15} /> View Requests
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 inline-flex justify-center items-center gap-1 min-h-[44px] sm:min-h-[36px]"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil size={16} /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 text-error border-gray-300 hover:bg-gray-50 inline-flex justify-center items-center gap-1 min-h-[44px] sm:min-h-[36px]"
                      onClick={() => handleDelete(c._id)}
                    >
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="campaign-modal-title"
        >
          <Card className="w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 rounded-t-2xl sm:rounded-xl !p-4 sm:!p-8 sm:mx-0">
            <div className="flex justify-between items-start gap-3 mb-5 sm:mb-6 min-w-0">
              <h2
                id="campaign-modal-title"
                className="text-lg sm:text-xl font-bold text-gray-900 pr-2 break-words"
              >
                {modalMode === 'create'
                  ? isCreator
                    ? 'New creator campaign'
                    : 'New sponsor campaign'
                  : 'Edit campaign'}
              </h2>
              <button
                type="button"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-base sm:text-sm"
                />
              </div>

              {isCreator ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Rate per hour (USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={form.ratePerHour}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, ratePerHour: e.target.value }))
                    }
                    className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-base sm:text-sm"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    inputMode="numeric"
                    value={form.budget}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, budget: e.target.value }))
                    }
                    className="w-full min-h-[44px] px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-base sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full px-3 sm:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none text-base sm:text-sm min-h-[120px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Tags</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    ref={formTagRef}
                    type="text"
                    placeholder="Add tag — Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFormTag();
                      }
                    }}
                    className="flex-1 min-h-[44px] min-w-0 px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-base sm:text-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addFormTag}
                    className="w-full sm:w-auto min-h-[44px] sm:min-h-0"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((t) => (
                    <Badge key={t} className="inline-flex items-center gap-1 pl-3 pr-1 max-w-full">
                      <span className="truncate">{t}</span>
                      <button
                        type="button"
                        className="p-0.5 rounded hover:bg-black/10 shrink-0"
                        onClick={() => removeFormTag(t)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-sm text-error bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-words">
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                  onClick={() => setModalOpen(false)}
                  disabled={formSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 min-h-[44px]" disabled={formSaving}>
                  {formSaving ? 'Saving…' : modalMode === 'create' ? 'Create' : 'Save changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
