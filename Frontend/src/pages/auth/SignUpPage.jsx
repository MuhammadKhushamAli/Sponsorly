import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Button, Input, Alert, Spinner } from '../../components/common/UIComponents';
import { authAPI } from '../../services/api';
import { setUser, setTokens, setError } from '../../redux/slices/authSlice';

const SignUpPage = () => {
  const [role, setRole] = useState('creator');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    niche: [],
    industries: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlertMessage(null);
    setLoading(true);

    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        ...(role === 'creator' && { niche: ['General'] }),
        ...(role === 'sponsor' && { industries: ['General'] }),
      };

      const response = await authAPI.signup(signupData);
      if (response.data) {
        dispatch(setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        }));
        dispatch(setUser(response.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Sign up failed';
      setAlertMessage(message);
      dispatch(setError(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-800"
            aria-label="Go back"
          >
            ← Back
          </button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent mb-2">
            Join Sponsorly
          </h1>
          <p className="text-gray-600">Create your account and start collaborating</p>
        </div>

        {alertMessage && (
          <Alert
            type="error"
            message={alertMessage}
            onClose={() => setAlertMessage(null)}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Role Selection */}
          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="creator"
                checked={role === 'creator'}
                onChange={(e) => setRole(e.target.value)}
                className="w-4 h-4"
              />
              <span className="font-medium">Creator</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="sponsor"
                checked={role === 'sponsor'}
                onChange={(e) => setRole(e.target.value)}
                className="w-4 h-4"
              />
              <span className="font-medium">Sponsor</span>
            </label>
          </div>

          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Login
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SignUpPage;
