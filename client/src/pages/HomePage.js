import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useGetClinicianTypesQuery } from '../app/apiSlice';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StarRating from '../components/common/StarRating';

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #003087; // NHS Blue
  border-bottom: 2px solid #e8edee;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #4c6272; // NHS Grey
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
  transition: box-shadow 0.3s, border-color 0.3s;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: #005eb8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-decoration: none;
  }
`;

const ModelImagePlaceholder = styled.div`
  width: 100%;
  height: 150px;
  background-color: #f0f4f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
  font-style: italic;
  margin-bottom: 1rem;
`;

const ModelName = styled.h3`
  font-size: 1.25rem;
  color: #005eb8;
  margin: 0 0 0.5rem 0;
`;

const ModelRating = styled.div`
  margin-top: auto; // Pushes rating to the bottom
  padding-top: 1rem;
`;


const HomePage = () => {
  const {
    data: clinicianTypes,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetClinicianTypesQuery();

  let content;

  if (isLoading) {
    content = <Spinner />;
  } else if (isSuccess) {
    content = clinicianTypes.map(type => (
      <Section key={type.id}>
        <SectionTitle>{type.name}</SectionTitle>
        {type.ai_models.length > 0 ? (
          <ModelGrid>
            {type.ai_models.map(model => (
              <ModelCard key={model.id} to={`/ai-models/${model.id}`}>
                <ModelImagePlaceholder>
                  Model Image Placeholder
                </ModelImagePlaceholder>
                <ModelName>{model.name}</ModelName>
                {/* We need to fetch the average_rating or pass it from the API */}
                <ModelRating>
                  {/* Assuming the API can provide avg_rating here in the future */}
                  {/* For now, this will show "No rating" */}
                  <StarRating rating={model.average_rating} />
                </ModelRating>
              </ModelCard>
            ))}
          </ModelGrid>
        ) : (
          <p>No models available for this specialty yet.</p>
        )}
      </Section>
    ));
  } else if (isError) {
    console.error('Failed to load clinician types:', error);
    content = <ErrorMessage>Failed to load data. Please try again later.</ErrorMessage>;
  }

  return (
    <div>
      <PageTitle>AI Model Catalogue</PageTitle>
      {content}
    </div>
  );
};

export default HomePage;