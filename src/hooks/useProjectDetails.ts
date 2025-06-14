import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux';
import { fetchProjectDetails, clearProjectDetails } from '@/store/slices/projectDetailsSlice';

export function useProjectDetails(projectId: string) {
  const dispatch = useAppDispatch();
  const { currentProject, projectSprints, projectEpics, projectTickets, loading, error } = 
    useAppSelector((state) => state.projectDetails);
  
  useEffect(() => {
    if (projectId) {
      console.log('Fetching project details for ID:', projectId);
      dispatch(fetchProjectDetails(projectId));
    }
    
    return () => {
      dispatch(clearProjectDetails());
    };
  }, [dispatch, projectId]);
  
  return {
    project: currentProject,
    sprints: projectSprints,
    epics: projectEpics,
    tickets: projectTickets,
    loading,
    error
  };
}