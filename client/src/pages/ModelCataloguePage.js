import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
// Import Redux hooks and the new action
import { useSelector, useDispatch } from 'react-redux';
import { specialtySelected } from '../features/ui/uiSlice';
import { useGetClinicianTypesQuery } from '../app/apiSlice';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StarRating from '../components/common/StarRating';

// ... (All styled-components remain the same, no changes needed here)
const CatalogueLayout = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
  height: calc(100vh - 120px);
  width: 100%;
`;
const Sidebar = styled.aside`
  background-color: #f0f4f5;
  border-right: 1px solid #e8edee;
  padding: 1.5rem 0;
  overflow-y: auto;
`;
const SidebarTitle = styled.h2`
  font-size: 1.25rem;
  color: #003087;
  padding: 0 1.5rem 1rem 1.5rem;
  margin: 0;
  border-bottom: 1px solid #e8edee;
`;
const SpecialtyList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;
const SpecialtyListItem = styled.li`
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: ${({ isActive }) => (isActive ? 'bold' : 'normal')};
  background-color: ${({ isActive }) => (isActive ? '#fff' : 'transparent')};
  border-right: ${({ isActive }) => (isActive ? '3px solid #005eb8' : 'none')};
  color: ${({ isActive }) => (isActive ? '#005eb8' : '#4c6272')};
  transition: background-color 0.2s;
  &:hover {
    background-color: #e8edee;
  }
`;
const MainContent = styled.main`
  padding: 1rem 0;
  overflow-y: auto;
  width: 100%;
`;
const ContentHeader = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
  h1 {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
  }
`;
const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;
const ModelCard = styled(Link)`
  background-color: #fff;
  border: 1px solid #e8edee;
  border-radius: 4px;
  padding: 1.5rem;
  text-decoration: none;
  color: #333;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 150px;
  transition: box-shadow 0.3s, border-color 0.3s;
  &:hover {
    border-color: #005eb8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-decoration: none; 
  }
`;
const ModelName = styled.h3`
  font-size: 1.25rem;
  color: #005eb8;
  margin: 0 0 0.5rem 0;
`;
const ModelDescription = styled.p`
    font-size: 0.9rem;
    color: #4c6272;
    margin: 0 0 1rem 0;
    line-height: 1.4;
`;


const ModelCataloguePage = () => {
  // --- STATE MANAGEMENT REFACTORED TO USE REDUX ---
  const dispatch = useDispatch();
  const { selectedSpecialtyId } = useSelector((state) => state.ui);

  const {
    data: clinicianTypes,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetClinicianTypesQuery();

  // Effect to select the first specialty by default, but ONLY if one isn't already selected in the store
  useEffect(() => {
    if (isSuccess && clinicianTypes && clinicianTypes.length > 0 && !selectedSpecialtyId) {
      dispatch(specialtySelected(clinicianTypes[0].id));
    }
  }, [isSuccess, clinicianTypes, selectedSpecialtyId, dispatch]);

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <ErrorMessage>Error: {JSON.stringify(error)}</ErrorMessage>;
  }

  // Find the full specialty object from the fetched data using the ID from the store
  const selectedSpecialty = clinicianTypes?.find(type => type.id === selectedSpecialtyId);

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <CatalogueLayout>
        <Sidebar>
          <SidebarTitle>Clinical Specialties</SidebarTitle>
          <SpecialtyList>
            {clinicianTypes?.map(type => (
              <SpecialtyListItem
                key={type.id}
                isActive={selectedSpecialtyId === type.id}
                // Dispatch an action to update the selected ID in the Redux store
                onClick={() => dispatch(specialtySelected(type.id))}
              >
                {type.name}
              </SpecialtyListItem>
            ))}
          </SpecialtyList>
        </Sidebar>
        <MainContent>
          {selectedSpecialty ? (
            <>
              <ContentHeader>
                <h1>{selectedSpecialty.name}</h1>
                <p>Browse and select a model to view more details.</p>
              </ContentHeader>
              <ModelGrid>
                {selectedSpecialty.ai_models.length > 0 ? (
                  selectedSpecialty.ai_models.map(model => (
                    <ModelCard key={model.id} to={`/ai-models/${model.id}`}>
                      <div>
                        <ModelName>{model.name}</ModelName>
                        <ModelDescription>
                          {model.description
                            ? `${model.description.substring(0, 100)}...`
                            : 'No description available.'}
                        </ModelDescription>
                      </div>
                      <StarRating rating={model.average_rating} />
                    </ModelCard>
                  ))
                ) : (
                  <p>No AI models are available for this specialty yet.</p>
                )}
              </ModelGrid>
            </>
          ) : (
             <ContentHeader>
              <h1>Select a specialty</h1>
              <p>Choose a clinical specialty from the list on the left to see available AI models.</p>
            </ContentHeader>
          )}
        </MainContent>
      </CatalogueLayout>
    </div>
  );
};

export default ModelCataloguePage;