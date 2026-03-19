import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

interface LandingPageProps {
  onGetStarted: () => void;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Project Management',
      description: 'Track multiple construction sites with real-time progress updates and milestone tracking.'
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Financial Control',
      description: 'Manage budgets, track expenses, and process contractor payouts with complete transparency.'
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Team Collaboration',
      description: 'Assign tasks to engineers, track work progress, and ensure seamless communication.'
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: 'Material Tracking',
      description: 'Request materials, manage inventory, and track stock levels across all projects.'
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Role-Based Access',
      description: 'Secure access control for admins, managers, engineers, and finance teams.'
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards with insights into project health, spending, and performance.'
    }
  ];

  const stats = [
    { value: 500, suffix: 'M+', label: 'Budget Managed (IQD)' },
    { value: 150, suffix: '+', label: 'Projects Completed' },
    { value: 50, suffix: '+', label: 'Active Engineers' },
    { value: 99, suffix: '%', label: 'Client Satisfaction' }
  ];

  const testimonials = [
    {
      quote: "Bunyan has transformed how we manage our construction projects. The real-time tracking and financial controls have saved us countless hours.",
      author: "Ahmed Al-Rashid",
      role: "Project Director, Al-Noor Construction"
    },
    {
      quote: "The material request system is incredibly efficient. Our stock management has never been this organized.",
      author: "Fatima Hassan",
      role: "Operations Manager, BuildIraq Co."
    },
    {
      quote: "Finally, a platform that understands the complexity of construction management in our region. Highly recommended.",
      author: "Mohammed Karim",
      role: "CEO, Karim Engineering Group"
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0
      }}>
        <motion.div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '50vw',
            height: '50vw',
            background: 'radial-gradient(circle, rgba(5, 150, 105, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            y: y1
          }}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '40vw',
            height: '40vw',
            background: 'radial-gradient(circle, rgba(5, 150, 105, 0.06) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <motion.div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            whileHover={{ scale: 1.02 }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em'
            }}>
              Bunyan
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem',
          }}
          className="desktop-nav"
          >
            {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  transition: 'color 0.2s ease'
                }}
                whileHover={{ color: 'var(--brand-primary)' }}
              >
                {item}
              </motion.a>
            ))}
            <motion.button
              onClick={onGetStarted}
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '0.625rem 1.5rem' }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '70px',
              left: 0,
              right: 0,
              background: 'white',
              zIndex: 99,
              padding: '1rem',
              borderBottom: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => { onGetStarted(); setIsMenuOpen(false); }}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8rem 2rem 4rem',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          style={{ 
            maxWidth: '1000px', 
            textAlign: 'center',
            opacity
          }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--bg-mint)',
              borderRadius: 'var(--radius-full)',
              marginBottom: '2rem'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              background: 'var(--brand-primary)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: 'var(--brand-primary-dark)' 
            }}>
              Trusted by 50+ construction companies
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={fadeInUp}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem'
            }}
          >
            Build Smarter.{' '}
            <span style={{ 
              background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Manage Better.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.7
            }}
          >
            The complete construction management platform for engineering teams. 
            Track projects, manage finances, and coordinate teams all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <motion.button
              onClick={onGetStarted}
              className="btn btn-primary"
              whileHover={{ scale: 1.05, boxShadow: 'var(--shadow-glow)' }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                padding: '1rem 2.5rem',
                fontSize: '1.0625rem'
              }}
            >
              Start Free Trial
            </motion.button>
            <motion.button
              className="btn btn-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                padding: '1rem 2.5rem',
                fontSize: '1.0625rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Hero Image/Dashboard Preview */}
          <motion.div
            variants={fadeInUp}
            style={{
              marginTop: '4rem',
              perspective: '1000px'
            }}
          >
            <motion.div
              whileHover={{ rotateX: 0, rotateY: 0, scale: 1.02 }}
              initial={{ rotateX: 5, rotateY: -5 }}
              style={{
                background: 'white',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.15), 0 30px 60px -30px rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Mock Dashboard */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '200px 1fr',
                minHeight: '400px',
                background: 'var(--bg-secondary)'
              }}>
                {/* Mock Sidebar */}
                <div style={{ 
                  background: 'linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%)',
                  padding: '1.5rem 1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }} />
                    <span style={{ color: 'white', fontWeight: 600 }}>Bunyan</span>
                  </div>
                  {['Dashboard', 'Projects', 'Tasks', 'Finances', 'Materials'].map((item, i) => (
                    <div 
                      key={item}
                      style={{ 
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: i === 0 ? 'rgba(255,255,255,0.15)' : 'transparent',
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '0.875rem',
                        marginBottom: '0.25rem'
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                {/* Mock Content */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                      { label: 'Total Budget', value: '450M IQD' },
                      { label: 'Active Projects', value: '12' },
                      { label: 'Completion', value: '78%' }
                    ].map((stat) => (
                      <div key={stat.label} style={{ 
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border)'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ 
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    padding: '1rem',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.5rem'
                  }}>
                    {[40, 65, 55, 80, 70, 85, 60, 75].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                        style={{ 
                          flex: 1,
                          background: i === 5 ? 'var(--brand-primary)' : 'var(--bg-mint)',
                          borderRadius: '4px 4px 0 0'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'var(--bg-secondary)',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              style={{ padding: '1.5rem' }}
            >
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                color: 'var(--brand-primary)',
                marginBottom: '0.5rem'
              }}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                fontWeight: 500
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '6rem 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <motion.h2
              variants={fadeInUp}
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}
            >
              Everything you need to{' '}
              <span style={{ color: 'var(--brand-primary)' }}>build success</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              style={{
                fontSize: '1.125rem',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              Powerful features designed specifically for construction management teams.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -8, boxShadow: 'var(--shadow-lg)' }}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'var(--bg-mint)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)',
                  marginBottom: '1.25rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <motion.h2
              variants={fadeInUp}
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}
            >
              Loved by construction teams
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} width="20" height="20" fill="#f59e0b" viewBox="0 0 24 24" style={{ marginRight: '2px' }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                  fontStyle: 'italic'
                }}>
                  "{testimonial.quote}"
                </p>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {testimonial.author}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '6rem 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%)',
            padding: '4rem 3rem',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <motion.h2
            variants={fadeInUp}
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1rem'
            }}
          >
            Ready to transform your construction management?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            style={{
              fontSize: '1.125rem',
              color: 'rgba(255, 255, 255, 0.85)',
              marginBottom: '2rem',
              maxWidth: '500px',
              margin: '0 auto 2rem'
            }}
          >
            Join hundreds of engineering teams already using Bunyan to build smarter.
          </motion.p>
          <motion.button
            variants={fadeInUp}
            onClick={onGetStarted}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '1rem 3rem',
              fontSize: '1.0625rem',
              fontWeight: 600,
              background: 'white',
              color: 'var(--brand-primary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}
          >
            Start Your Free Trial
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '4rem 2rem 2rem',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Bunyan</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                The complete construction management platform for modern engineering teams.
              </p>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Updates'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Terms'] }
            ].map((col) => (
              <div key={col.title}>
                <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  {col.title}
                </h4>
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={{
                      display: 'block',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--brand-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
          
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              2024 Bunyan. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['twitter', 'linkedin', 'facebook'].map((social) => (
                <a
                  key={social}
                  href="#"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--brand-primary)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'var(--bg-primary)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
