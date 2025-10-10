import { User, Briefcase, Code2, Mail, Github, Linkedin } from 'lucide-react';
import React, { useState } from 'react';

type ProjectType = 'flash-card-fav' | 'tarot' | 'snake-game' | null;

// Fallback components for when remotes are not available
const RemoteUnavailable = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-96 bg-gray-50">
    <div className="text-gray-500 mb-4">
      <Code2 className="w-16 h-16 mx-auto mb-2" />
    </div>
    <h3 className="text-xl font-semibold text-gray-600 mb-2">{title}</h3>
    <p className="text-gray-500 text-center max-w-md">
      This micro-frontend is currently not running. 
      <br />
      Start all services with <code className="bg-gray-200 px-2 py-1 rounded text-sm">pnpm start:all</code> to see the preview.
    </p>
  </div>
);

// Lazy load micro-frontends with fallback
const createLazyComponent = (importFn: () => Promise<{ default: React.ComponentType }>, title: string) => {
  return React.lazy(async () => {
    try {
      return await importFn();
    } catch {
      // Return fallback component if remote is not available
      return {
        default: () => <RemoteUnavailable title={title} />
      };
    }
  });
};

const FlashCardFav = createLazyComponent(
  () => import('flash-card-fav/app'),
  'Flash Card App'
);
const Tarot = createLazyComponent(
  () => import('tarot/app'),
  'Tarot Reader'
);
const SnakeGame = createLazyComponent(
  () => import('snake-game/app'),
  'Snake Game'
);

function App() {
  const [selectedProject, setSelectedProject] = useState<ProjectType>(null);

  const projects = [
    {
      id: 'flash-card-fav' as ProjectType,
      title: 'Flash Card App',
      description: 'Interactive learning with flashcards',
      component: FlashCardFav
    },
    {
      id: 'tarot' as ProjectType,
      title: 'Tarot Reader',
      description: 'Digital tarot card reading experience',
      component: Tarot
    },
    {
      id: 'snake-game' as ProjectType,
      title: 'Snake Game',
      description: 'Classic snake game with simple controls',
      component: SnakeGame
    }
  ];

  const handleProjectClick = (projectId: ProjectType) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <User className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to My Portfolio
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              I'm a passionate developer creating innovative solutions with modern technologies. 
              Explore my projects and experience through interactive micro-frontends.
            </p>
          </div>

          {/* Skills Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <Code2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Frontend Development</h3>
              <p className="text-gray-600">React, TypeScript, Vite, TailwindCSS</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <Briefcase className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Micro-Frontends</h3>
              <p className="text-gray-600">Module Federation, Independent Deployments</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <User className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">User Experience</h3>
              <p className="text-gray-600">Responsive Design, Accessibility</p>
            </div>
          </div>

          {/* Projects Preview */}
          <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedProject === project.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm">{project.description}</p>
                  {selectedProject === project.id && (
                    <div className="mt-2 text-blue-600 text-sm font-medium">
                      Click again to close preview
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Project Preview Section */}
          {selectedProject && selectedProjectData && (
            <div className="bg-white rounded-lg shadow-lg mb-16 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Preview: {selectedProjectData.title}
                  </h3>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
              <div className="p-0">
                <React.Suspense 
                  fallback={
                    <div className="flex items-center justify-center h-96">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  }
                >
                  <selectedProjectData.component />
                </React.Suspense>
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="bg-gray-900 text-white rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Let's Connect</h2>
            <p className="text-gray-300 mb-6">
              Interested in working together? Let's discuss your next project.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                <Mail className="w-5 h-5" />
                <span>Email</span>
              </a>
              <a href="#" className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a href="#" className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;