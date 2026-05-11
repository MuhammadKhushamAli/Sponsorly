import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Button, Input, Alert, Spinner } from '../../components/common/UIComponents';
import { authAPI } from '../../services/api';
import { setUser, setTokens, setError } from '../../redux/slices/authSlice';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlertMessage(null);
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      if (response.data) {
        dispatch(setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        }));
        dispatch(setUser(response.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
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
            Welcome Back
          </h1>
          <p className="text-gray-600">Login to your Sponsorly account</p>
        </div>

        {alertMessage && (
          <Alert
            type="error"
            message={alertMessage}
            onClose={() => setAlertMessage(null)}
            className="mb-6"
          />
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Login'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Sign Up
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
