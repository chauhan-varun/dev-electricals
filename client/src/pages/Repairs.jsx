import { useState } from 'react';
import { repairs } from '../data/services';
import { WrenchIcon } from '@heroicons/react/24/outline';
import AnimatedInput from '../components/AnimatedInput';

const Repairs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    description: '',
    preferredDate: '',
    preferredTime: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Repair & Maintenance</h1>
        <p className="mt-4 text-lg text-gray-500">
          Expert repair services for all your electrical equipment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Repair Categories */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Our Repair Services</h2>
          <div className="space-y-6">
            {repairs.map((repair) => (
              <div
                key={repair.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
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
              </div>
            ))}
          </div>
        </div>

        {/* Service Request Form */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Schedule a Repair</h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <AnimatedInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <AnimatedInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <AnimatedInput
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Repair Category</label>
              <AnimatedInput
                as="select"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                options={repairs.map(repair => ({
                  value: repair.category,
                  label: repair.category
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Description</label>
              <AnimatedInput
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Please describe the issue you're experiencing..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                <AnimatedInput
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
                <AnimatedInput
                  as="select"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: "", label: "Select time" },
                    { value: "morning", label: "Morning (9AM - 12PM)" },
                    { value: "afternoon", label: "Afternoon (12PM - 4PM)" },
                    { value: "evening", label: "Evening (4PM - 7PM)" }
                  ]}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
            >
              Schedule Repair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Repairs;