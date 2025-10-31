// keep the contest state local to this component for simplicity
// there is no need for centralized state management here using Redux.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getLiveContests, getUpcomingContests, getPastContests, getUserContests } from '../../services/api/contest';
import {
  Calendar,
  Clock,
  Users,
  PlayCircle,
  CalendarClock,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Contest } from '../../services/types';
import type { RootState } from '../../services/state/store';

/**
 * A reusable, styled card component to display contest information.
 */
const ContestCard = ({ contest, type = 'default', onButtonClick }: { contest: Contest; type?: 'user' | 'default'; onButtonClick?: () => void }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="group relative bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200/30 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1.5 shadow-xl shadow-gray-300/30">
      {/* Banner Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={contest.bannerImageUrl}
          alt={contest.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Contest Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-xl line-clamp-2">{contest.name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-gray-700 text-sm line-clamp-2 mb-5">{contest.markdownDescription}</p>

        <div className="space-y-2.5 mb-5">
          <div className="flex items-center space-x-2 text-sm text-gray-800">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{formatDate(contest.startTime)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-800">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>
              {formatTime(contest.startTime)} - {formatTime(contest.endTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="w-4 h-4 text-gray-400" />
            <span>Contest #{contest.id}</span>
          </div>
          <button onClick={onButtonClick} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 transform group-hover:scale-105 transition-all cursor-pointer">
            {type === 'user' ? 'Manage' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * A reusable, styled tab button for navigation.
 */
const TabButton = ({
  active,
  onClick,
  children,
  icon: Icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: any;
  count: number;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center space-x-3 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 cursor-pointer',
      active
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 -translate-y-1'
        : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200/50 shadow-md shadow-gray-200/50 hover:shadow-lg hover:-translate-y-0.5'
    )}
  >
    <Icon className="w-5 h-5" />
    <span>{children}</span>
    <span
      className={cn(
        'ml-1 px-3 py-0.5 rounded-full text-xs font-bold',
        active ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-700'
      )}
    >
      {count}
    </span>
  </button>
);

/**
 * A reusable empty state component.
 */
const EmptyState = ({
  icon: Icon,
  title,
  message,
  children,
}: {
  icon: any;
  title: string;
  message: string;
  children?: React.ReactNode;
}) => (
  <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200/50 p-12 text-center shadow-xl shadow-gray-300/30">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-5">
      <Icon className="w-10 h-10 text-blue-600" />
    </div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-700 mb-6">{message}</p>
    {children}
  </div>
);

/**
 * Main Contests Page Component
 */
const Contests = () => {
  const navigate = useNavigate();
  
  // Get authentication status from Redux
  const isAuthenticated = useSelector((state: RootState) => state.auth.isLoggedIn);
  
  // Local state for contests
  const [userContests, setUserContests] = useState<Contest[]>([]);
  const [ongoingContests, setOngoingContests] = useState<Contest[]>([]);
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [pastContests, setPastContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming' | 'past'>('ongoing');

  // Fetch contests data from API
  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch public contests (live, upcoming, past) - these are always fetched
        const [liveData, upcomingData, pastData] = await Promise.all([
          getLiveContests(),
          getUpcomingContests(),
          getPastContests(),
        ]);
        
        if (liveData) setOngoingContests(liveData);
        if (upcomingData) setUpcomingContests(upcomingData);
        if (pastData) setPastContests(pastData);
        
        // Fetch user's contests only if authenticated
        if (isAuthenticated) {
          const userContestsData = await getUserContests();
          if (userContestsData) {
            setUserContests(userContestsData);
          }
        } else {
          setUserContests([]);
        }
      } catch (err) {
        console.error('Error fetching contests:', err);
        setError('Failed to load contests');
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [isAuthenticated]);

  const getTimeRemaining = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();

    if (diff < 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderContests = (contests: Contest[], type: 'ongoing' | 'upcoming' | 'past') => {
    if (contests.length === 0) {
      const emptyMessages = {
        ongoing: {
          icon: PlayCircle,
          title: 'No Ongoing Contests',
          message: 'Check back later or see what\'s upcoming!',
        },
        upcoming: {
          icon: CalendarClock,
          title: 'No Upcoming Contests',
          message: 'Nothing scheduled at the moment. Why not create one?',
        },
        past: {
          icon: History,
          title: 'No Past Contests',
          message: 'Finished contests will appear here.',
        },
      };
      const { icon, title, message } = emptyMessages[type];
      return <EmptyState icon={icon} title={title} message={message} />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contests.map((contest) => (
          <div key={contest.id} className="relative">
            {type === 'ongoing' && (
              <div className="absolute -top-3 -right-3 z-10">
                <span className="flex items-center space-x-1.5 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span>LIVE</span>
                </span>
              </div>
            )}
            {type === 'upcoming' && (
              <div className="absolute -top-3 -right-3 z-10">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/30">
                  {getTimeRemaining(contest.startTime)}
                </span>
              </div>
            )}
            <div
              className={cn(
                type === 'past' &&
                  'opacity-70 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300'
              )}
            >
              <ContestCard contest={contest} onButtonClick={() => navigate(`/contests/${contest.id}`)} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Contests</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 md:mb-16">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Contests</h1>
            <p className="text-lg text-gray-600 mt-1">
              Create, participate, and showcase your skills.
            </p>
          </div>
          <button className=" z-25 inline-flex items-center space-x-2 px-6 py-3 mt-4 md:mt-0 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => navigate('/contests/create')}>
            <span>Create New Contest</span>
          </button>
        </div>

        <div className="space-y-16">
          {/* Your Contests Section - Only show if authenticated and has contests */}
          {isAuthenticated && userContests.length > 0 && (
            <section>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Contests</h2>
                <p className="text-md text-gray-600">Contests you created or manage</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userContests.map((contest) => (
                  <ContestCard key={contest.id} contest={contest} type="user" onButtonClick={() => navigate(`/contests/manage/${contest.id}`)} />
                ))}
              </div>
            </section>
          )}

          {/* All Contests Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">All Contests</h2>
              <p className="text-md text-gray-600">Explore and participate in contests</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <TabButton
                active={activeTab === 'ongoing'}
                onClick={() => setActiveTab('ongoing')}
                icon={PlayCircle}
                count={ongoingContests.length}
              >
                Ongoing
              </TabButton>
              <TabButton
                active={activeTab === 'upcoming'}
                onClick={() => setActiveTab('upcoming')}
                icon={CalendarClock}
                count={upcomingContests.length}
              >
                Upcoming
              </TabButton>
              <TabButton
                active={activeTab === 'past'}
                onClick={() => setActiveTab('past')}
                icon={History}
                count={pastContests.length}
              >
                Past Contests
              </TabButton>
            </div>

            {/* Contest Grid */}
            <div>
              {activeTab === 'ongoing' && renderContests(ongoingContests, 'ongoing')}
              {activeTab === 'upcoming' && renderContests(upcomingContests, 'upcoming')}
              {activeTab === 'past' && renderContests(pastContests, 'past')}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contests;