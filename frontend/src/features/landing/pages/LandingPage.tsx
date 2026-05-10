import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  BellRing, 
  ShieldCheck, 
  ChevronRight, 
  Users, 
  Globe, 
  BarChart3,
  MousePointer2,
  Rocket
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Smart Resource Booking',
      desc: 'Seamlessly reserve labs, seminar halls, and equipment with real-time availability tracking.',
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      title: 'Complaint Management',
      desc: 'A robust ticketing system for students to report issues and track resolution status instantly.',
      icon: MessageSquare,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      title: 'Campus Announcements',
      desc: 'Stay informed with high-priority broadcasts and digital notice boards delivered in real-time.',
      icon: BellRing,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      title: 'Event Management',
      desc: 'Discover and register for campus hackathons, workshops, and seminars with integrated reminders.',
      icon: Rocket,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      title: 'Real-Time Analytics',
      desc: 'Administrative dashboards that provide actionable insights into campus operations and resource usage.',
      icon: BarChart3,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10'
    },
    {
      title: 'Role-Based Access',
      desc: 'Secure, high-integrity access control for Students, Faculty, and Staff members.',
      icon: ShieldCheck,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10'
    }
  ];

  const stats = [
    { label: 'Active Students', value: '15,000+' },
    { label: 'Resources Managed', value: '200+' },
    { label: 'Service Requests', value: '50,000+' },
    { label: 'Events Organized', value: '1,200+' }
  ];

  return (
    <div className="flex-1 w-full text-slate-200">
      
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] border-b border-white/5 bg-slate-950/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
              <img src="/logo.png" alt="Campus Hub Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">CampusHub</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
            <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="glass-button px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-[90vh] flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 mb-8">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">v2.0 Smart Campus System</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight">
            Transform Your Campus Into A <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">Smart Digital Ecosystem</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            A centralized SaaS platform designed to simplify campus operations, manage resources, and empower students through cutting-edge digital services.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-10 py-4 bg-white text-slate-950 font-black rounded-2xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-2xl shadow-white/10"
            >
              Get Started Now <ChevronRight className="w-5 h-5 ml-2" />
            </button>
            <a href="#features" className="w-full sm:w-auto px-10 py-4 glass-panel border-white/10 text-white font-black rounded-2xl flex items-center justify-center hover:bg-white/5 transition-all">
              Explore Features
            </a>
          </div>
        </motion.div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Enterprise-Grade Features</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base font-medium">Built for scale, designed for simplicity. Everything you need to manage your campus effectively.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 group hover:bg-white/5 transition-all border-white/5 hover:border-blue-500/30"
            >
              <div className={`h-14 w-14 rounded-2xl ${f.bg} flex items-center justify-center ${f.color} mb-6 group-hover:scale-110 transition-transform shadow-xl`}>
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 skew-y-3 translate-y-12" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <motion.p 
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="text-4xl md:text-6xl font-black text-white mb-2 tabular-nums tracking-tighter"
                >
                  {s.value}
                </motion.p>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-tight">Why Institutions Trust <span className="text-blue-500">CampusHub</span></h2>
            <div className="space-y-6">
              {[
                { title: 'Data-Driven Decision Making', desc: 'Real-time analytics help administrators allocate resources more effectively.' },
                { title: 'High Availability & Reliability', desc: 'Built on world-class infrastructure ensuring 99.9% uptime for campus services.' },
                { title: 'Student-First Experience', desc: 'A mobile-first design that prioritizes accessibility and ease of use for students.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                  <div className="mt-1 h-6 w-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[3rem] bg-gradient-to-tr from-blue-600/20 via-indigo-600/10 to-emerald-500/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 glass-panel p-10 max-w-xs shadow-2xl"
                >
                   <Users className="w-16 h-16 text-blue-500 mb-6" />
                   <h3 className="text-2xl font-black text-white mb-2">Centralized Hub</h3>
                   <p className="text-xs text-slate-400 leading-relaxed italic">"One platform to bridge the gap between administrators and students seamlessly."</p>
                </motion.div>
                <div className="absolute top-1/4 right-1/4 h-32 w-32 bg-blue-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 h-32 w-32 bg-emerald-600/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 relative bg-slate-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center">
                  <img src="/logo.png" alt="Campus Hub Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">CampusHub</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed italic">
                Leading the digital transformation for modern educational institutions worldwide.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Solutions</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">© 2024 Campus Connect Hub. All Rights Reserved.</p>
            <div className="flex items-center space-x-6">
               <Globe className="w-4 h-4 text-slate-600 hover:text-blue-400 transition-colors cursor-pointer" />
               <MousePointer2 className="w-4 h-4 text-slate-600 hover:text-blue-400 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
