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
  const timeRemainingMinutes = assignmentStatus.time_remaining_minutes || 0;

  // Show "View" button if:
  // 1. is_assigned is true
  // 2. is_expired is true
  // 3. time_remaining_minutes < 1
  const showViewOnly = isAssigned || isExpired || timeRemainingMinutes < 1;

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
