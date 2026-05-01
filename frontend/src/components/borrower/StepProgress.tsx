import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  description: string;
}

const steps: Step[] = [
  { label: 'Personal Details', description: 'Eligibility check' },
  { label: 'Salary Slip', description: 'Upload document' },
  { label: 'Loan Config', description: 'Choose amount & tenure' },
];

interface StepProgressProps {
  currentStep: 0 | 1 | 2;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
              i < currentStep ? 'bg-blue-600 border-blue-600 text-white' :
              i === currentStep ? 'border-blue-600 text-blue-600 bg-blue-50' :
              'border-gray-300 text-gray-400 bg-white'
            )}>
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <div className="mt-1.5 text-center hidden sm:block">
              <p className={cn('text-xs font-medium', i <= currentStep ? 'text-gray-900' : 'text-gray-400')}>{step.label}</p>
              <p className="text-xs text-gray-400">{step.description}</p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('h-0.5 w-12 sm:w-20 mx-2 mt-[-18px] sm:mt-[-34px] transition-all', i < currentStep ? 'bg-blue-600' : 'bg-gray-200')} />
          )}
        </div>
      ))}
    </div>
  );
}
