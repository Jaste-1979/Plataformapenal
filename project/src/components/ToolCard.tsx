import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-left w-full"
    >
      <div className="flex items-start space-x-4">
        <div className="bg-indigo-100 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
};