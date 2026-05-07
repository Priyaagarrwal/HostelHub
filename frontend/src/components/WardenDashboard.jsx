import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { 
  ClipboardDocumentCheckIcon, 
  HomeModernIcon, 
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const WardenDashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');

  const [pendingApps, setPendingApps] = useState([]);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [pendingComplaints, setPendingComplaints] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'applications') {
        const res = await axiosInstance.get('/hostel/pending-applications');
        setPendingApps(res.data.data || []);
      } else if (activeTab === 'rooms') {
        const res = await axiosInstance.get('/hostel/vacant-rooms');
        setVacantRooms(res.data.data || []);
      } else if (activeTab === 'complaints') {
        const res = await axiosInstance.get('/complaints/pending');
        setPendingComplaints(res.data.data || []);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAllot = async (appId) => {
    try {
      await axiosInstance.post(`/hostel/auto-allot/${appId}`);
      toast.success('Room auto-allotted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to allot room');
    }
  };

  const handleComplaintStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/complaints/${id}/status`, { status, resolution_notes: 'Resolved by warden' });
      toast.success(`Complaint marked as ${status}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const renderApplicationsTab = () => {
    if (loading) return <div className="flex justify-center p-10"><div className="spinner"></div></div>;

    return (
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">Pending Hostel Applications</h3>
        {pendingApps.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
            <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No pending applications right now.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Preferences</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {pendingApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{app.student_name}</div>
                      <div className="text-sm text-slate-500">{app.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {app.preferred_hostel || 'Any'} - {app.preferred_room_type || 'Any'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                      {new Date(app.applied_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleAutoAllot(app.id)}
                        className="text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 mr-2"
                      >
                        Auto-Allot Room
                      </button>
                      <button className="text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition-colors font-semibold">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderRoomsTab = () => {
    if (loading) return <div className="flex justify-center p-10"><div className="spinner"></div></div>;

    return (
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">Vacant Rooms Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {vacantRooms.map(room => (
            <div key={room.id} className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-6 border border-emerald-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-200/50 rounded-full blur-xl pointer-events-none"></div>
              <div className="font-extrabold text-2xl text-emerald-900 tracking-tight">{room.room_number}</div>
              <div className="text-sm text-emerald-700/80 font-medium mt-1">{room.hostel_name} - {room.block_name}</div>
              <div className="mt-4 text-xs font-bold px-3 py-1.5 bg-emerald-200/50 text-emerald-800 rounded-lg inline-flex items-center shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                {room.capacity - room.current_occupancy} spots left
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderComplaintsTab = () => {
    if (loading) return <div className="flex justify-center p-10"><div className="spinner"></div></div>;

    return (
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <h3 className="text-xl font-bold tracking-tight mb-6 text-slate-800">Pending Maintenance Complaints</h3>
        <div className="space-y-4">
          {pendingComplaints.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No pending complaints. Everything is working fine!</div>
          ) : pendingComplaints.map(c => (
            <div key={c.id} className="border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-slate-50/50 transition-colors shadow-sm">
              <div className="mb-4 sm:mb-0">
                <h4 className="text-lg font-bold text-slate-800 flex items-center">
                  {c.title}
                  <span className={`ml-3 px-2.5 py-0.5 text-xs font-bold rounded-md uppercase tracking-wider ${c.priority === 'emergency' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {c.priority}
                  </span>
                </h4>
                <p className="text-sm text-slate-600 my-2">{c.description}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600">By: {c.student_name}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-600">Cat: {c.category_name}</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">Status: {c.status.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                {c.status === 'raised' && (
                  <button onClick={() => handleComplaintStatus(c.id, 'in_progress')} className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-semibold text-sm rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all">
                    In-Progress
                  </button>
                )}
                <button onClick={() => handleComplaintStatus(c.id, 'resolved')} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all">
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center bg-indigo-50 p-2 rounded-2xl border border-indigo-100 shadow-sm mr-2">
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">HostelHub</span>
                <span className="ml-2 text-sm font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">Warden</span>
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
              onClick={() => setActiveTab('applications')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'applications' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
            >
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" /> Applications
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'rooms' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
            >
              <HomeModernIcon className="h-5 w-5 mr-2" /> Rooms
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'complaints' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'}`}
            >
              <WrenchScrewdriverIcon className="h-5 w-5 mr-2" /> Complaints
            </button>
          </nav>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'applications' && renderApplicationsTab()}
          {activeTab === 'rooms' && renderRoomsTab()}
          {activeTab === 'complaints' && renderComplaintsTab()}
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
