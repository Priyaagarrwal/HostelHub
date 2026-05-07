import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { 
  CalendarDaysIcon, 
  ChartBarIcon, 
  TrashIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MessStaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('planner');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const [dishes, setDishes] = useState([]);
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'planner' || activeTab === 'waste') {
        const res = await axiosInstance.get('/mess/dishes/all');
        setDishes(res.data.data || []);
      } 
      if (activeTab === 'performance') {
        const res = await axiosInstance.get('/mess/dish-performance');
        setPerformance(res.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishMenu = async (e) => {
    e.preventDefault();
    // Simplified for demo: in reality, would collect from a complex grid form
    toast.success('Menu published for the next week');
  };

  const handleLogWaste = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      menu_plan_id: 1, // Mocked for demo
      meal_date: new Date().toISOString().split('T')[0],
      meal_type: formData.get('meal_type'),
      leftover_quantity_kg: parseFloat(formData.get('quantity')),
      notes: formData.get('notes')
    };

    try {
      const res = await axiosInstance.post('/mess/waste/log', payload);
      toast.success(`Waste logged. Estimated loss: ₹${res.data.estimated_cost}`);
      e.target.reset();
    } catch (error) {
      toast.error('Failed to log waste');
    }
  };

  const renderPlannerTab = () => {
    if (loading) return <div className="spinner mx-auto mt-10"></div>;
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

    return (
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold tracking-tight text-slate-800">Weekly Menu Planner</h3>
          <button onClick={handlePublishMenu} className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all font-semibold">
            Publish Menu
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 border-none">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Day</th>
                {meals.map(m => <th key={m} className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{m}</th>)}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {days.map(day => (
                <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-700 bg-slate-50/30">{day}</td>
                  {meals.map(m => (
                    <td key={`${day}-${m}`} className="px-5 py-4">
                      <select className="w-full text-sm border border-slate-200 text-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white/50 shadow-inner appearance-none transition-all">
                        <option value="">Select Dish</option>
                        {dishes.filter(d => d.category === m.toLowerCase()).map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    if (loading) return <div className="spinner mx-auto mt-10"></div>;

    return (
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <h3 className="text-xl font-bold tracking-tight mb-8 text-slate-800">Dish Performance Analysis</h3>
        
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dish Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Rating</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reviews</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Waste (KG)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {performance.map(p => (
                <tr key={p.id} className={`${p.avg_rating > 0 && p.avg_rating < 3 ? 'bg-red-50/50' : 'hover:bg-slate-50/50'} transition-colors`}>
                  <td className="px-6 py-5 whitespace-nowrap font-bold text-slate-800 flex items-center">
                    {p.name}
                    {p.avg_rating > 0 && p.avg_rating < 3 && <span className="ml-3 text-[10px] uppercase font-bold tracking-wider bg-red-100 text-red-700 px-2.5 py-0.5 rounded-md">Critical</span>}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 capitalize font-medium">{p.category}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold">
                    {p.avg_rating ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${p.avg_rating >= 4 ? 'bg-emerald-100 text-emerald-800' : p.avg_rating < 3 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        ★ {p.avg_rating.toFixed(1)}
                      </span>
                    ) : <span className="text-slate-400 font-normal">No ratings</span>}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">{p.feedback_count}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-600">{p.total_waste || 0} <span className="font-normal text-slate-400">kg</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderWasteTab = () => {
    const chartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Waste (KG)',
          data: [12, 19, 15, 8, 22, 14, 10], // Mocked for demo
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
        }
      ]
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">Log Food Waste</h3>
          <form onSubmit={handleLogWaste} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Meal Type</label>
              <select name="meal_type" required className="w-full p-3 border border-slate-200 text-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white/50 shadow-inner appearance-none transition-all">
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snacks">Snacks</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Leftover Quantity (KG)</label>
              <input type="number" step="0.1" name="quantity" required className="w-full p-3 border border-slate-200 text-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white/50 shadow-inner transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-1.5 uppercase tracking-wider text-[10px]">Notes / Reason</label>
              <textarea name="notes" rows="3" className="w-full p-3 border border-slate-200 text-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-white/50 shadow-inner transition-all" placeholder="E.g., Students preferred eating outside"></textarea>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold py-3.5 rounded-xl hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all">
              Log Waste Record
            </button>
          </form>
        </div>

        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">Waste Trend (Last 7 Days)</h3>
          <div className="relative h-64 w-full">
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/40 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center bg-orange-50 p-2 rounded-2xl border border-orange-100 shadow-sm mr-2">
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 tracking-tight">HostelHub</span>
                <span className="ml-2 text-sm font-bold bg-orange-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">Mess Staff</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, <span className="font-bold text-slate-900">{userName}</span></span>
              <button onClick={() => { localStorage.clear(); navigate('/'); }} className="p-2 border border-slate-200 text-slate-500 rounded-full hover:bg-slate-100 transition-colors">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-center">
          <nav className="flex space-x-2 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('planner')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'planner' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
            >
              <CalendarDaysIcon className="h-5 w-5 mr-2" /> Menu Planner
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'performance' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
            >
              <ChartBarIcon className="h-5 w-5 mr-2" /> Dish Performance
            </button>
            <button
              onClick={() => setActiveTab('waste')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'waste' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
            >
              <TrashIcon className="h-5 w-5 mr-2" /> Waste Logger
            </button>
          </nav>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'planner' && renderPlannerTab()}
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'waste' && renderWasteTab()}
        </div>
      </div>
    </div>
  );
};

export default MessStaffDashboard;
