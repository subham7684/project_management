"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProjectDetails from '@/components/page/projects/projectDetails';
import { useAppDispatch } from '@/lib/hooks/redux';
import { fetchProjectDetails } from '@/store/slices/projectDetailsSlice';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (projectId) {
      console.log('Initializing project details fetch for ID:', projectId);
      dispatch(fetchProjectDetails(projectId));
    }
  }, [dispatch, projectId]);
  
  return <ProjectDetails projectId={projectId} />;
}