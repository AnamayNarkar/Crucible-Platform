import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../services/state/store';
import {
  setUserContests,
  setOngoingContests,
  setUpcomingContests,
  setPastContests,
  setLoading,
} from '../../services/state/slice/contests';
import contestsDataRaw from '../../../contests.json';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  PlayCircle,
  CalendarClock,
  History,
  Sparkles,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Contest } from '../../services/types';

// Load the JSON data
const contestsData = contestsDataRaw as {
  userContests: Contest[];
  ongoingContests: Contest[];
  upcomingContests: Contest[];
  pastContests: Contest[];
};

/**
 * A reusable, styled card component to display contest information.
 */
const ContestCard = ({ contest, type = 'default' }: { contest: Contest; type?: 'user' | 'default' }) => {
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

        {/* Badge for user's own contest */}
        {type === 'user' && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center space-x-1.5 px-3 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg">
              <Award className="w-3.5 h-3.5" />
              <span>Your Contest</span>
            </span>
          </div>
        )}

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
          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/30 transform group-hover:scale-105 transition-all">
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
      'flex items-center space-x-3 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300',
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
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { userContests, ongoingContests, upcomingContests, pastContests, loading } = useSelector(
    (state: RootState) => state.contests
  );
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming' | 'past'>('ongoing');


  // fetch contests data, currently simulated with local JSON
  useEffect(() => {
    dispatch(setLoading(true));
    const timer = setTimeout(() => {
      dispatch(setUserContests(contestsData.userContests));
      dispatch(setOngoingContests(contestsData.ongoingContests));
      dispatch(setUpcomingContests(contestsData.upcomingContests));
      dispatch(setPastContests(contestsData.pastContests));
      dispatch(setLoading(false));
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch]);

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
              <ContestCard contest={contest} />
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
          <button className="inline-flex items-center space-x-2 px-6 py-3 mt-4 md:mt-0 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => navigate('/contests/create')}>
            <Plus className="w-5 h-5" />
            <span>Create New Contest</span>
          </button>
        </div>

        <div className="space-y-16">
          {/* Your Contests Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Contests</h2>
              <p className="text-md text-gray-600">Contests you created or manage</p>
            </div>

            {userContests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userContests.map((contest) => (
                  <ContestCard key={contest.id} contest={contest} type="user" />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="No Contests Yet"
                message="Create your first contest and start challenging others!"
              >
                <button className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all" onClick={() => navigate('/contests/create')}>
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Contest</span>
                </button>
              </EmptyState>
            )}
          </section>

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