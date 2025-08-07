import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { specialtySelected } from '../features/ui/uiSlice';
import { useGetClinicianTypesQuery } from '../app/apiSlice';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StarRating from '../components/common/StarRating';

const SearchIcon = (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
    </svg>
);

const CatalogueLayout = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
  height: 100%;
  width: 100%;
`;

const Sidebar = styled.aside`
  background-color: #f0f4f5;
  border-right: 1px solid #e8edee;
  padding: 1.5rem 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SidebarTitle = styled.h2`
  font-size: 1.25rem;
  color: #003087;
  padding: 0 1.5rem 1rem 1.5rem;
  margin: 0;
  border-bottom: 1px solid #e8edee;
`;

const SearchContainer = styled.div`
  padding: 0.75rem 1.5rem;
  position: relative;
  flex-shrink: 0;
  
  svg {
    position: absolute;
    top: 50%;
    left: 2.25rem;
    transform: translateY(-50%);
    color: #5f6368;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border-radius: 20px;
  border: none;
  background-color: #dde3ea;
  font-size: 0.9rem;

  &:focus {
    outline: 2px solid #005eb8;
  }
`;

const SpecialtyList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
`;

const SpecialtyListItem = styled.li`
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-weight: ${({ isActive }) => (isActive ? 'bold' : 'normal')};
  background-color: ${({ isActive }) => (isActive ? '#fff' : 'transparent')};
  border-right: ${({ isActive }) => (isActive ? '3px solid #005eb8' : 'none')};
  color: ${({ isActive }) => (isActive ? '#005eb8' : '#4c6272')};
  transition: background-color 0.2s;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background-color: #e8edee;
  }
`;

const MainContent = styled.main`
  padding: 1rem 2rem 1rem 0;
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

const FineTunedTag = styled.div`
  display: inline-block;
  background-color: #e8f5e9;
  color: #2e7d32;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  margin-top: 0.5rem;
  width: fit-content;
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-top: 1px solid #e8edee;
  flex-shrink: 0;

  button {
    background: none;
    border: 1px solid #005eb8;
    color: #005eb8;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const PageInfo = styled.span`
  font-size: 0.8rem;
  color: #5f6368;
`;

const ModelCataloguePage = () => {
  const dispatch = useDispatch();
  const { selectedSpecialtyId } = useSelector((state) => state.ui);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: clinicianTypesResponse,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetClinicianTypesQuery(currentPage);

  const { data: clinicianTypes = [], pagination } = clinicianTypesResponse || {};

  useEffect(() => {
    if (isSuccess && clinicianTypes && clinicianTypes.length > 0 && !selectedSpecialtyId) {
      dispatch(specialtySelected(clinicianTypes[0].id));
    }
  }, [isSuccess, clinicianTypes, selectedSpecialtyId, dispatch]);

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.total_pages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <ErrorMessage>Error: {JSON.stringify(error)}</ErrorMessage>;
  }
  
  const filteredClinicianTypes = clinicianTypes?.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedSpecialty = clinicianTypes?.find(type => type.id === selectedSpecialtyId);

  return (
    <div style={{
        position: 'fixed',
        top: '70px',
        left: '0',
        width: '100vw',
        height: 'calc(100vh - 70px)',
    }}>
      <CatalogueLayout>
        <Sidebar>
          <SidebarTitle>Clinicians</SidebarTitle>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search clinicians"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <SpecialtyList>
            {filteredClinicianTypes?.map(type => (
              <SpecialtyListItem
                key={type.id}
                isActive={selectedSpecialtyId === type.id}
                onClick={() => dispatch(specialtySelected(type.id))}
              >
                {type.name}
              </SpecialtyListItem>
            ))}
          </SpecialtyList>
          {pagination && pagination.total_pages > 1 && (
            <PaginationControls>
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Prev
              </button>
              <PageInfo>Page {pagination.current_page} of {pagination.total_pages}</PageInfo>
              <button onClick={handleNextPage} disabled={currentPage === pagination.total_pages}>
                Next
              </button>
            </PaginationControls>
          )}
        </Sidebar>
        <MainContent>
          <h2>Select Model</h2>
          {selectedSpecialty ? (
            <>
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
                        {model.base_model && <FineTunedTag>Fine-Tuned</FineTunedTag>}
                        <p></p>
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
