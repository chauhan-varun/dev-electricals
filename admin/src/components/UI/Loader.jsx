import { FadeLoader } from 'react-spinners';

// Primary color for the admin dashboard - red
const PRIMARY_COLOR = '#dc2626'; // Tailwind red-600

/**
 * Reusable loader component that uses FadeLoader from react-spinners
 * with a red color theme for the admin dashboard
 */
const Loader = ({ size = 15, color = PRIMARY_COLOR, loading = true, className = '' }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <FadeLoader color={color} loading={loading} height={size} width={size/5} radius={2} margin={2} />
    </div>
  );
};

export default Loader;
