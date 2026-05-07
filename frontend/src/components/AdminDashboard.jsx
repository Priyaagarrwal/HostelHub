import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { 
  BuildingOffice2Icon, 
  UsersIcon, 
  ChartPieIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const [hostels, setHostels] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [showDishForm, setShowDishForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'hostels') {
        const res = await axiosInstance.get('/hostel');
        setHostels(res.data.data || []);
      } else if (activeTab === 'dishes') {
        const res = await axiosInstance.get('/mess/dishes/all');
        setDishes(res.data.data || []);
      } else if (activeTab === 'analytics') {
        const res = await axiosInstance.get('/complaints/analytics');
        setAnalytics(res.data.data || {});
      } else if (activeTab === 'users') {
        const res = await axiosInstance.get('/auth/users');
        setUsers(res.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHostel = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      address: formData.get('address'),
      warden_id: 2, // Mocked for demo
      total_blocks: parseInt(formData.get('blocks'))
    };

    try {
      await axiosInstance.post('/hostel', payload);
      toast.success('Hostel added');
      e.target.reset();
      fetchData();
    } catch (error) {
      toast.error('Failed to add hostel');
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      category: formData.get('category'),
      cuisine_type: formData.get('cuisine_type'),
      is_veg: formData.get('is_veg') === 'true',
      base_cost: parseFloat(formData.get('base_cost')),
      nutrition_info: formData.get('nutrition_info')
    };

    try {
      await axiosInstance.post('/mess/dishes', payload);
      toast.success('Dish added');
      e.target.reset();
      setShowDishForm(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to add dish');
    }
  };

  const handleDeleteDish = async (id) => {
    if(window.confirm('Are you sure you want to delete this dish?')) {
      try {
        await axiosInstance.delete(`/mess/dishes/${id}`);
        toast.success('Dish removed');
        fetchData();
      } catch (error) {
        toast.error('Failed to remove dish');
      }
    }
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await axiosInstance.put(`/auth/users/${id}/role`, { role });
      toast.success('User role updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/auth/users/${id}`);
        toast.success('User deleted');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const renderAnalyticsTab = () => {
    if (loading) return <div className="spinner mx-auto mt-10"></div>;

    const categoryStats = analytics?.categoryStats || [];
    
    const pieData = {
      labels: categoryStats.map(c => c.category_name) || ['Electrical', 'Plumbing', 'Cleaning', 'Other'],
      datasets: [
        {
          data: categoryStats.map(c => c.count) || [12, 19, 3, 5],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
          ],
        },
      ],
    };

    return (
      <div>
        <h3 className="text-2xl font-bold tracking-tight mb-8 text-slate-800">System Analytics Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Users</h4>
            <div className="mt-2 flex items-baseline text-4xl font-extrabold text-slate-800">
              1,248
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Overall Occupancy</h4>
            <div className="mt-2 flex items-baseline text-4xl font-extrabold text-blue-600">
              87%
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8"></div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Avg Food Satisfaction</h4>
            <div className="mt-2 flex items-baseline text-4xl font-extrabold text-emerald-500">
              4.2 <span className="text-2xl text-slate-300 ml-1">/ 5.0</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <h4 className="text-lg font-bold text-slate-800 mb-6">Complaints by Category</h4>
            <div className="w-2/3 mx-auto relative h-64 flex justify-center items-center">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHostelsTab = () => {
    if (loading) return <div className="spinner mx-auto mt-10"></div>;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">Add New Hostel</h3>
            <form onSubmit={handleAddHostel} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hostel Name</label>
                <input type="text" name="name" required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800/50 focus:border-slate-800 bg-white/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                <input type="text" name="address" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800/50 focus:border-slate-800 bg-white/50 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Blocks</label>
                <input type="number" name="blocks" defaultValue="1" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800/50 focus:border-slate-800 bg-white/50 transition-all" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-300">
                Create Hostel
              </button>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
            <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">Manage Hostels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hostels.map(h => (
                <div key={h.id} className="border border-slate-100 rounded-2xl p-6 hover:shadow-md transition bg-gradient-to-br from-white to-slate-50/50 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/0 group-hover:bg-indigo-500 transition-colors"></div>
                  <h4 className="font-extrabold text-xl text-slate-800">{h.name}</h4>
                  <p className="text-sm text-slate-500 mt-2 font-medium">{h.address}</p>
                  <div className="mt-6 flex justify-between items-center text-sm">
                    <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg">{h.total_blocks} Blocks</span>
                    <button className="text-rose-500 hover:text-rose-700 font-bold hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDishesTab = () => {
    if (loading) return <div className="spinner mx-auto mt-10"></div>;

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Dish Library</h3>
          <button onClick={() => setShowDishForm(!showDishForm)} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900 transition font-medium">
            {showDishForm ? 'Cancel' : '+ Add New Dish'}
          </button>
        </div>

        {showDishForm && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-lg font-medium text-gray-800 mb-3">New Dish Details</h4>
            <form onSubmit={handleAddDish} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dish Name</label>
                <input type="text" name="name" required className="w-full p-2 border border-gray-300 rounded bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" required className="w-full p-2 border border-gray-300 rounded bg-white">
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="is_veg" required className="w-full p-2 border border-gray-300 rounded bg-white">
                  <option value="true">Veg</option>
                  <option value="false">Non-Veg</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Cost (₹)</label>
                <input type="number" step="0.01" name="base_cost" required className="w-full p-2 border border-gray-300 rounded bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                <input type="text" name="cuisine_type" className="w-full p-2 border border-gray-300 rounded bg-white" placeholder="e.g., North Indian" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nutrition Info</label>
                <input type="text" name="nutrition_info" className="w-full p-2 border border-gray-300 rounded bg-white" placeholder="e.g., 200 kcal" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-slate-800 text-white font-medium py-2 rounded hover:bg-slate-900 transition">Save Dish</button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dish Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dishes.map(d => (
                <tr key={d.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{d.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{d.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.is_veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {d.is_veg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{d.base_cost}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button onClick={() => handleDeleteDish(d.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderUsersTab = () => {
    if (loading) return <div className="spinner mx-auto mt-10"></div>;

    return (
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <h3 className="text-xl font-bold tracking-tight mb-8 text-slate-800">User Management</h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name & Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phone & Batch</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-sm text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-700">{u.phone || 'N/A'}</div>
                    <div className="text-sm text-slate-500">{u.batch_year ? `Batch ${u.batch_year}` : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="text-sm font-bold border border-slate-200 text-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-white/50 shadow-inner outline-none transition-all"
                    >
                      <option value="student">Student</option>
                      <option value="warden">Warden</option>
                      <option value="mess_staff">Mess Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleDeleteUser(u.id)} className="text-rose-500 font-bold hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex font-sans bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Sidebar Navigation */}
      <div className="w-72 bg-[#0f172a] shadow-2xl hidden md:flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
        <div className="h-20 flex items-center px-8 border-b border-white/5 relative z-10">
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">HostelHub</span>
        </div>
        <div className="flex-1 overflow-y-auto py-8 flex flex-col space-y-2 px-4 relative z-10">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'analytics' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <ChartPieIcon className={`mr-4 flex-shrink-0 h-6 w-6 transition-transform group-hover:scale-110 ${activeTab === 'analytics' ? 'text-indigo-400' : ''}`} /> Analytics Hub
          </button>
          <button 
            onClick={() => setActiveTab('hostels')}
            className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'hostels' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <BuildingOffice2Icon className={`mr-4 flex-shrink-0 h-6 w-6 transition-transform group-hover:scale-110 ${activeTab === 'hostels' ? 'text-indigo-400' : ''}`} /> Hostel Management
          </button>
          <button 
            onClick={() => setActiveTab('dishes')}
            className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'dishes' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <ArchiveBoxIcon className={`mr-4 flex-shrink-0 h-6 w-6 transition-transform group-hover:scale-110 ${activeTab === 'dishes' ? 'text-indigo-400' : ''}`} /> Dish Management
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group ${activeTab === 'users' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
          >
            <UsersIcon className={`mr-4 flex-shrink-0 h-6 w-6 transition-transform group-hover:scale-110 ${activeTab === 'users' ? 'text-indigo-400' : ''}`} /> User Management
          </button>
        </div>
        <div className="p-6 border-t border-white/5 relative z-10 flex-shrink-0 mt-auto">
          {/* Bottom area for future use or branding */}
          <div className="text-center text-xs font-bold text-slate-600 tracking-widest uppercase">
            HostelHub v1.0
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-8 z-10 md:hidden border-b border-white">
          <span className="text-xl font-bold text-slate-800">HostelHub Admin</span>
          <button onClick={() => { localStorage.clear(); navigate('/'); }}><ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-500" /></button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 lg:p-12">
          <div className="mb-10 hidden md:flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage system parameters and oversight</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-sm">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
                  {userName ? userName.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="text-sm font-bold text-slate-700">{userName}</span>
              </div>
              <button 
                onClick={() => { localStorage.clear(); navigate('/'); }} 
                className="flex items-center justify-center p-2.5 bg-white/60 backdrop-blur-md text-slate-500 hover:text-rose-500 hover:bg-rose-50 border border-white rounded-full shadow-sm transition-all duration-300 group"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'analytics' && renderAnalyticsTab()}
            {activeTab === 'hostels' && renderHostelsTab()}
            {activeTab === 'dishes' && renderDishesTab()}
            {activeTab === 'users' && renderUsersTab()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
