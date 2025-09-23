import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdjudicationPage = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new workflow
    navigate(`/claim/${claimId}/edit`);
  }, [claimId, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Redirecting to claim editor...</p>
    </div>
  );
};

export default AdjudicationPage;