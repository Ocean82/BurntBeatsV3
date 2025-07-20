import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Music, Download, CheckCircle, Star, Flame, Crown, Zap } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  gradient: string;
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
    // Ensure DOM is loaded
    const setupDOM = () => {
      setIsVisible(true);

      // Add click listeners for debugging
      const buttons = document.querySelectorAll('button');
      console.log(`📊 Found ${buttons.length} buttons on landing page`);

      // Add breakpoint listeners for responsive design
      const handleResize = () => {
        console.log(`📱 Viewport: ${window.innerWidth}x${window.innerHeight}`);
      };

      window.addEventListener('resize', handleResize);
      handleResize(); // Initial log

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

    // Ensure DOM is ready and button interactions work
    if (typeof window !== 'undefined' && document.readyState === 'complete') {
      onGetStarted();
    } else {
      // Wait for DOM to be ready
      setTimeout(() => onGetStarted(), 100);
    }
  }, [onGetStarted]);

  const handlePricingClick = useCallback((tierName: string) => {
    console.log(`💰 Landing Page: ${tierName} pricing tier clicked`);
    if (onGetStarted) {
      console.log('🎯 Landing Page: Redirecting to app via onGetStarted');
      onGetStarted();
    } else {
      console.error('❌ Landing Page: onGetStarted function is not available');
    }
  }, [onGetStarted]);

  const pricingTiers: PricingTier[] = [
    {
      name: "Bonus Track",
      price: "$0.99",
      description: "Demo piece with watermark overlay (Low quality full track with audio watermark)",
      features: [
        "Full track with watermark",
        "Low quality audio",
        "Perfect for previews",
        "Instant download"
      ],
      icon: <Music className="w-6 h-6" />,
      gradient: "from-gray-500 to-gray-600"
    },
    {
      name: "Base Song",
      price: "$1.99",
      description: "Anything Generated Under 9MB (0MB-8.9MB 128bit)",
      features: [
        "128-bit quality",
        "Up to 9MB file size",
        "Commercial use allowed",
        "No watermark"
      ],
      icon: <Star className="w-6 h-6" />,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      name: "Premium Song",
      price: "$4.99",
      description: "Creations over 9MB (9MB-19.9MB 192bit)",
      features: [
        "192-bit high quality",
        "9MB - 19.9MB file size",
        "Enhanced audio clarity",
        "Professional grade"
      ],
      icon: <Flame className="w-6 h-6" />,
      popular: true,
      gradient: "from-orange-500 to-red-500"
    },
    {
      name: "Ultra Super Great Amazing Song",
      price: "$8.99",
      description: "Creations over 20MB (Wav)",
      features: [
        "Uncompressed WAV format",
        "Over 20MB file size",
        "Studio quality",
        "Maximum fidelity"
      ],
      icon: <Zap className="w-6 h-6" />,
      gradient: "from-purple-500 to-purple-600"
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
        <div className="container-center py-16 sm:py-20 lg:py-24">
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

            <button
                ref={mainButtonRef}
                onClick={handleGetStarted}
                type="button"
                aria-label="Start creating music with Burnt Beats"
                className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl font-bold py-4 px-8 rounded-xl shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 transition-all duration-300 hover:from-orange-400 hover:to-red-400 border-2 border-orange-400/30 cursor-pointer"
                style={{ 
                  pointerEvents: 'auto',
                  zIndex: 50,
                  position: 'relative'
                }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  Start Creating Now
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container-center py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
            Simple Pricing
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto px-4">
            Choose the quality that fits your needs. Download as many times as you want after purchase.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative card-gradient p-4 sm:p-6 text-center transition-all duration-300 hover:scale-105 hover:border-orange-500/50 ${
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

              <h3 className="text-lg sm:text-xl font-bold mb-2">{tier.name}</h3>
              <div className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-orange-300">{tier.price}</div>
              <p className="text-xs sm:text-sm text-white/70 mb-4 sm:mb-6 min-h-[3rem] px-2">{tier.description}</p>

              <button
                type="button"
                onClick={() => handlePricingClick(tier.name)}
                disabled={false}
                aria-label={`Choose ${tier.name} plan`}
                className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 bg-gradient-to-r ${tier.gradient} hover:shadow-lg cursor-pointer`}
                style={{ pointerEvents: 'auto', zIndex: 1000 }}
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                Download Now
              </button>
            </div>
          ))}
        </div>

        {/* Full License Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h3 className="text-2xl font-bold text-yellow-300">Full License</h3>
            </div>

            <div className="text-4xl font-bold mb-4 text-yellow-300">$10.00 USD</div>

            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Once purchased, this license grants you full ownership of your generated track. You have the exclusive right to use, distribute, modify, and monetize the music on any platform, including streaming services, social media, film, games, and commercial projects.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Full ownership rights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Commercial use allowed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No ongoing royalties</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Modify and redistribute</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-lg cursor-pointer"
              style={{ pointerEvents: 'auto', zIndex: 1000 }}
            >
              <Crown className="w-5 h-5 inline mr-2" />
              Get Full License
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Burnt Beats?</h2>
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
        <p className="text-xl text-white/70 mb-8">Join the revolution of AI-powered music creation</p>

        <button
          type="button"
          onClick={handleGetStarted}
          className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 hover:from-orange-600 hover:via-red-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 hover:shadow-lg cursor-pointer"
          style={{ pointerEvents: 'auto', zIndex: 1000 }}
        >
          Start Creating Now - It's Free!
        </button>

        <div className="mt-6 text-sm text-white/60">
          No credit card required • Instant access • Professional quality
        </div>
      </div>
    </div>
  );
};