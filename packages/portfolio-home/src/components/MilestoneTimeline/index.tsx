import React, { useRef, useMemo, useState, useLayoutEffect } from 'react';
import { motion, useScroll, useInView, MotionValue } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { PlanetComponents, type PlanetType } from './PlanetIcons';

interface Milestone {
  id: string;
  date: Date;
  title: string;
  company: string;
  role: string;
  description: string;
  achievements?: string[];
  technologies?: string[];
  planetColor: string;
  planetType: PlanetType;
}

const careerMilestones: Milestone[] = [
  {
    id: '2024',
    date: new Date('2024-06-01'),
    title: 'Frontend Developer',
    company: 'Singtel',
    role: 'Frontend Developer',
    description: 'Leading frontend development initiatives for telecommunications platform, working remotely from Singapore.',
    achievements: [
      'Architecting scalable frontend solutions for telecom services',
      'Implementing modern React patterns and performance optimizations',
      'Collaborating with distributed teams across APAC region',
      'Driving technical excellence in frontend practices'
    ],
    technologies: ['React', 'TypeScript', 'Modern Frontend Stack'],
    planetColor: 'from-purple-400 to-pink-600',
    planetType: 'earth'
  },
  {
    id: '2023',
    date: new Date('2022-04-01'),
    title: 'Full-stack Developer',
    company: 'FileString',
    role: 'Full-stack Developer',
    description: 'Built and scaled learning management system serving 15-member team, focusing on microservices architecture and real-time features.',
    achievements: [
      'Architected component libraries for course cards, lesson player, and quiz system using React and Material UI',
      'Implemented microservices with gRPC and Redis for real-time learning experience',
      'Led code reviews for junior developers, establishing React best practices',
      'Orchestrated K8s deployments on AWS with PostgreSQL backend',
      'Collaborated in sprint planning to break down technical requirements',
      'Maintained stable learning platform by debugging QA-reported issues'
    ],
    technologies: ['Node.js', 'React', 'Redux Observable', 'gRPC', 'Kubernetes', 'Redis', 'AWS', 'PostgreSQL', 'Material UI'],
    planetColor: 'from-blue-400 to-cyan-600',
    planetType: 'tech'
  },
  {
    id: '2022',
    date: new Date('2021-01-01'),
    title: 'WMT Fullstack Developer',
    company: 'Gameloft',
    role: 'Fullstack Developer',
    description: 'Developed web marketing and content management system for 20-member team, building scalable campaign infrastructure.',
    achievements: [
      'Built RESTful APIs with Node.js and Express.js implementing error handling and validation',
      'Developed responsive marketing campaign pages with React and Bootstrap',
      'Created reusable CMS components for business users to manage content',
      'Architected contest management and launch system',
      'Streamlined content management workflows for marketing team'
    ],
    technologies: ['Node.js', 'React', 'Bootstrap', 'MongoDB', 'MySQL', 'AWS', 'Express.js'],
    planetColor: 'from-orange-400 to-red-600',
    planetType: 'game'
  },
  {
    id: '2021',
    date: new Date('2020-03-01'),
    title: 'SFCC Developer',
    company: 'GNT Việt Nam - Careers & Life',
    role: 'Salesforce Commerce Cloud Developer',
    description: 'Specialized in e-commerce platform development with 3-member team, implementing end-to-end shopping experiences on SFCC.',
    achievements: [
      'Developed and maintained e-commerce features including product catalog, cart, and checkout flow',
      'Integrated payment gateways and discount rules via Salesforce Business Manager',
      'Built customer-oriented promotional campaigns',
      'Debugged and resolved critical shopping cart and product detail issues',
      'Monitored and optimized site performance',
      'Configured business requirements in SFCC platform'
    ],
    technologies: ['Salesforce Commerce Cloud', 'Node.js', 'JavaScript', 'Business Manager'],
    planetColor: 'from-green-400 to-emerald-600',
    planetType: 'commerce'
  },
  {
    id: '2020',
    date: new Date('2016-09-01'),
    title: 'Education',
    company: 'VNUHCM - University of Science',
    role: "Bachelor's Degree, Information Technology",
    description: 'Completed undergraduate studies in Information Technology, building foundation in computer science and software engineering.',
    achievements: [
      'Graduated with Bachelor\'s degree in Information Technology',
      'Mastered core CS fundamentals and web development',
      'Built academic projects using modern JavaScript stack',
      'Developed problem-solving and algorithmic thinking skills'
    ],
    technologies: ['JavaScript', 'Node.js', 'React', 'Computer Science Fundamentals'],
    planetColor: 'from-indigo-400 to-purple-600',
    planetType: 'education'
  }
];

