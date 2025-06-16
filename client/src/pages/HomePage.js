import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useGetClinicianTypesQuery } from '../app/apiSlice';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const ModelList = styled.ul`
  list-style-type: none;
  padding-left: 0;
`;

const ModelListItem = styled.li`
  margin-bottom: 0.5rem;
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
        <h2>{type.name}</h2>
        <ModelList>
          {type.ai_models.map(model => (
            <ModelListItem key={model.id}>
              <Link to={`/ai-models/${model.id}`}>{model.name}</Link>
            </ModelListItem>
          ))}
        </ModelList>
      </Section>
    ));
  } else if (isError) {
    // FIX: Stringify the error object to see its contents
    content = <ErrorMessage>{JSON.stringify(error)}</ErrorMessage>;
  }

  return <div>{content}</div>;
};

export default HomePage;