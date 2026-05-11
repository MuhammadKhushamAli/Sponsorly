import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Layout/Layout';
import { Button } from '../components/common/UIComponents';
import { Sparkles, Zap, Shield, Users, ArrowRight, TrendingUp } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: 'Smart Matchmaking',
      description: 'Get matched with creators or sponsors based on your goals and audience alignment.',
      color: 'from-primary-500 to-secondary-500',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Track milestones and payouts with a transparent project timeline.',
      color: 'from-accent-500 to-primary-500',
    },
    {
      icon: Users,
      title: 'Direct Communication',
      description: 'Built-in chat for seamless discussion about campaign scope and revisions.',
      color: 'from-secondary-500 to-accent-500',
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Track campaign performance and engagement metrics in real-time.',
      color: 'from-primary-500 to-accent-500',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Creators' },
    { value: '2K+', label: 'Brands & Sponsors' },
    { value: '$50M+', label: 'Deals Completed' },
    { value: '98%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Connect with <span className="bg-gradient-brand bg-clip-text text-transparent">Perfect Creators</span> & Sponsors
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              The intelligent platform for creators and brands to discover, collaborate, and grow together. Smart matching, secure payments, and transparent communication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
                className="flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight size={20} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Login to Account
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0 bg-gradient-brand rounded-3xl opacity-20 blur-3xl" />
            <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-8 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-gray-600 font-medium">Beautiful collaborations start here</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-brand py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="text-4xl md:text-5xl font-bold">{stat.value}</div>
                <div className="text-white/80 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Sponsorly?
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to succeed in influencer marketing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border border-gray-100"
            >
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-lg">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-brand py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Level Up Your Influencer Marketing?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of creators and brands already using Sponsorly
          </p>
          <Button
            size="lg"
            className="bg-white text-primary-600 hover:bg-gray-50 font-bold"
            onClick={() => navigate('/signup')}
          >
            Start Your Journey Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">Sponsorly</p>
              <p className="text-gray-400 mt-2">Connecting creators and brands.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Sponsorly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
