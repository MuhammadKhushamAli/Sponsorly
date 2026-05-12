import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Layout/Layout';
import { Button } from '../components/common/UIComponents';
import { creatorAPI } from '../services/api';
import { Sparkles, Shield, Users, TrendingUp, ArrowRight, Star, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('accessToken');

  const features = [
    {
      icon: Sparkles,
      title: 'Smart Matchmaking',
      description: 'Get matched with creators or sponsors based on your goals and audience alignment.',
      gradient: 'from-primary-600 to-primary-400',
      bg: 'bg-primary-50',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Track milestones and payouts with a transparent project timeline.',
      gradient: 'from-accent-600 to-accent-400',
      bg: 'bg-accent-50',
    },
    {
      icon: Users,
      title: 'Direct Communication',
      description: 'Built-in chat for seamless discussion about campaign scope and revisions.',
      gradient: 'from-secondary-600 to-primary-400',
      bg: 'bg-primary-50',
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description: 'Track campaign performance and engagement metrics in real-time.',
      gradient: 'from-primary-500 to-accent-500',
      bg: 'bg-accent-50',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Creators' },
    { value: '2K+',  label: 'Brands & Sponsors' },
    { value: '$50M+', label: 'Deals Completed' },
    { value: '98%',  label: 'Satisfaction Rate' },
  ];

  const testimonials = [
    {
      name: 'Sarah K.',
      role: 'Lifestyle Creator',
      text: 'Found my dream brand partner in 3 days. The matching algorithm is insane!',
      rating: 5,
    },
    {
      name: 'TechFlow Inc.',
      role: 'Sponsor',
      text: 'Reduced our creator search time by 70%. Absolute game-changer.',
      rating: 5,
    },
    {
      name: 'Marcus D.',
      role: 'Fitness Creator',
      text: 'The chat and collab tools make working with brands seamless.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f7' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Warm cream background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-200 via-primary-50 to-accent-50 opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent-200 opacity-20 blur-3xl translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-primary-300 opacity-20 blur-3xl -translate-x-1/3 translate-y-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 fade-in">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold border border-primary-200">
                ✦ The Collaboration Platform
              </span>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.1]">
                Connect with{' '}
                <span className="bg-gradient-brand bg-clip-text text-transparent">
                  Perfect Creators
                </span>{' '}
                &amp; Sponsors
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                The intelligent platform for creators and brands to discover, collaborate,
                and grow together. Smart matching, secure payments, and transparent communication.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="shadow-brand"
                  onClick={async () => {
                    try { await creatorAPI.getCreators(); } catch {}
                    navigate('/creators');
                  }}
                >
                  Explore Creators <ArrowRight size={18} />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                </Button>
              </div>
              {/* Social proof mini row */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  {['🧑','👩','🧔','👱'].map((e, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs">{e}</div>
                  ))}
                </div>
                <span><strong className="text-gray-800">12,000+</strong> creators already joined</span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative h-80 md:h-auto slide-up">
              <div className="absolute inset-0 bg-gradient-brand rounded-3xl opacity-10 blur-2xl scale-110" />
              <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-primary-100 space-y-4">
                {/* Mock collab card */}
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-2xl border border-primary-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-lg">✦</div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">New Collab Request</p>
                    <p className="text-xs text-gray-500">TechBrand → @creator</p>
                  </div>
                  <span className="ml-auto text-xs bg-accent-200 text-accent-700 font-bold px-2.5 py-1 rounded-full">+$2,500</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-accent-200 flex items-center justify-center text-accent-700 font-bold">A</div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Campaign: Summer Launch</p>
                    <p className="text-xs text-gray-500">In Progress · 3 milestones</p>
                  </div>
                  <span className="ml-auto flex">
                    {[1,2,3,4,5].map(s => <Star key={s} size={10} className="fill-yellow-400 text-yellow-400" />)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[['10K+','Creators'],['2K+','Brands'],['98%','Happy']].map(([v, l]) => (
                    <div key={l} className="text-center p-2 bg-primary-50 rounded-xl">
                      <p className="font-black text-primary-600 text-sm">{v}</p>
                      <p className="text-[10px] text-gray-500">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-2xl border border-green-100">
                  <CheckCircle size={16} className="text-green-600 shrink-0" />
                  <p className="text-xs font-semibold text-green-700">Collaboration accepted! Project started 🎉</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats banner ── */}
      <section className="bg-gradient-brand py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-black">{stat.value}</p>
                <p className="text-white/75 mt-1 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent-100 text-accent-700 text-xs font-bold rounded-full border border-accent-200 mb-4">
            Why Sponsorly
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            From discovery to payout — all in one warm, powerful platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group ${feature.bg} rounded-3xl p-8 border border-primary-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white text-center mb-12">Loved by Creators &amp; Brands</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-accent-300 text-accent-300" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-white/60 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-primary-200 via-accent-100 to-primary-50 py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-full mb-6">
            Start Today — Free
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Ready to Level Up Your Collaborations?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Join thousands of creators and brands already using Sponsorly to grow faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="shadow-brand" onClick={() => navigate('/signup')}>
              {isAuthenticated ? 'Go to Dashboard' : 'Start Your Journey'} <ArrowRight size={18} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/creators')}>
              Browse Creators
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">✦</div>
                <p className="text-lg font-black bg-gradient-brand bg-clip-text text-transparent">Sponsorly</p>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">Connecting creators and brands for meaningful collaborations.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-300">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2024 Sponsorly. All rights reserved.</p>
            <p className="text-gray-600 text-xs">Made with ♥ for creators and brands worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
