import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Badge, Spinner } from '../components/common/UIComponents';
import { creatorAPI, sponsorAPI } from '../services/api';
import { Star, BadgeCheck, Edit2, X, Upload, Link2, Plus, Trash2 } from 'lucide-react';

const emptyLink = () => ({ platform: '', url: '' });

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const nicheInputRef = useRef(null);
  const industryInputRef = useRef(null);
  const [formData, setFormData] = useState({
    bio: '',
    niche: [],
    industries: [],
    followersCount: 0,
    links: [],
    profileImage: null,
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (!profile) return;
    const userRole = profile?.role || user?.role;
    const creator = userRole === 'creator';
    setFormData({
      bio: profile.bio || '',
      niche: creator ? [...(profile.creator?.niche || [])] : [],
      industries: !creator ? [...(profile.sponsor?.industries || [])] : [],
      followersCount: creator ? profile.creator?.followersCount ?? 0 : 0,
      links: creator
        ? (profile.creator?.links || []).map((l) => ({
            platform: l.platform || '',
            url: l.url || '',
          }))
        : [],
      profileImage: null,
    });
  }, [profile, user?.role]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user?.role) {
        setError('Unable to determine account role.');
        return;
      }

      const api = user.role === 'creator' ? creatorAPI : sponsorAPI;
      const response = await api.dashboard();
      setProfile(response.data?.user || response.data || null);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const role = profile?.role || user?.role;
  const isCreator = role === 'creator';
  const isSponsor = role === 'sponsor';

  const ratingValue =
    profile?.creator?.rating ?? profile?.sponsor?.rating ?? profile?.rating ?? 0;

  const formatRating = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0';
  };

  const resetFormFromProfile = () => {
    if (!profile) return;
    const userRole = profile?.role || user?.role;
    const creator = userRole === 'creator';
    setFormData({
      bio: profile.bio || '',
      niche: creator ? [...(profile.creator?.niche || [])] : [],
      industries: !creator ? [...(profile.sponsor?.industries || [])] : [],
      followersCount: creator ? profile.creator?.followersCount ?? 0 : 0,
      links: creator
        ? (profile.creator?.links || []).map((l) => ({
            platform: l.platform || '',
            url: l.url || '',
          }))
        : [],
      profileImage: null,
    });
  };

  const handleCancel = () => {
    setEditMode(false);
    setSaveError('');
    resetFormFromProfile();
  };

  const handleAddTag = (raw, isNiche) => {
    const trimmedTag = String(raw || '').trim().toLowerCase();
    if (!trimmedTag) return;

    setFormData((prev) => {
      if (isNiche) {
        if (prev.niche.includes(trimmedTag)) return prev;
        return { ...prev, niche: [...prev.niche, trimmedTag] };
      }
      if (prev.industries.includes(trimmedTag)) return prev;
      return { ...prev, industries: [...prev.industries, trimmedTag] };
    });
  };

  const handleRemoveTag = (tag, isNiche) => {
    setFormData((prev) =>
      isNiche
        ? { ...prev, niche: prev.niche.filter((n) => n !== tag) }
        : { ...prev, industries: prev.industries.filter((i) => i !== tag) }
    );
  };

  const addCreatorLinkRow = () => {
    setFormData((prev) => ({ ...prev, links: [...prev.links, emptyLink()] }));
  };

  const updateCreatorLink = (index, field, value) => {
    setFormData((prev) => {
      const links = prev.links.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      );
      return { ...prev, links };
    });
  };

  const removeCreatorLinkRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError('');
      const api = role === 'creator' ? creatorAPI : sponsorAPI;

      const formDataToSend = new FormData();
      formDataToSend.append('bio', formData.bio);

      if (role === 'creator') {
        formDataToSend.append('niche', JSON.stringify(formData.niche));
        formDataToSend.append('followersCount', String(formData.followersCount));
        const validLinks = formData.links
          .map((l) => ({
            platform: (l.platform || '').trim(),
            url: (l.url || '').trim(),
          }))
          .filter((l) => l.platform && l.url);
        if (validLinks.length > 0) {
          formDataToSend.append('links', JSON.stringify(validLinks));
        }
      } else {
        formDataToSend.append('industries', JSON.stringify(formData.industries));
      }

      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      await api.updateProfile(formDataToSend);
      setEditMode(false);
      await fetchProfile();
    } catch (err) {
      console.error('Failed to save profile:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to save profile. Please try again.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border border-gray-200 bg-gray-50 text-gray-900">
        <p className="font-medium text-error">{error}</p>
        <Button className="mt-4" onClick={fetchProfile}>
          Try again
        </Button>
      </Card>
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '—';
  const displayBio = profile?.bio?.trim() ? profile.bio : null;
  const creatorData = profile?.creator || {};
  const sponsorData = profile?.sponsor || {};
  const avatarUrl = profile?.profilePicture_url;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="relative">
        <div className="h-28 sm:h-32 rounded-t-xl bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />
        <Card className="relative -mt-14 sm:-mt-16 rounded-xl shadow-lg border border-gray-100 overflow-hidden !p-0">
          {editMode ? (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Edit profile</h2>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  aria-label="Close editor"
                >
                  <X size={22} />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                  <Upload size={16} className="text-primary-600" />
                  Profile photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profileImage: e.target.files?.[0] || null,
                    }))
                  }
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-medium"
                />
                {formData.profileImage && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {formData.profileImage.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none min-h-[120px]"
                  placeholder="Tell sponsors or creators about yourself"
                  rows={4}
                />
              </div>

              {role === 'creator' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Follower count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.followersCount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          followersCount: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Niches
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        ref={nicheInputRef}
                        type="text"
                        placeholder="e.g. tech, fitness"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag(nicheInputRef.current?.value, true);
                            if (nicheInputRef.current) nicheInputRef.current.value = '';
                          }
                        }}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          handleAddTag(nicheInputRef.current?.value, true);
                          if (nicheInputRef.current) nicheInputRef.current.value = '';
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.niche.map((n) => (
                        <Badge
                          key={n}
                          className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1"
                        >
                          {n}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(n, true)}
                            className="p-0.5 rounded hover:bg-black/10"
                            aria-label={`Remove ${n}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Link2 size={16} className="text-primary-600" />
                        Links (platform & URL)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCreatorLinkRow}
                        className="inline-flex items-center gap-1"
                      >
                        <Plus size={16} /> Add link
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Include at least one valid link when you want to update links on
                      your profile (required for a complete creator profile).
                    </p>
                    <div className="space-y-3">
                      {formData.links.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No links yet</p>
                      )}
                      {formData.links.map((row, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row gap-2 sm:items-center"
                        >
                          <input
                            type="text"
                            placeholder="Platform"
                            value={row.platform}
                            onChange={(e) =>
                              updateCreatorLink(index, 'platform', e.target.value)
                            }
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
                          />
                          <input
                            type="url"
                            placeholder="https://…"
                            value={row.url}
                            onChange={(e) =>
                              updateCreatorLink(index, 'url', e.target.value)
                            }
                            className="flex-[2] min-w-0 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeCreatorLinkRow(index)}
                            className="p-2 text-error hover:bg-gray-100 rounded-lg self-end sm:self-center"
                            aria-label="Remove link"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {role === 'sponsor' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Industries
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      ref={industryInputRef}
                      type="text"
                      placeholder="e.g. finance, retail"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(industryInputRef.current?.value, false);
                          if (industryInputRef.current)
                            industryInputRef.current.value = '';
                        }
                      }}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        handleAddTag(industryInputRef.current?.value, false);
                        if (industryInputRef.current)
                          industryInputRef.current.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.industries.map((ind) => (
                      <Badge
                        key={ind}
                        className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1"
                      >
                        {ind}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(ind, false)}
                          className="p-0.5 rounded hover:bg-black/10"
                          aria-label={`Remove ${ind}`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {saveError && (
                <p className="text-sm text-error bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  {saveError}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md bg-gray-100 flex-shrink-0 mx-auto sm:mx-0 overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-gray-400" aria-hidden>
                      👤
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {displayName}
                      </h1>
                      <p className="text-gray-600 mt-1 capitalize">
                        {isCreator ? 'Content creator' : isSponsor ? 'Sponsor' : role}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setSaveError('');
                        setEditMode(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 shrink-0 mx-auto sm:mx-0"
                    >
                      <Edit2 size={18} />
                      Edit profile
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-4">
                    <Badge
                      variant={profile?.profileCompleted ? 'success' : 'warning'}
                      className="inline-flex items-center gap-1.5"
                    >
                      <BadgeCheck size={14} />
                      {profile?.profileCompleted ? 'Profile complete' : 'Incomplete'}
                    </Badge>
                    <Badge variant="secondary" className="inline-flex items-center gap-1.5">
                      <Star className="text-yellow-500 fill-yellow-500" size={14} />
                      {formatRating(ratingValue)} / 5
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-6 text-left">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-gray-900 font-medium break-all">{displayEmail}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Bio
                  </p>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {displayBio || 'No bio yet — use Edit profile to add one.'}
                  </p>
                </div>

                {isCreator && (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Niches
                      </p>
                      {creatorData?.niche?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {creatorData.niche.map((n, index) => (
                            <Badge key={`${n}-${index}`}>{n}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">None added yet</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Followers
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {creatorData?.followersCount ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <Link2 size={14} />
                        Links
                      </p>
                      {creatorData?.links?.length ? (
                        <ul className="space-y-2">
                          {creatorData.links.map((link, index) => (
                            <li key={index}>
                              <span className="text-sm text-gray-600">
                                {link.platform || 'Link'}
                                {': '}
                              </span>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:underline break-all"
                              >
                                {link.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">None added yet</p>
                      )}
                    </div>
                  </>
                )}

                {isSponsor && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Industries
                    </p>
                    {sponsorData?.industries?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {sponsorData.industries.map((industry, index) => (
                          <Badge key={`${industry}-${index}`}>{industry}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">None added yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
