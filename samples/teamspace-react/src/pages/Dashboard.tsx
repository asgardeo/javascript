import {CreateOrganization, CreateUser, User, useAsgardeo} from '@asgardeo/react';
import {Users, MessageSquare, Calendar, FileText, TrendingUp, Clock, CheckCircle2, AlertCircle} from 'lucide-react';
import {useState} from 'react';

export default function Dashboard() {
  const {organization} = useAsgardeo();
  const [openCreateUser, setOpenCreateUser] = useState(false);

  const stats = [
    {
      name: 'Active Projects',
      value: '12',
      change: '+2.1%',
      changeType: 'positive',
      icon: FileText,
    },
    {
      name: 'Team Members',
      value: '0',
      change: '+5.4%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Messages Today',
      value: '89',
      change: '+12.5%',
      changeType: 'positive',
      icon: MessageSquare,
    },
    {
      name: 'Meetings This Week',
      value: '7',
      change: '-2.3%',
      changeType: 'negative',
      icon: Calendar,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'Sarah Chen',
      action: 'completed task "Design Review"',
      time: '2 hours ago',
      type: 'completed',
    },
    {
      id: 2,
      user: 'Mike Johnson',
      action: 'created new project "Mobile App"',
      time: '4 hours ago',
      type: 'created',
    },
    {
      id: 3,
      user: 'Emily Davis',
      action: 'scheduled team meeting',
      time: '6 hours ago',
      type: 'scheduled',
    },
    {
      id: 4,
      user: 'Alex Rodriguez',
      action: 'uploaded 3 files to "Q4 Planning"',
      time: '1 day ago',
      type: 'uploaded',
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Review quarterly reports',
      dueDate: 'Today, 3:00 PM',
      priority: 'high',
      project: 'Q4 Planning',
    },
    {
      id: 2,
      title: 'Team standup meeting',
      dueDate: 'Tomorrow, 9:00 AM',
      priority: 'medium',
      project: 'Daily Operations',
    },
    {
      id: 3,
      title: 'Client presentation prep',
      dueDate: 'Friday, 2:00 PM',
      priority: 'high',
      project: 'Client Work',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{' '}
          <User>
            {user => (
              <span>
                {user?.givenName || user?.name?.givenName || user?.given_name}{' '}
                {user?.name?.familyName || user?.familyName || user?.family_name}
              </span>
            )}
          </User>
          !
        </h1>

        <p className="text-gray-600 mt-2">Here's what's happening with @{organization?.orgHandle} today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp
                  className={`h-4 w-4 mr-1 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}
                />
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => setOpenCreateUser(true)}>Crete User</button>

      <CreateUser
        mode="popup"
        popupOpen={openCreateUser}
        profileType={'console'}
        onPopupClose={() => setOpenCreateUser(false)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'completed' && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {activity.type === 'created' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'scheduled' && (
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                    {activity.type === 'uploaded' && (
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-orange-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{task.project}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.dueDate}
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {task.priority === 'high' ? <AlertCircle className="h-3 w-3 inline mr-1" /> : null}
                      {task.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
