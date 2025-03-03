import { Link } from 'react-router-dom';
import { services } from '../data/services';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const Services = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
            <p className="text-gray-500 mt-2">{service.description}</p>
            <Link
              to="/schedule-repair" // Link to the Schedule Repair page
              className="mt-4 inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark"
            >
              Schedule Service
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services; 