// Generate sine wave path
const generateSineWavePath = (numMilestones: number, containerHeight: number, amplitude = 150) => {
  const segments = 100;
  let pathData = 'M 0 0';
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * containerHeight;
    const periods = numMilestones;
    const x = amplitude * Math.sin(t * periods * Math.PI);

    pathData += ` L ${x} ${y}`;
  }

  return pathData;
};

// Spaceship component
const Spaceship = ({ 
  pathRef, 
  progress,
  containerHeight 
}: { 
  pathRef: React.RefObject<SVGPathElement | null>;
  progress: MotionValue<number>;
  containerHeight: number;
}) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0, angle: 0 });
  
  React.useEffect(() => {
    if (!pathRef.current || containerHeight === 0) return;
    
    const unsubscribe = progress.on('change', (latest: number) => {
      const path = pathRef.current;
      if (!path) return;
      
      try {
        const length = path.getTotalLength();
        const point = path.getPointAtLength(latest * length);
        
        const nextPoint = path.getPointAtLength(Math.min(latest * length + 5, length));
        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
        
        setPosition({ x: point.x, y: point.y, angle: angle + 90 });
      } catch {
        // Path not ready yet
      }
    });
    
    return () => unsubscribe();
  }, [pathRef, progress, containerHeight]);
  
  return (
    <motion.div
      className="absolute z-20 pointer-events-none"
      style={{ 
        left: '50%',
        top: 0,
        x: position.x,
        y: position.y,
      }}
    >
      <motion.div
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-4xl filter drop-shadow-2xl -translate-x-1/2 -translate-y-1/2"
      >
        🛸
      </motion.div>
      {/* UFO glow effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-400 opacity-20 rounded-full blur-md"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

// Stars background
const StarsBackground = () => {
  const stars = useMemo(() => 
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
};

// Planet Milestone
const PlanetMilestone = ({ 
  milestone, 
  index,
  isLeft
}: {
  milestone: Milestone;
  index: number;
  isLeft: boolean;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <div
      ref={ref}
      className={`
        relative flex items-center
        ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}
      `}
    >
      {/* Planet */}
      <motion.div 
        className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
        transition={{ 
          duration: 0.8, 
          delay: index * 0.2,
          type: "spring",
          stiffness: 200,
          damping: 15
        }}
      >
        <div className="relative">
          {/* Planet body */}
          <motion.div
            className="w-20 h-20 flex items-center justify-center"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {React.createElement(PlanetComponents[milestone.planetType], {
              size: 80,
              className: 'drop-shadow-2xl'
            })}
          </motion.div>
          
          {/* Planet glow */}
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${milestone.planetColor} blur-2xl opacity-60`}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />
          
          {/* Orbit ring */}
          <motion.div
            className="absolute inset-0 -m-6 rounded-full border-2 border-dashed border-white/20"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {/* Small orbiting satellite */}
            <motion.div
              className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
              style={{ originX: 0.5, originY: 12 }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Content card */}
      <motion.div
        className={`
          w-full md:w-5/12 ml-28 md:ml-0
          ${isLeft ? 'md:pr-20' : 'md:pl-20'}
        `}
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -50 : 50 }}
        transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
      >
        <motion.article
          className="p-6 rounded-2xl backdrop-blur-xl shadow-2xl transition-all duration-300 bg-white/10 border border-white/15 hover:border-white/25 hover:bg-white/15 dark:bg-gradient-to-br dark:from-indigo-950/90 dark:to-purple-950/90 dark:border-purple-500/20 dark:hover:border-purple-400/40"
          style={{
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="mb-4">
            <motion.time 
              className="text-sm font-semibold text-white dark:text-cyan-400"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: index * 0.2 + 0.5 }}
            >
              {new Intl.DateTimeFormat('en-US', { 
                year: 'numeric', 
                month: 'long' 
              }).format(milestone.date)}
            </motion.time>
            <h3 className="text-2xl font-bold mt-1 text-white dark:text-white">
              {milestone.role}
            </h3>
            <p className="font-medium text-lg text-gray-200 dark:text-purple-300">
              {milestone.company}
            </p>
          </div>

          {/* Description */}
          <p className="mb-4 leading-relaxed text-gray-100 dark:text-gray-300">
            {milestone.description}
          </p>

          {/* Achievements */}
          {milestone.achievements && milestone.achievements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center text-gray-200 dark:text-purple-300">
                <span className="mr-2">⭐</span>
                Key Achievements
              </h4>
              <ul className="space-y-2">
                {milestone.achievements.map((achievement, i) => (
                  <motion.li
                    key={i}
                    className="text-sm flex items-start text-gray-100 dark:text-gray-300"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.2 + 0.6 + i * 0.1 }}
                  >
                    <span className="text-green-400 mr-2 flex-shrink-0">✓</span>
                    <span>{achievement}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Technologies */}
          {milestone.technologies && milestone.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {milestone.technologies.map((tech, i) => (
                <motion.span
                  key={tech}
                  className="px-3 py-1 text-xs font-medium rounded-full backdrop-blur-md transition-all bg-white/15 text-white dark:bg-purple-500/20 dark:text-purple-200 border border-white/20 hover:bg-white/25 hover:border-white/30 dark:border-purple-400/30 dark:hover:bg-purple-500/30"
                  style={{
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.1)',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.2 + 0.7 + i * 0.05 }}
                  whileHover={{ 
                    scale: 1.1,
                  }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          )}
        </motion.article>
      </motion.div>
    </div>
  );
};

export default function SpaceTimeline() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Measure actual timeline height
  useLayoutEffect(() => {
    if (!timelineRef.current) return;
    
    const updateHeight = () => {
      const height = timelineRef.current?.offsetHeight || 0;
      setContainerHeight(height);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Generate path based on measured height
  const pathData = useMemo(() => {
    if (containerHeight === 0) return 'M 0 0';
    return generateSineWavePath(careerMilestones.length, containerHeight, 150);
  }, [containerHeight]);

  return (
    <div 
      className="min-h-screen py-20 px-4 relative overflow-hidden rounded-xl backdrop-blur-2xl border border-gray-300/20 dark:border-white/10 transition-all duration-300"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, rgba(67, 56, 202, 0.3) 0%, rgba(147, 51, 234, 0.25) 35%, rgba(15, 23, 42, 0.4) 100%)'
          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.06) 35%, rgba(148, 163, 184, 0.12) 100%)',
        backdropFilter: 'blur(25px)',
        boxShadow: theme === 'dark'
          ? '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Stars background */}
      <StarsBackground />
      
      <div className="max-w-6xl mx-auto relative z-10" ref={containerRef}>


        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Hidden SVG path - only used for spaceship calculation */}
          {containerHeight > 0 && (
            <svg 
              className="absolute left-8 md:left-1/2 top-0 pointer-events-none opacity-0"
              style={{ 
                zIndex: 5,
                width: '300px',
                height: `${containerHeight}px`,
                transform: 'translateX(-150px)'
              }}
            >
              <path
                ref={pathRef}
                d={pathData}
                fill="none"
                stroke="transparent"
                strokeWidth="3"
                style={{ 
                  'transform': 'translateX(-150px)',
                }}
              />
            </svg>
          )}

          {/* Spaceship following the invisible path */}
          {containerHeight > 0 && (
            <Spaceship 
              pathRef={pathRef} 
              progress={scrollYProgress}
              containerHeight={containerHeight}
            />
          )}

          {/* Milestones */}
          <div className="space-y-32">
            {careerMilestones.map((milestone, index) => (
              <PlanetMilestone
                key={milestone.id}
                milestone={milestone}
                index={index}
                isLeft={index % 2 === 0}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-32 text-purple-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >

        </motion.div>
      </div>
    </div>
  );
}