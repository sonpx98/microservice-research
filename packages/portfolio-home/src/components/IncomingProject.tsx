import React from 'react';

interface IncomingProjectProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
  priority?: 'low' | 'medium' | 'high';
  className?: string;
}

const IncomingProject: React.FC<IncomingProjectProps> = ({
  title = "New Project Coming Soon",
  description = "An exciting new project is in development and will be available soon.",
  estimatedTime = "Coming Soon",
  priority = 'medium',
  className = ''
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-red-500 to-orange-500';
      case 'medium':
        return 'from-blue-500 to-purple-500';
      case 'low':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 ${className}`}>
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getPriorityColor(priority)} opacity-5`} />
      
      {/* Content */}
      <div className="relative p-8">
        {/* Header with icon and priority badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Animated icon */}
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${getPriorityColor(priority)} p-0.5`}>
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-gray-700 animate-pulse" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                  />
                </svg>
              </div>
            </div>
            
            {/* Project info */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">Status: In Development</p>
            </div>
          </div>
          
          {/* Priority badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadgeColor(priority)}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Development Progress</span>
            <span className="text-sm text-gray-500">25%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full bg-gradient-to-r ${getPriorityColor(priority)} transition-all duration-500`} style={{ width: '25%' }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{estimatedTime}</span>
          </div>
        </div>

        {/* Notification bell animation */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-gray-100 to-transparent rounded-full transform translate-x-16 translate-y-16" />
      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-transparent rounded-full transform -translate-x-10 -translate-y-10" />
    </div>
  );
};

export default IncomingProject;