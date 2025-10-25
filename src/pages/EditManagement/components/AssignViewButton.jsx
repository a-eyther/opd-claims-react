import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSelectedClaim } from '../../../store/slices/claimsSlice';

/**
 * AssignViewButton Component
 * Displays "Assign & View" or "View" button based on assignment status
 */
const AssignViewButton = ({ row }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const assignmentStatus = row.assignment_status || {};
  const isAssigned = assignmentStatus.is_assigned;
  const isExpired = assignmentStatus.is_expired;
  const createdAt = row.created_at;

  // Calculate time remaining from created_at
  let isTimeExpired = false;
  if (createdAt) {
    const createdAtDate = new Date(createdAt);
    const currentDate = new Date();
    const elapsedSeconds = Math.floor((currentDate - createdAtDate) / 1000);
    const totalSeconds = 11000 * 60; // 11000 minutes
    const remainingSeconds = totalSeconds - elapsedSeconds;

    // Time expired if remaining seconds <= 0
    isTimeExpired = remainingSeconds <= 0;
  }

  // Show "View" button if:
  // 1. is_assigned is true
  // 2. is_expired is true
  // 3. Time calculated from created_at has expired (>= 10 minutes)
  const showViewOnly = isAssigned || isExpired || isTimeExpired;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Store claim data in Redux before navigation
    dispatch(setSelectedClaim(row));

    // Navigate to claim page
    navigate(`/claim/${row.claim_unique_id}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-white bg-[#4472C4] rounded hover:bg-[#3a5fa8] transition-colors"
      >
        {showViewOnly ? 'View' : 'Assign & View'}
      </button>
    </div>
  );
};

export default AssignViewButton;
