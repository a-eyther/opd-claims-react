import { Navigate } from 'react-router-dom';

/**
 * Dashboard Page
 * Redirects to Edit Management by default
 */
const Dashboard = () => {
  return <Navigate to="/dashboard/edit-management" replace />;
};

export default Dashboard;
