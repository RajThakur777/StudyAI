import React, { useState, useEffect } from 'react';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import {
  FileText,
  BookOpen,
  BrainCircuit,
  Clock,
} from 'lucide-react';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await progressService.getDashboardData();
        setDashboardData(res.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Spinner />;

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-slate-500 font-medium">No dashboard data available.</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'TOTAL DOCUMENTS',
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      iconGradient: 'from-blue-400 to-blue-600',
      shadow: 'shadow-[0_10px_30px_-5px_rgba(59,130,246,0.4)]',
    },
    {
      label: 'TOTAL FLASHCARDS',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      iconGradient: 'from-purple-400 to-pink-500',
      shadow: 'shadow-[0_10px_30px_-5px_rgba(217,70,239,0.4)]',
    },
    {
      label: 'TOTAL QUIZZES',
      value: dashboardData.overview.totalQuizzes,
      icon: BrainCircuit,
      iconGradient: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-[0_10px_30px_-5px_rgba(16,185,129,0.4)]',
    },
  ];

  const activities = [
    ...(dashboardData.recentActivity?.documents || []).map(doc => ({
      id: doc._id,
      description: doc.title,
      timestamp: doc.lastAccessed,
      link: `/documents/${doc._id}`,
      type: 'document',
    })),
    ...(dashboardData.recentActivity?.quizzes || []).map(quiz => ({
      id: quiz._id,
      description: quiz.title,
      timestamp: quiz.lastAttempted,
      link: `/quizzes/${quiz._id}`,
      type: 'quiz',
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Track your learning progress and activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100/50 flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-5xl font-bold text-slate-900 mt-4 leading-none">
                  {stat.value}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.iconGradient} ${stat.shadow} flex items-center justify-center`}>
                <stat.icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Container */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100/50 p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <Clock className="w-6 h-6 text-slate-700" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Activity</h3>
          </div>

          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="group flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 hover:border-emerald-100 transition-all duration-300"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <p className="text-base font-semibold text-slate-800 tracking-tight">
                        {activity.type === 'document' ? 'Accessed Document: ' : 'Attempted Quiz: '}
                        <span className="font-medium text-slate-600">{activity.description}</span>
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 ml-5.5 mt-1 font-medium tracking-wide">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <a
                    href={activity.link}
                    className="text-emerald-500 font-bold text-sm hover:underline underline-offset-4"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-semibold text-lg tracking-tight">No recent activity yet.</p>
              <p className="text-slate-400 text-sm mt-1">Start learning to see your progress here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;