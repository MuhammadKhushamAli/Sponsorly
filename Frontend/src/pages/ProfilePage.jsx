import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Input, Badge, Spinner } from '../components/common/UIComponents';
import { Edit, Camera, Star } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch profile data
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <Card className="relative overflow-hidden">
        <div className="h-32 bg-gradient-brand relative">
          <button className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
            <Camera size={20} className="text-primary-600" />
          </button>
        </div>

        <div className="px-8 pb-8 relative -mt-16">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-5xl">👤</span>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                  <p className="text-gray-600 capitalize">{user?.role}</p>
                </div>
                {profile?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    <span className="font-bold text-gray-900">{profile.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? 'secondary' : 'primary'}
                  className="flex items-center gap-2"
                >
                  <Edit size={16} /> {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Information */}
      {!isEditing ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* About Section */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Email</p>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Bio</p>
                <p className="text-gray-900">{profile?.bio || 'No bio added yet'}</p>
              </div>
              {user?.role === 'creator' && profile?.niche && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Niches</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.niche.map((n) => (
                      <Badge key={n} variant="primary">{n}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Stats Section */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                <p className="text-3xl font-bold text-primary-600">{profile?.activeProjects || 0}</p>
              </div>
              <div className="border-b pb-4">
                <p className="text-sm text-gray-600 mb-1">Completed Projects</p>
                <p className="text-3xl font-bold text-accent-600">{profile?.completedProjects || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Reviews Received</p>
                <p className="text-3xl font-bold text-secondary-600">{profile?.reviews?.length || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Edit Form */
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
          <form className="space-y-4">
            <Input label="Full Name" defaultValue={user?.name} />
            <Input label="Bio" placeholder="Tell us about yourself" />
            <div className="flex gap-4 pt-4">
              <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Reviews Section */}
      {profile?.reviews && profile.reviews.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
          <div className="space-y-4">
            {profile.reviews.map((review) => (
              <div key={review._id} className="border-l-4 border-primary-500 pl-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">{review.reviewerName}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
