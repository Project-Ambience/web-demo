import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useGetInterRaterFineTuneQuery, useGetAiModelByIdQuery } from '../app/apiSlice';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

const PageLayout = styled.div`
  padding: 2rem 3rem 4rem;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
`;

const WhiteContainer = styled.div`
  background-color: #fff;
  padding: 2rem;
  border: 1px solid #e8edee;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const Card = styled.div`
  background-color: #fff;
  border: 1px solid #e8edee;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const CardTitle = styled.h4`
  color: #005eb8;
  margin-bottom: 1rem;
`;

const CardContent = styled.div`
  margin-bottom: 0.75rem;
  p {
    margin: 0.25rem 0;
    line-height: 1.5;
  }
`;

const BackLink = styled(Link)`
  display: inline-block;
  font-weight: bold;
  color: #005eb8;
  text-decoration: none;
  margin-bottom: 1.5rem;

  &:before {
    content: '‹ ';
    font-size: 1.2rem;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const PageHeader = styled.div`
  h2 {
    font-size: 2rem;
    color: #333;
    margin: 0;
  }

  p {
    color: #4c6272;
    margin-top: 0.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  border: 2px dashed #d1d9de;
  border-radius: 8px;
  background-color: #f9fbfc;

  h3 {
    color: #4c6272;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: #777;
    font-size: 1.1rem;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const PageButton = styled.button`
  background-color: ${({ active }) => (active ? '#005eb8' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#005eb8')};
  border: 1px solid #005eb8;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #e8edee;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FileAttachmentBubble = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f0f4f5; 
  border-radius: 16px; 
  padding: 0.5rem 1rem;
  margin: 0.5rem 0 1rem;
  width: fit-content;
  text-decoration: none;
  font-size: 0.9rem;
  color: #005eb8;
  border: 1px solid #e8edee;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e1e8ed;
  }
`;

const InterRaterPage = () => {
  const { id: ai_model_id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const {
    data: evaluations,
    isLoading,
    isError,
    error
  } = useGetInterRaterFineTuneQuery(ai_model_id);

  const {
    data: model,
    isLoading: isModelLoading
  } = useGetAiModelByIdQuery(ai_model_id);

  const totalItems = evaluations?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = evaluations?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageLayout>
      <BackLink to={`/ai-models/${ai_model_id}`}>Back to Model</BackLink>
      <WhiteContainer>
        <PageWrapper>
          <PageHeader>
            <h2>Model Evaluation</h2>
            <p></p>
            {!isModelLoading && model && (
              <>
                <p><strong>Model:</strong> {model.name}</p>
                {model.base_model && (
                  <p><strong>Base Model:</strong> {model.base_model.name}</p>
                )}
              </>
            )}
          </PageHeader>

          {isLoading || isModelLoading ? (
            <Spinner />
          ) : isError ? (
            <ErrorMessage>
              {error?.data?.message || "Failed to fetch evaluation data."}
            </ErrorMessage>
          ) : !evaluations || evaluations.length === 0 ? (
            <EmptyState>
              <h3>No Evaluation Data</h3>
              <p>This model does not have any completed evaluation conversations yet.</p>
            </EmptyState>
          ) : (
            <>
              <CardGrid>
                {paginatedData.map(({ id, prompt, response, response_base_model, file_url, file_name }) => (
                  <Card key={id}>
                    <CardTitle>Conversation ID: {id}</CardTitle>
                    <CardContent>
                      <p><strong>Prompt:</strong><br />{prompt}</p>

                      {file_url && (
                        <FileAttachmentBubble href={file_url} target="_blank" rel="noopener noreferrer">
                          📎 {file_name || 'Attached File'}
                        </FileAttachmentBubble>
                      )}

                      <p><strong>Model Response:</strong><br />{response}</p>
                      <p><strong>Base Model Response:</strong><br />{response_base_model}</p>
                    </CardContent>
                  </Card>
                ))}
              </CardGrid>

              <Pagination>
                {Array.from({ length: totalPages }, (_, index) => (
                  <PageButton
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    active={index + 1 === currentPage}
                  >
                    {index + 1}
                  </PageButton>
                ))}
              </Pagination>
            </>
          )}
        </PageWrapper>
      </WhiteContainer>
    </PageLayout>
  );
};

export default InterRaterPage;
