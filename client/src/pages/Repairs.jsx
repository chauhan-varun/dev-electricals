import { useState } from 'react';
import { repairs } from '../data/services';
import { WrenchIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Repairs = () => {
  const navigate = useNavigate();

  const handleRepairCardClick = (category) => {
    navigate('/schedule-repair', { state: { repairType: category } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Repair & Maintenance</h1>
        <p className="mt-4 text-lg text-gray-500">
          Expert repair services for all your electrical equipment
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Repair Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repairs.map((repair) => (
            <div
              key={repair.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleRepairCardClick(repair.category)}
            >
              <div className="flex items-center mb-4">
                <WrenchIcon className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">{repair.category}</h3>
              </div>
              <p className="text-gray-600 mb-4">{repair.description}</p>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">Common Issues:</p>
                <ul className="list-disc list-inside text-gray-600">
                  {repair.commonIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 text-xl font-bold text-primary">{repair.price}</p>
              <button 
                className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
              >
                Schedule Repair
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Repairs;