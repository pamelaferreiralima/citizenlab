import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import ProposalsCard from '../components/ProposalsCard';
import { StatCardProps } from '../hooks/useStatCard/typings';

export default ({ ...props }: StatCardProps) => {
  const proposalsActive = useFeatureFlag({ name: 'initiatives' });

  return null; // Disabled until translations arrive
  if (!proposalsActive) return null;

  return <ProposalsCard {...props} />;
};
