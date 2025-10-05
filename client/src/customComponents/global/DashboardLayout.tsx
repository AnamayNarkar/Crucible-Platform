import { useState } from 'react';
import { InteractiveGridPattern } from '../../customComponents/auth/InteractiveGridPattern';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Code, 
  Users, 
  Calendar, 
  Bell, 
  Search, 
  Settings, 
  LogOut,
  Plus,
  TrendingUp
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../services/state/store';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.login.isLoggedIn);

  const notifications = [
    { id: 1, text: "New contest 'Spring Code Challenge' starting soon", time: "5m ago", unread: true },
    { id: 2, text: "Your contest 'Algorithm Masters' has 50 new participants", time: "1h ago", unread: true },
    { id: 3, text: "Contest results published for 'Data Structures Pro'", time: "3h ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 relative">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <InteractiveGridPattern 
          className="opacity-30"
          squaresClassName="stroke-blue-500/50 hover:fill-blue-500/20"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Crucible
                </h1>
              </div>

              {/* Quick Nav */}
              <nav className="hidden md:flex items-center space-x-1">
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md">
                  Dashboard
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all">
                  Contests
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all">
                  Problems
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all">
                  Leaderboard
                </button>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="hidden sm:flex items-center bg-white/50 backdrop-blur-sm border border-gray-300/50 rounded-lg px-4 py-2 space-x-2 hover:border-blue-400/50 transition-all group">
                <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search contests..."
                  className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-500 w-48"
                />
              </div>

              {/* Create Button */}
              {isLoggedIn && (
                <button className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all">
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </button>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="relative p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 hover:bg-white/70 hover:border-blue-400/50 transition-all"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 overflow-hidden">
                    <div className="p-4 border-b border-gray-200/50">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-500 mt-1">{unreadCount} unread</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "p-4 border-b border-gray-100/50 hover:bg-blue-50/50 transition-colors cursor-pointer",
                            notif.unread && "bg-blue-50/30"
                          )}
                        >
                          <p className="text-sm text-gray-900">{notif.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-gray-200/50">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center space-x-3 p-2 pl-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 hover:bg-white/70 hover:border-blue-400/50 transition-all"
                  >
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">John Doe</span>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                      JD
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 overflow-hidden">
                      <div className="p-4 border-b border-gray-200/50">
                        <p className="font-semibold text-gray-900">John Doe</p>
                        <p className="text-xs text-gray-500 mt-1">john.doe@example.com</p>
                      </div>
                      <div className="p-2">
                        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50/50 transition-all text-left">
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Settings</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50/50 transition-all text-left">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm">My Stats</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50/50 transition-all text-left mt-2 border-t border-gray-200/50 pt-3">
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Quick Nav */}
        <div className="md:hidden border-t border-gray-200/50 px-4 py-2">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-400 to-blue-500 text-white whitespace-nowrap">
              Dashboard
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-white/50 whitespace-nowrap">
              Contests
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-white/50 whitespace-nowrap">
              Problems
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-white/50 whitespace-nowrap">
              Leaderboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200/50 bg-white/40 backdrop-blur-sm mt-16">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-600">
              © 2025 Crucible. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <button className="hover:text-blue-600 transition-colors">About</button>
              <button className="hover:text-blue-600 transition-colors">Terms</button>
              <button className="hover:text-blue-600 transition-colors">Privacy</button>
              <button className="hover:text-blue-600 transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;