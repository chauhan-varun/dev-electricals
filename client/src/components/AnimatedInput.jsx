import { motion } from 'framer-motion';

const AnimatedInput = ({ type = 'text', label, name, value, onChange, required = false, className = '', as = 'input', options = [], rows = 4, placeholder = '' }) => {
  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10
      }
    },
    blur: {
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  };

  const renderInput = () => {
    const commonProps = {
      name,
      value,
      onChange,
      required,
      placeholder,
      className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary transition-all duration-200 backdrop-blur-sm bg-white/50 ${className}`,
      whileHover: { scale: 1.01 },
      whileFocus: 'focus',
      animate: 'blur',
      variants: inputVariants
    };

    switch (as) {
      case 'textarea':
        return <motion.textarea rows={rows} {...commonProps} />;
      case 'select':
        return (
          <motion.select {...commonProps}>
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </motion.select>
        );
      default:
        return <motion.input type={type} {...commonProps} />;
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {renderInput()}
    </div>
  );
};

export default AnimatedInput;