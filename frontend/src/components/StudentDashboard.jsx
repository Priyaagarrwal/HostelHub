import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { 
  HomeIcon, 
  CakeIcon, 
  ChatBubbleBottomCenterTextIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('hostel');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  // State for different sections
  const [application, setApplication] = useState(null);
  const [allotment, setAllotment] = useState(null);
  const [hostels, setHostels] = useState([]);
  
  const [menu, setMenu] = useState({});
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [todaysDishes, setTodaysDishes] = useState([]);
  
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'hostel') {
        const [appRes, allotRes, hostelsRes] = await Promise.all([
          axiosInstance.get('/hostel/my-application').catch(() => ({ data: { data: null }})),
          axiosInstance.get('/hostel/my-allotment').catch(() => ({ data: { data: null }})),
          axiosInstance.get('/hostel').catch(() => ({ data: { data: [] }}))
        ]);
        setApplication(appRes.data?.data);
        setAllotment(allotRes.data?.data);
        setHostels(hostelsRes.data?.data || []);
      } 
      else if (activeTab === 'mess') {
        const menuRes = await axiosInstance.get('/mess/current-week').catch(() => ({ data: { data: {}} }));
        setMenu(menuRes.data?.data || {});
      }
      else if (activeTab === 'complaints') {
        const [compRes, catRes] = await Promise.all([
          axiosInstance.get('/complaints/my-complaints').catch(() => ({ data: { data: [] }})),
          axiosInstance.get('/complaints/categories').catch(() => ({ data: { data: [] }}))
        ]);
        setComplaints(compRes.data?.data || []);
        setCategories(catRes.data?.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // --- Hostel Tab Components ---
  const applyForHostel = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      preferred_hostel_id: formData.get('hostel_id'),
      preferred_room_type: formData.get('room_type'),
      preferred_roommate_name: formData.get('roommate'),
      notes: formData.get('notes')
    };
    
    try {
      await axiosInstance.post('/hostel/apply', payload);
      toast.success('Application submitted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
    }
  };

  const renderHostelTab = () => {
    if (loading) return <div className="flex justify-center p-10"><div className="spinner"></div></div>;

    if (allotment) {
      return (
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">Your Allotted Room</h3>
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="p-5 bg-blue-50/80 rounded-2xl border border-blue-100/50">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Hostel</p>
              <p className="text-xl font-extrabold text-gray-900">{allotment.hostel_name}</p>
            </div>
            <div className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-100/50">
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Room</p>
              <p className="text-xl font-extrabold text-gray-900">{allotment.block_name} - {allotment.room_number}</p>
            </div>
            <div className="p-5 bg-purple-50/80 rounded-2xl border border-purple-100/50">
              <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Type</p>
              <p className="text-xl font-extrabold text-gray-900 capitalize">{allotment.room_type}</p>
            </div>
            <div className="p-5 bg-orange-50/80 rounded-2xl border border-orange-100/50">
              <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Allotted Date</p>
              <p className="text-xl font-extrabold text-gray-900">{new Date(allotment.allotted_date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-8 relative z-10">
            <button className="px-5 py-2.5 bg-white border border-gray-200 shadow-sm text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:shadow transition-all duration-300">
              Request Room Transfer
            </button>
          </div>
        </div>
      );
    }

    if (application && application.status === 'pending') {
      return (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-10 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-amber-100 text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm mb-6 border border-amber-100">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-900 tracking-tight mb-2">Application Under Review</h3>
          <p className="text-amber-800/80 text-lg max-w-md mx-auto">You applied on {new Date(application.applied_date).toLocaleDateString()}. Please wait while the warden reviews your request.</p>
        </div>
      );
    }

    return (
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
        <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">Apply for Hostel</h3>
        <form onSubmit={applyForHostel} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Hostel</label>
            <select name="hostel_id" required className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Hostel</option>
              {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
            <select name="room_type" required className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
              <option value="ac">AC</option>
              <option value="non-ac">Non-AC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Roommate (Optional)</label>
            <input type="text" name="roommate" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" placeholder="Enter name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea name="notes" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" rows="3"></textarea>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all duration-300">
            Submit Application
          </button>
        </form>
      </div>
    );
  };

  // --- Mess Tab Components ---
  const handleRateClick = () => {
    let today = new Date().getDay();
    if (today === 0) today = 7;
    setTodaysDishes(menu[today] || []);
    setShowFeedbackForm(!showFeedbackForm);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      dish_id: formData.get('dish_id'),
      meal_date: new Date().toISOString().split('T')[0],
      meal_type: formData.get('meal_type'),
      taste_rating: parseInt(formData.get('taste_rating')),
      quantity_rating: parseInt(formData.get('quantity_rating')),
      hygiene_rating: parseInt(formData.get('hygiene_rating')),
      comment: formData.get('comment')
    };

    try {
      await axiosInstance.post('/mess/feedback', payload);
      toast.success('Feedback submitted successfully!');
      e.target.reset();
      setShowFeedbackForm(false);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const renderMessTab = () => {
    if (loading) return <div className="flex justify-center p-10"><div className="spinner"></div></div>;
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return (
      <div className="space-y-6">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold tracking-tight text-slate-800">Weekly Menu</h3>
            <button onClick={handleRateClick} className="text-blue-600 text-sm font-medium hover:underline">
              {showFeedbackForm ? 'Cancel Rating' : "Rate Today's Meal"}
            </button>
          </div>
          
          {showFeedbackForm && (
            <div className="mb-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Rate Your Meal</h4>
              <form onSubmit={submitFeedback} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Dish</label>
                    <select name="dish_id" required className="w-full p-2 border border-gray-300 rounded bg-white">
                      <option value="">-- Choose Dish --</option>
                      {todaysDishes.map(d => (
                        <option key={d.dish_id} value={d.dish_id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                    <select name="meal_type" required className="w-full p-2 border border-gray-300 rounded bg-white">
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="snacks">Snacks</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taste Rating (1-5)</label>
                    <input type="number" name="taste_rating" min="1" max="5" required className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Rating (1-5)</label>
                    <input type="number" name="quantity_rating" min="1" max="5" required className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hygiene Rating (1-5)</label>
                    <input type="number" name="hygiene_rating" min="1" max="5" required className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comments (Optional)</label>
                    <input type="text" name="comment" className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition">
                  Submit Rating
                </button>
              </form>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breakfast</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lunch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Snacks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dinner</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {days.map((day, idx) => {
                  const dayItems = menu[idx + 1] || [];
                  const getMeal = (type) => {
                    const item = dayItems.find(i => i.meal_type === type);
                    return item ? (
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${item.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-xs text-gray-500 flex items-center">
                            ★ {item.avg_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ) : <span className="text-gray-400">-</span>;
                  };
                  
                  return (
                    <tr key={day} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{day}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getMeal('breakfast')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getMeal('lunch')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getMeal('snacks')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{getMeal('dinner')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- Complaints Tab Components ---
  const submitComplaint = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      category_id: formData.get('category_id'),
      priority: formData.get('priority'),
      description: formData.get('description')
    };

    try {
      await axiosInstance.post('/complaints', payload);
      toast.success('Complaint raised successfully');
      e.target.reset();
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to raise complaint');
    }
  };

  const renderComplaintsTab = () => {
    if (loading) return <div className="flex justify-center p-10"><div className="spinner"></div></div>;

    const getStatusBadge = (status) => {
      const colors = {
        'raised': 'bg-red-100 text-red-800',
        'assigned': 'bg-yellow-100 text-yellow-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'resolved': 'bg-green-100 text-green-800'
      };
      return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status.replace('_', ' ').toUpperCase()}</span>;
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">Raise Complaint</h3>
            <form onSubmit={submitComplaint} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" name="title" required className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category_id" required className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select name="priority" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                  <option value="normal">Normal</option>
                  <option value="emergency">Emergency</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" required rows="4" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold py-3 rounded-xl hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all duration-300">
                Submit Complaint
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">My Complaints</h3>
            {complaints.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No complaints raised yet.</div>
            ) : (
              <div className="space-y-4">
                {complaints.map(c => (
                  <div key={c.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{c.title}</h4>
                      {getStatusBadge(c.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{c.description}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>Category: <span className="font-medium text-gray-700">{c.category_name}</span></span>
                      <span>Priority: <span className={`font-medium ${c.priority === 'emergency' ? 'text-red-600' : 'text-gray-700'}`}>{c.priority}</span></span>
                      <span>Date: {new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center bg-white/50 p-2 rounded-2xl border border-white/60 shadow-sm mr-2">
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">HostelHub</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, <span className="font-medium text-gray-900">{userName}</span></span>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center p-2 border border-transparent rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="mb-8 flex justify-center">
          <nav className="flex space-x-2 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('hostel')}
              className={`${
                activeTab === 'hostel'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              } flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300`}
            >
              <HomeIcon className="mr-2 h-5 w-5" />
              Hostel & Room
            </button>
            <button
              onClick={() => setActiveTab('mess')}
              className={`${
                activeTab === 'mess'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              } flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300`}
            >
              <CakeIcon className="mr-2 h-5 w-5" />
              Mess & Food
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`${
                activeTab === 'complaints'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              } flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300`}
            >
              <ChatBubbleBottomCenterTextIcon className="mr-2 h-5 w-5" />
              Complaints
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'hostel' && renderHostelTab()}
          {activeTab === 'mess' && renderMessTab()}
          {activeTab === 'complaints' && renderComplaintsTab()}
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
