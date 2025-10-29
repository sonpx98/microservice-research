import { User, Briefcase, Code2, Mail, Github, Linkedin } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedTimeline from './components/MilestoneTimeline';
import { ThemeProvider } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import IncomingProject from './components/IncomingProject';

type ProjectType = 'tarot' | 'snake-game' | 'video-editor' | 'interface-generator' | null;

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

const Tarot = createLazyComponent(
  () => import('tarot/app'),
  'Tarot Reader'
);
const SnakeGame = createLazyComponent(
  () => import('snake-game/app'),
  'Snake Game'
);

// Video Editor is not ready yet - show incoming component instead
const VideoEditorIncoming = () => (
  <div className="p-6 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-indigo-900/20 min-h-[500px] flex items-center justify-center">
    <div className="w-full max-w-2xl">
      <IncomingProject
        title="Advanced Video Editor"
        description="A professional web-based video editing platform with cutting-edge features including timeline editing, filters, transitions, and real-time preview. Built with modern web technologies for seamless performance."
        priority="high"
        className="bg-white/95 backdrop-blur-sm shadow-2xl"
      />
    </div>
  </div>
);

const InterfaceGenerator = createLazyComponent(
  () => import('interface-generator/app'),
  'Interface Generator'
);

function App() {
  const [selectedProject, setSelectedProject] = useState<ProjectType>(null);

  const projects = [
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
    },
    {
      id: 'video-editor' as ProjectType,
      title: 'Video Editor',
      description: 'Web-based video editing with cutting tools',
      component: VideoEditorIncoming
    },
    {
      id: 'interface-generator' as ProjectType,
      title: 'Interface Generator',
      description: 'AI-powered interface generation tool',
      component: InterfaceGenerator
    }
  ];

  const handleProjectClick = (projectId: ProjectType) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <ThemeProvider>
      {/* Cosmic Background Container */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Cosmic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
          {/* Nebula effects */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          {/* Floating stars */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
        {/* Theme Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Cosmic Avatar */}
              <motion.div 
                className="w-32 h-32 mx-auto mb-6 relative"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30">
                  <User className="w-16 h-16 text-white" />
                </div>
                {/* Avatar glow */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 blur-2xl opacity-60"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0.3, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
              
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                Welcome to My Portfolio
              </h1>
              <p className="text-xl text-gray-200 dark:text-gray-300 max-w-2xl mx-auto drop-shadow-lg">
                I'm a passionate developer creating innovative solutions with modern technologies. 
                Explore my projects and experience through interactive micro-frontends.
              </p>
            </motion.div>

          <motion.div className="mb-16" >
            <AnimatedTimeline />
          </motion.div>

          {/* Skills Section */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div 
              className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-white/20 dark:border-gray-700/50"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Code2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 drop-shadow-lg" />
              <h3 className="text-xl font-semibold mb-2 text-white">Frontend Development</h3>
              <p className="text-gray-200 dark:text-gray-300">React, TypeScript, Vite, TailwindCSS</p>
            </motion.div>
            
            <motion.div 
              className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-white/20 dark:border-gray-700/50"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Briefcase className="w-12 h-12 text-purple-400 mx-auto mb-4 drop-shadow-lg" />
              <h3 className="text-xl font-semibold mb-2 text-white">Micro-Frontends</h3>
              <p className="text-gray-200 dark:text-gray-300">Module Federation, Independent Deployments</p>
            </motion.div>
            
            <motion.div 
              className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-white/20 dark:border-gray-700/50"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <User className="w-12 h-12 text-pink-400 mx-auto mb-4 drop-shadow-lg" />
              <h3 className="text-xl font-semibold mb-2 text-white">User Experience</h3>
              <p className="text-gray-200 dark:text-gray-300">Responsive Design, Accessibility</p>
            </motion.div>
          </motion.div>

          {/* Projects Preview */}
          <motion.div 
            className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-8 shadow-2xl mb-16 border border-white/20 dark:border-gray-700/50 transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <motion.div 
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md backdrop-blur-sm ${
                    selectedProject === project.id 
                      ? 'border-cyan-400 bg-cyan-500/20 shadow-cyan-500/20 shadow-xl' 
                      : 'border-white/30 dark:border-gray-600/50 hover:border-purple-400/50 dark:hover:border-purple-500/50 bg-white/5 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="font-semibold text-lg mb-2 text-white">{project.title}</h3>
                  <p className="text-gray-200 dark:text-gray-300 text-sm">{project.description}</p>
                  {selectedProject === project.id && (
                    <motion.div 
                      className="mt-2 text-cyan-300 dark:text-cyan-400 text-sm font-medium"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      Click again to close preview
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Project Preview Section */}
          {selectedProject && selectedProjectData && (
            <motion.div 
              className="bg-white/10 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl shadow-2xl mb-16 overflow-hidden border border-white/20 dark:border-gray-700/50 transition-colors duration-300"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white/5 dark:bg-gray-700/30 px-6 py-4 border-b border-white/10 dark:border-gray-600/30 transition-colors duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">
                    Preview: {selectedProjectData.title}
                  </h3>
                  <motion.button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close Preview
                  </motion.button>
                </div>
              </div>
              <div className="p-0">
                <React.Suspense 
                  fallback={
                    <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                    </div>
                  }
                >
                  <selectedProjectData.component />
                </React.Suspense>
              </div>
            </motion.div>
          )}

          {/* Contact Section */}
          <motion.div 
            className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-indigo-900/40 backdrop-blur-lg text-white rounded-xl p-8 border border-white/20 shadow-2xl transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6 drop-shadow-lg">Let's Connect</h2>
            <p className="text-gray-200 dark:text-gray-300 mb-6 drop-shadow">
              Interested in working together? Let's discuss your next project.
            </p>
            <div className="flex justify-center space-x-6">
              <motion.a 
                href="#" 
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="w-5 h-5" />
                <span>Email</span>
              </motion.a>
              <motion.a 
                href="#" 
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </motion.a>
              <motion.a 
                href="#" 
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </ThemeProvider>
  );
}

export default App;