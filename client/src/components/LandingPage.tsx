import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Music, Download, CheckCircle, Star, Flame, Crown, Zap, Play, Sparkles, ArrowRight, Users } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  gradient: string;
  buttonText: string;
}

interface LandingPageProps {
  onGetStarted?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup DOM and event listeners
  useEffect(() => {
    const setupDOM = () => {
      setIsVisible(true);
      const buttons = document.querySelectorAll('button');
      console.log(`📊 Found ${buttons.length} buttons on landing page`);

      const handleResize = () => {
        console.log(`📱 Viewport: ${window.innerWidth}x${window.innerHeight}`);
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    if (document.readyState === 'complete') {
      setupDOM();
    } else {
      window.addEventListener('load', setupDOM);
      return () => window.removeEventListener('load', setupDOM);
    }
  }, []);

  const handleGetStarted = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🚀 Landing Page handleGetStarted called');
    console.log('📍 Button clicked, DOM ready:', document.readyState);

    if (typeof window !== 'undefined' && document.readyState === 'complete') {
      onGetStarted?.();
    } else {
      setTimeout(() => onGetStarted?.(), 100);
    }
  }, [onGetStarted]);

  const handleSignInClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔐 Sign In button clicked');
    onGetStarted?.();
  }, [onGetStarted]);

  const handleRegisterClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📝 Register button clicked');
    onGetStarted?.();
  }, [onGetStarted]);

  const handlePricingClick = useCallback((tierName: string) => {
    console.log(`💰 Landing Page: ${tierName} pricing tier clicked`);
    onGetStarted?.();
  }, [onGetStarted]);

  const pricingTiers: PricingTier[] = [
    {
      name: "Demo Track",
      price: "$0.99",
      description: "Perfect for previewing your creations with watermark",
      features: [
        "Full track with watermark",
        "Low quality audio (128kbps)",
        "Perfect for social media previews",
        "Instant download"
      ],
      icon: <Music className="w-6 h-6" />,
      gradient: "from-gray-500 to-gray-600",
      buttonText: "Get Demo Track"
    },
    {
      name: "Standard Quality",
      price: "$1.99",
      description: "High-quality tracks under 9MB (128-bit)",
      features: [
        "128-bit quality audio",
        "Up to 9MB file size",
        "Commercial use allowed",
        "No watermark",
        "Royalty-free license"
      ],
      icon: <Star className="w-6 h-6" />,
      gradient: "from-blue-500 to-blue-600",
      buttonText: "Choose Standard"
    },
    {
      name: "Premium Quality",
      price: "$4.99",
      description: "Enhanced audio quality 9MB-20MB (192-bit)",
      features: [
        "192-bit high quality audio",
        "9MB - 20MB file size",
        "Enhanced audio clarity",
        "Professional grade quality",
        "Extended commercial rights"
      ],
      icon: <Flame className="w-6 h-6" />,
      popular: true,
      gradient: "from-orange-500 to-red-500",
      buttonText: "Go Premium"
    },
    {
      name: "Studio Master",
      price: "$8.99",
      description: "Uncompressed studio-quality WAV files over 20MB",
      features: [
        "Uncompressed WAV format",
        "Over 20MB file size",
        "Studio mastering quality",
        "Maximum audio fidelity",
        "Full distribution rights"
      ],
      icon: <Crown className="w-6 h-6" />,
      gradient: "from-purple-500 to-purple-600",
      buttonText: "Get Studio Master"
    }
  ];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)
        `
      }}
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-2xl shadow-orange-500/50 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">🔥</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-purple-400 bg-clip-text text-transparent">
                Burnt Beats
              </h1>
            </div>

            <p className="text-lg sm:text-xl md:text-2xl text-orange-300/80 mb-6 sm:mb-8 max-w-3xl mx-auto">
              AI-Powered Music Creation Platform
            </p>

            <p className="text-base sm:text-lg text-white/70 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
              Create unlimited music for free. Pay only when you download. No subscriptions, no hidden fees, just pure creativity.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 sm:px-6 py-2 sm:py-3 border border-orange-500/30">
                <span className="text-orange-300 font-semibold text-sm sm:text-base">✓ No Monthly Fees</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 sm:px-6 py-2 sm:py-3 border border-orange-500/30">
                <span className="text-orange-300 font-semibold text-sm sm:text-base">✓ Pay Per Download</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 sm:px-6 py-2 sm:py-3 border border-orange-500/30">
                <span className="text-orange-300 font-semibold text-sm sm:text-base">✓ Royalty Free</span>
              </div>
            </div>

            {/* Sign In / Register Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleSignInClick}
                type="button"
                aria-label="Sign in to your Burnt Beats account"
                className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-blue-500/30 cursor-pointer interactive-element flex items-center gap-2"
                style={{ 
                  pointerEvents: 'auto',
                  zIndex: 1000,
                  position: 'relative'
                }}
              >
                <Users className="w-5 h-5" />
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <span className="text-white/60 text-sm">or</span>

              <button
                onClick={handleRegisterClick}
                type="button"
                aria-label="Register for a new Burnt Beats account"
                className="group relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-orange-400/30 cursor-pointer interactive-element flex items-center gap-2"
                style={{ 
                  pointerEvents: 'auto',
                  zIndex: 1000,
                  position: 'relative'
                }}
              >
                <Sparkles className="w-5 h-5" />
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
            Choose Your Quality
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto px-4">
            Select the perfect audio quality for your needs. Create for free, pay only when you download.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6 text-center transition-all duration-300 hover:scale-105 hover:border-orange-500/50 hover:bg-white/10 ${
                tier.popular ? 'ring-2 ring-orange-500 shadow-2xl shadow-orange-500/20 lg:scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-lg bg-gradient-to-r ${tier.gradient} flex items-center justify-center`}>
                {tier.icon}
              </div>

              <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{tier.name}</h3>
              <div className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-orange-300">{tier.price}</div>
              <p className="text-xs sm:text-sm text-white/70 mb-4 sm:mb-6 min-h-[3rem] px-2">{tier.description}</p>

              <ul className="text-xs sm:text-sm text-white/80 mb-6 space-y-2 text-left">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePricingClick(tier.name);
                }}
                disabled={false}
                aria-label={`Choose ${tier.name} plan for ${tier.price}`}
                className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 bg-gradient-to-r ${tier.gradient} hover:shadow-lg cursor-pointer interactive-element hover:scale-105 text-white flex items-center justify-center gap-2`}
                style={{ pointerEvents: 'auto', zIndex: 1000 }}
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Full License Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h3 className="text-2xl font-bold text-yellow-300">Full Ownership License</h3>
            </div>

            <div className="text-4xl font-bold mb-4 text-yellow-300">$10.00 USD</div>

            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Get complete ownership of your generated track. Use, distribute, modify, and monetize on any platform including streaming services, social media, film, games, and commercial projects.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Full ownership rights</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Unlimited commercial use</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No ongoing royalties</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Modify and redistribute</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePricingClick('Full License');
              }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer interactive-element hover:scale-105 flex items-center gap-2 mx-auto"
              style={{ pointerEvents: 'auto', zIndex: 1000 }}
            >
              <Crown className="w-5 h-5" />
              Get Full License
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
            Why Choose Burnt Beats?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Music className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI-Powered Creation</h3>
            <p className="text-white/70">
              Generate professional-quality music with advanced AI technology. No musical experience required.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <Download className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Pay Per Download</h3>
            <p className="text-white/70">
              No subscriptions or hidden fees. Create unlimited music for free, pay only when you download.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Royalty Free</h3>
            <p className="text-white/70">
              Use your music anywhere without worrying about licensing. Full commercial rights included.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create Your First Beat?</h2>
        <p className="text-xl text-white/70 mb-8">Join thousands of creators making music with AI</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            type="button"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 hover:from-orange-600 hover:via-red-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 hover:shadow-lg cursor-pointer interactive-element hover:scale-105 flex items-center gap-2"
            style={{ pointerEvents: 'auto', zIndex: 1000 }}
          >
            <Play className="w-5 h-5" />
            Start Creating Now
          </button>
        </div>

        <div className="mt-6 text-sm text-white/60">
          No credit card required • Instant access • Professional quality
        </div>
      </div>
    </div>
  );
};