import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Badge, Spinner } from '../components/common/UIComponents';
import { creatorAPI, sponsorAPI } from '../services/api';
import { Camera, Star, BadgeCheck, Link2, Users, Edit2, X, Upload } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    niche: [],
    industries: [],
    followersCount: 0,
    profileImage: null,
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (profile) {
      const userRole = profile?.role || user?.role;
      const isCreator = userRole === 'creator';
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        niche: isCreator ? (profile.creator?.niche || []) : [],
        industries: !isCreator ? (profile.sponsor?.industries || []) : [],
        followersCount: isCreator ? (profile.creator?.followersCount || 0) : 0,
        profileImage: null,
      });
    }
  }, [profile]);

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

  const ratingValue = profile?.creator?.rating ?? profile?.sponsor?.rating ?? profile?.rating ?? 0;

  const formatRating = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0';
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    const userRole = profile?.role || user?.role;
    const isCreator = userRole === 'creator';
    setFormData({
      name: profile?.name || '',
      bio: profile?.bio || '',
      niche: isCreator ? (profile?.creator?.niche || []) : [],
      industries: !isCreator ? (profile?.sponsor?.industries || []) : [],
      followersCount: isCreator ? (profile?.creator?.followersCount || 0) : 0,
      profileImage: null,
    });
  };

  const handleAddTag = (tag, isNiche = true) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag) return;
    
    if (isNiche && !formData.niche.includes(trimmedTag)) {
      setFormData({ ...formData, niche: [...formData.niche, trimmedTag] });
    } else if (!isNiche && !formData.industries.includes(trimmedTag)) {
      setFormData({ ...formData, industries: [...formData.industries, trimmedTag] });
    }
  };

  const handleRemoveTag = (tag, isNiche = true) => {
    if (isNiche) {
      setFormData({ ...formData, niche: formData.niche.filter(n => n !== tag) });
    } else {
      setFormData({ ...formData, industries: formData.industries.filter(i => i !== tag) });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const api = role === 'creator' ? creatorAPI : sponsorAPI;
      
      const formDataToSend = new FormData();
      formDataToSend.append('bio', formData.bio);
      
      if (role === 'creator') {
        formDataToSend.append('niche', JSON.stringify(formData.niche));
        formDataToSend.append('followersCount', formData.followersCount);
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
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <Card className="border border-red-200 bg-red-50 text-red-700">
        <p className="font-medium">{error}</p>
        <Button className="mt-4" onClick={fetchProfile}>Try again</Button>
      </Card>
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '—';
  const displayBio = profile?.bio || 'No bio added yet';
  const creatorData = profile?.creator || {};
  const sponsorData = profile?.sponsor || {};

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="relative">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-40 rounded-t-3xl"></div>
        
        <Card className="relative -mt-20 rounded-3xl shadow-xl">
          {editMode ? (
            // Edit Mode
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Profile Picture Upload */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-dashed border-blue-300">
                  <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Upload size={18} className="text-blue-600" />
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.files?.[0] || null })}
                    className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                  />
                  {formData.profileImage && (
                    <p className="text-sm text-blue-600 mt-2">✓ Image selected: {formData.profileImage.name}</p>
                  )}
                </div>

                {/* Bio */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                    placeholder="Tell us about yourself"
                    rows="4"
                  />
                </div>

                {/* Creator-specific fields */}
                {role === 'creator' && (
                  <>
                    {/* Followers Count */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Followers Count</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.followersCount}
                        onChange={(e) => setFormData({ ...formData, followersCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="e.g., 5000"
                      />
                    </div>

                    {/* Niches */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Niches</label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Add a niche (e.g., tech, gaming)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTag(e.currentTarget.value, true);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => {
                            const input = event.target.previousElementSibling;
                            handleAddTag(input.value, true);
                            input.value = '';
                          }}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.niche.map((n) => (
                          <Badge key={n} className="bg-orange-200 text-orange-800 border-0 flex items-center gap-2 px-3 py-1">
                            {n}
                            <button onClick={() => handleRemoveTag(n, true)} className="ml-1 text-orange-600 hover:text-orange-900">
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Sponsor-specific fields */}
                {role === 'sponsor' && (
                  <>
                    {/* Industries */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Industries</label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Add an industry (e.g., tech, finance)"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTag(e.currentTarget.value, false);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => {
                            const input = event.target.previousElementSibling;
                            handleAddTag(input.value, false);
                            input.value = '';
                          }}
                          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-semibold"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.industries.map((ind) => (
                          <Badge key={ind} className="bg-indigo-200 text-indigo-800 border-0 flex items-center gap-2 px-3 py-1">
                            {ind}
                            <button onClick={() => handleRemoveTag(ind, false)} className="ml-1 text-indigo-600 hover:text-indigo-900">
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                  <span className="text-4xl sm:text-5xl">👤</span>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="text-center sm:text-left">
                      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {displayName}
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600 capitalize mt-2 font-semibold">
                        {role === 'creator' ? '✨ Content Creator' : '🏢 Sponsor'}
                      </p>
                    </div>
                    <button
                      onClick={handleEditClick}
                      className="mx-auto sm:mx-0 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
                    >
                      <Edit2 size={18} /> Edit
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <Badge variant="secondary" className="inline-flex items-center gap-2 px-3 py-1 text-sm">
                      <BadgeCheck size={16} className="text-purple-600" /> {profile?.profileCompleted ? 'Profile Complete' : 'Profile Incomplete'}
                    </Badge>
                    <Badge variant="secondary" className="inline-flex items-center gap-2 px-3 py-1 text-sm">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} /> {formatRating(ratingValue)} / 5
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-gray-700 leading-relaxed">{displayBio}</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* About & Details Section */}
      <div>
        <Card className="rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3"></div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded"></div>
              About You
            </h2>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-500">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-lg text-gray-900 font-semibold">{displayEmail}</p>
              </div>

              {/* Bio */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-500">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Bio</p>
                <p className="text-gray-800 leading-relaxed">{displayBio}</p>
              </div>

              {/* Creator-specific info */}
              {isCreator && (
                <>
                  {/* Niches */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-l-4 border-orange-500">
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Specializations (Niches)</p>
                    <div className="flex flex-wrap gap-2">
                      {creatorData?.niche?.length ? (
                        creatorData.niche.map((n, index) => (
                          <Badge key={`${n}-${index}`} className="bg-orange-200 text-orange-800 border-0 px-4 py-2 text-sm font-semibold">
                            #{n}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm italic">No niches added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Followers */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Followers</p>
                    <p className="text-3xl font-bold text-green-700">{creatorData?.followersCount ?? 0}</p>
                  </div>
                </>
              )}

              {/* Sponsor-specific info */}
              {isSponsor && (
                <>
                  {/* Industries */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-l-4 border-indigo-500">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Industries</p>
                    <div className="flex flex-wrap gap-2">
                      {sponsorData?.industries?.length ? (
                        sponsorData.industries.map((industry, index) => (
                          <Badge key={`${industry}-${index}`} className="bg-indigo-200 text-indigo-800 border-0 px-4 py-2 text-sm font-semibold">
                            #{industry}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm italic">No industries added yet</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Status */}
              <div className={`p-4 rounded-xl border-l-4 ${profile?.profileCompleted 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-500'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${profile?.profileCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                  Profile Status
                </p>
                <p className={`text-lg font-bold ${profile?.profileCompleted ? 'text-green-700' : 'text-orange-700'}`}>
                  {profile?.profileCompleted ? '✓ Complete' : '⚠ Incomplete'}
                </p>
              </div>

              {/* Rating */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-l-4 border-yellow-500">
                <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">Rating</p>
                <p className="text-3xl font-bold text-yellow-600">{formatRating(ratingValue)} ⭐</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
