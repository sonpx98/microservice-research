import type { ReadingType } from '../data/readingTypes';

interface BreadcrumbProps {
  currentStep: 'select-type' | 'shuffle' | 'shuffling' | 'spread';
  readingType?: ReadingType;
}

export function Breadcrumb({ currentStep, readingType }: BreadcrumbProps) {
  const steps = [
    { key: 'select-type', label: 'Chọn chủ đề', icon: '🎯' },
    { key: 'shuffle', label: 'Xào bài', icon: '🔄' },
    { key: 'spread', label: 'Giải bài', icon: '🔮' }
  ];

  const getCurrentStepIndex = () => {
    if (currentStep === 'select-type') return 0;
    if (currentStep === 'shuffle' || currentStep === 'shuffling') return 1;
    if (currentStep === 'spread') return 2;
    return 0;
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="tw:flex tw:items-center tw:justify-center tw:mb-6">
      <div className="tw:flex tw:items-center tw:space-x-4">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <div key={step.key} className="tw:flex tw:items-center">
              <div className={`
                tw:flex tw:items-center tw:justify-center tw:w-10 tw:h-10 tw:rounded-full tw:text-sm tw:font-semibold tw:transition-all tw:duration-300
                ${isActive 
                  ? 'tw:bg-purple-600 tw:text-white tw:shadow-lg tw:scale-110' 
                  : isCompleted 
                    ? 'tw:bg-green-500 tw:text-white' 
                    : 'tw:bg-gray-200 tw:text-gray-500'
                }
              `}>
                <span className="tw:text-lg">
                  {isCompleted ? '✓' : step.icon}
                </span>
              </div>
              
              <div className="tw:ml-2 tw:text-center">
                <div className={`tw:text-sm tw:font-medium ${
                  isActive ? 'tw:text-purple-600' : isCompleted ? 'tw:text-green-600' : 'tw:text-gray-500'
                }`}>
                  {step.label}
                </div>
                {step.key === 'select-type' && readingType && (
                  <div className="tw:text-xs tw:text-gray-600 tw:mt-1">
                    {readingType.icon} {readingType.title}
                  </div>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`tw:w-8 tw:h-0.5 tw:mx-4 tw:transition-all tw:duration-300 ${
                  isCompleted ? 'tw:bg-green-300' : 'tw:bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}