import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContestById, participateInContest } from '../services/api/contest';
import type { ContestDetailsForUser } from '../services/types/contest';
import NotFound from '../customComponents/global/errors/NotFound';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Calendar, 
  User, 
  Trophy, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  status: 'not-started' | 'ongoing' | 'ended';
}

const ContestVisit = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const [contest, setContest] = useState<ContestDetailsForUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [participating, setParticipating] = useState(false);

  // Fetch contest data
  useEffect(() => {
    const fetchContest = async () => {
      if (!contestId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getContestById(parseInt(contestId));
        if (data) {
          setContest(data);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [contestId]);

  // Update timer every second
  useEffect(() => {
    if (!contest) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const start = new Date(contest.startTime).getTime();
      const end = new Date(contest.endTime).getTime();

      let status: 'not-started' | 'ongoing' | 'ended';
      let targetTime: number;

      if (now < start) {
        status = 'not-started';
        targetTime = start;
      } else if (now >= start && now < end) {
        status = 'ongoing';
        targetTime = end;
      } else {
        status = 'ended';
        targetTime = end;
      }

      const diff = targetTime - now;
      
      if (diff <= 0 && status !== 'ended') {
        // Refresh the component when status changes
        setTimeout(() => updateTimer(), 1000);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      console.log('Time Remaining:', { days, hours, minutes, seconds, status });
      setTimeRemaining({ days, hours, minutes, seconds, status });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  const handleParticipate = async () => {
    if (!contestId) return;

    // If already participated, navigate directly to contest
    if (contest?.hasUserParticipated) {
      navigate(`/contests/${contestId}/in`);
      return;
    }

    // Otherwise, attempt to join the contest
    setParticipating(true);
    try {
      const result = await participateInContest(parseInt(contestId));
      if (result) {
        toast.success(result.message || 'Successfully joined the contest!');
        // Navigate to contest interface after successful participation
        setTimeout(() => {
          navigate(`/contests/${contestId}/in`);
        }, 1000);
      }
    } catch (error: any) {
      // Error handling - display appropriate toast message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to join contest';
      
      if (errorMessage.includes('creators and admins')) {
        toast.error('Contest creators and admins cannot participate');
      } else if (errorMessage.includes('already joined')) {
        toast.error('You have already joined this contest');
      } else if (errorMessage.includes('not started')) {
        toast.error('Contest has not started yet');
      } else if (errorMessage.includes('already ended')) {
        toast.error('Contest has already ended');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setParticipating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (notFound || !contest) {
    return (
      <NotFound
        message="The contest you're looking for doesn't exist."
        backButtonText="View All Contests"
        backButtonPath="/contests"
      />
    );
  }

  const getActionButton = () => {
    if (!timeRemaining) return null;

    const buttons = {
      'not-started': (
        <button
          disabled
          className="px-6 py-3 rounded-xl font-medium bg-gray-200 text-gray-500 cursor-not-allowed flex items-center space-x-2"
        >
          <span>Contest Not Started</span>
        </button>
      ),
      'ongoing': contest?.hasUserParticipated ? (
        <button
          onClick={handleParticipate}
          disabled={participating}
          className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center space-x-2 shadow-lg shadow-green-500/30 transition-all transform hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {participating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>Continue Contest</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleParticipate}
          disabled={participating}
          className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center space-x-2 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {participating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            <>
              <span>Participate Now</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      ),
      'ended': (
        <button
          disabled
          className="px-6 py-3 rounded-xl font-medium bg-gray-200 text-gray-500 cursor-not-allowed flex items-center space-x-2"
        >
          <Trophy className="w-5 h-5" />
          <span>Contest Ended</span>
        </button>
      )
    };

    return buttons[timeRemaining.status];
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Toaster position="top-right" />
      {/* Header Section */}
      <div className="mb-8">
        {contest.bannerImageUrl && (
          <div className="w-full h-64 rounded-2xl overflow-hidden mb-6 shadow-lg">
            <img
              src={contest.bannerImageUrl}
              alt={contest.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900 break-words">{contest.name}</h1>
            </div>
            <p className="text-gray-600 text-lg mb-4">{contest.cardDescription}</p>
            
            {/* Contest Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Created by User #{contest.creatorId}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Created {new Date(contest.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            {getActionButton()}
            {timeRemaining && timeRemaining.status === 'not-started' && timeRemaining.hours <= 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Contest starts in: {timeRemaining.days > 0 ? `${timeRemaining.days}d ` : ''}{timeRemaining.hours > 0 ? `${timeRemaining.hours}h ` : ''}{timeRemaining.minutes}m {timeRemaining.seconds}s
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Description and Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Contest Duration */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contest Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="text-sm text-gray-500">Start Time</div>
                  <div className="font-medium text-gray-900">{formatDate(contest.startTime)}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div>
                  <div className="text-sm text-gray-500">End Time</div>
                  <div className="font-medium text-gray-900">{formatDate(contest.endTime)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Contest</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{contest.markdownDescription}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestVisit;