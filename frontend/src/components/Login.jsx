import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    batch_year: new Date().getFullYear()
  });

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      navigate(`/${role.replace('_', '-')}`);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axiosInstance.post(endpoint, payload);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userName', response.data.user.name);
        
        toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
        
        // Redirect based on role
        const roleRoute = response.data.user.role === 'mess_staff' ? '/mess-staff' : `/${response.data.user.role}`;
        navigate(roleRoute);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (email) => {
    setFormData(prev => ({ ...prev, email, password: 'password123' }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex relative overflow-hidden font-sans">
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/30 blur-[120px] mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/30 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-indigo-500/20 blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* Left Marketing Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-20">
        <div className="mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 mb-8 shadow-2xl">
            <BuildingOffice2Icon className="h-12 w-12 text-blue-400" />
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 drop-shadow-sm">
            HostelHub
          </h1>
          <p className="text-xl text-blue-100/70 font-light max-w-lg leading-relaxed">
            The next generation of campus living. Manage accommodations, mess menus, and maintenance with unprecedented ease and modern aesthetics.
          </p>
        </div>
        
        <div className="space-y-8 mt-4">
          <div className="flex items-center space-x-5 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-400/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
              <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200">Smart Room Allocation</h3>
              <p className="text-sm text-gray-400 mt-1">Automated matching based on preferences</p>
            </div>
          </div>
          <div className="flex items-center space-x-5 group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-400/20 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
              <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200">Mess & Food Analytics</h3>
              <p className="text-sm text-gray-400 mt-1">Real-time feedback and waste tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl border border-white/10 relative overflow-hidden transition-all duration-500 ring-1 ring-white/5">
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none"></div>
          
          <div className="relative">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-gray-400">
                {isLogin ? 'Sign in to access your intelligent dashboard' : 'Join the modern campus ecosystem'}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all shadow-inner"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all shadow-inner"
                  placeholder="name@hostelhub.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#1e293b] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white transition-all shadow-inner appearance-none"
                    >
                      <option value="student">Student</option>
                      <option value="warden">Warden</option>
                      <option value="mess_staff">Mess Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                      <input
                        name="phone"
                        type="text"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all shadow-inner"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Batch Year</label>
                      <input
                        name="batch_year"
                        type="number"
                        value={formData.batch_year}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    isLogin ? 'Authenticate securely' : 'Initialize account'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {isLogin ? "New to HostelHub? Create an account" : "Already registered? Sign in"}
              </button>
            </div>

            {/* Premium Demo Credentials Section */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-[10px] text-gray-500 text-center mb-5 uppercase tracking-widest font-bold">One-Click Demo Access</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => autofillDemo('admin@hostelhub.com')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl flex items-center justify-between group transition-all duration-300">
                  <span className="font-semibold text-purple-400 group-hover:text-purple-300 text-sm">Admin</span>
                  <span className="text-xs text-gray-600 group-hover:text-gray-400 hidden sm:block">admin@</span>
                </button>
                <button type="button" onClick={() => autofillDemo('warden@hostelhub.com')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl flex items-center justify-between group transition-all duration-300">
                  <span className="font-semibold text-blue-400 group-hover:text-blue-300 text-sm">Warden</span>
                  <span className="text-xs text-gray-600 group-hover:text-gray-400 hidden sm:block">warden@</span>
                </button>
                <button type="button" onClick={() => autofillDemo('mess@hostelhub.com')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl flex items-center justify-between group transition-all duration-300">
                  <span className="font-semibold text-orange-400 group-hover:text-orange-300 text-sm">Mess</span>
                  <span className="text-xs text-gray-600 group-hover:text-gray-400 hidden sm:block">mess@</span>
                </button>
                <button type="button" onClick={() => autofillDemo('student1@hostelhub.com')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl flex items-center justify-between group transition-all duration-300">
                  <span className="font-semibold text-green-400 group-hover:text-green-300 text-sm">Student</span>
                  <span className="text-xs text-gray-600 group-hover:text-gray-400 hidden sm:block">student1@</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
