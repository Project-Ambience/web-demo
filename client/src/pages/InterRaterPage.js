import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  useGetInterRaterFineTuneQuery,
  useGetAiModelByIdQuery,
  useAddInterRaterMutation,
} from '../app/apiSlice';
import Spinner from '../components/common/Spinner';

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

const TabSwitcher = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-top: 1.5rem;
`;

const TabButton = styled.button`
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  color: ${({ active }) => (active ? '#005eb8' : '#555')};
  border-bottom: ${({ active }) =>
    active ? '3px solid #005eb8' : '3px solid transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f8fb;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  background-color: ${({ active }) => (active ? '#005eb8' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#005eb8')};
  border: 1px solid #005eb8;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: ${({ active }) =>
      active ? '#004199' : '#f0f4f8'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Card = styled.div`
  background-color: #fff;
  border: 1px solid #e8edee;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
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

const LikertScale = styled.div`
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0;

  label {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.8rem;
    color: #444;
    cursor: pointer;
    flex: 1;

    input {
      margin-bottom: 0.5rem;
      accent-color: #005eb8;
      width: 18px;
      height: 18px;
    }

    span {
      margin-top: 0.3rem;
      text-align: center;
      white-space: pre-line;
    }
  }
`;

const FeedbackBox = styled.div`
  background-color: #f7fafd;
  border: 1px solid #d8e6f2;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
`;

const CommentInput = styled.textarea`
  width: 100%;
  height: 80px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 1rem;
`;

const SubmitButton = styled.button`
  background-color: #005eb8;
  color: #fff;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #004199;
  }

  &:disabled {
    background-color: #c8d3e0;
    cursor: not-allowed;
  }
`;

const ThankYouMessage = styled.div`
  margin-top: 1rem;
  padding: 1.25rem;
  background-color: #e8f5e9;
  border: 1px solid #b2dfdb;
  border-radius: 8px;
  color: #2e7d32;
  font-weight: 500;
`;

const ConversationBadge = styled.div`
  display: inline-block;
  background-color: #e1ecf4;
  color: #005eb8;
  font-weight: bold;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const InterRaterPage = () => {
  const { id: ai_model_id } = useParams();
  const [activeTab, setActiveTab] = useState('fine_tune');
  const [formState, setFormState] = useState({});
  const [feedbackSent, setFeedbackSent] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const { data: evaluations, isLoading } = useGetInterRaterFineTuneQuery(ai_model_id);
  const { data: model, isLoading: isModelLoading } = useGetAiModelByIdQuery(ai_model_id);
  const [createInterRater] = useAddInterRaterMutation();

  const totalItems = evaluations?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedEvaluations = evaluations?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (id, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: field === 'rating' ? parseInt(value, 10) : value,
      },
    }));
  };

  const handleSubmit = async (item) => {
    const payload = {
      ai_model_id: Number(ai_model_id),
      prompt: item.prompt,
      first_response: item.response,
      second_response: item.response_base_model,
      file_url: item.file_url,
      rating: formState[item.id]?.rating,
      comment: formState[item.id]?.comment,
      evaluation_category: 0,
    };

    try {
      await createInterRater(payload).unwrap();
      setFeedbackSent((prev) => ({
        ...prev,
        [item.id]: true,
      }));
    } catch (err) {
      // Optionally handle error display here
    }
  };

  return (
    <PageLayout>
      <BackLink to={`/ai-models/${ai_model_id}`}>Back to Model</BackLink>
      <WhiteContainer>
        <PageWrapper>
          <PageHeader>
            <h2>Model Evaluation</h2>
            {model && (
              <>
                <p><strong>Model:</strong> {model.name}</p>
                {model.base_model && <p><strong>Base Model:</strong> {model.base_model.name}</p>}
              </>
            )}
            <TabSwitcher>
              <TabButton active={activeTab === 'fine_tune'} onClick={() => { setActiveTab('fine_tune'); setCurrentPage(1); }}>Fine Tune Model</TabButton>
              <TabButton active={activeTab === 'prompt_engineering'} onClick={() => { setActiveTab('prompt_engineering'); setCurrentPage(1); }}>Prompt Engineering</TabButton>
            </TabSwitcher>
          </PageHeader>

          {isLoading || isModelLoading ? (
            <Spinner />
          ) : activeTab === 'prompt_engineering' ? (
            <EmptyState>
              <h3>No Evaluation Data</h3>
              <p>This model does not have any prompt engineering evaluation data yet.</p>
            </EmptyState>
          ) : totalItems === 0 ? (
            <EmptyState>
              <h3>No Evaluation Data</h3>
              <p>This model does not have any fine-tune model evaluation data yet.</p>
            </EmptyState>
          ) : (
            <>
              {paginatedEvaluations.map((item) => (
                <Card key={item.id}>
                  <ConversationBadge>Conversation ID: {item.id}</ConversationBadge>
                  <CardContent>
                    <p><strong>Prompt:</strong><br />{item.prompt}</p>
                    {item.file_url && (
                      <p><a href={item.file_url} target="_blank" rel="noopener noreferrer">📎 Attached File</a></p>
                    )}
                    <p><strong>Fine-Tuned Model's Response:</strong><br />{item.response}</p>
                    <p><strong>Base Model's Response:</strong><br />{item.response_base_model}</p>
                  </CardContent>

                  {feedbackSent[item.id] ? (
                    <ThankYouMessage>✅ Thank you for your feedback!</ThankYouMessage>
                  ) : (
                    <FeedbackBox>
                      <LikertScale>
                        {[0, 1, 2, 3, 4].map((value) => (
                          <label key={value}>
                            <input
                              type="radio"
                              name={`rating-${item.id}`}
                              value={value}
                              checked={formState[item.id]?.rating === value}
                              onChange={(e) =>
                                handleChange(item.id, 'rating', e.target.value)
                              }
                            />
                            <span>
                              {[
                                'Strongly\nPrefer Fine-Tuned model',
                                'Prefer\nFine-Tuned model',
                                'Neutral',
                                'Prefer\nBase Model',
                                'Strongly\nPrefer Base Model',
                              ][value]}
                            </span>
                          </label>
                        ))}
                      </LikertScale>
                      <CommentInput
                        placeholder="Comment..."
                        value={formState[item.id]?.comment || ''}
                        onChange={(e) =>
                          handleChange(item.id, 'comment', e.target.value)
                        }
                      />
                      <SubmitButton
                        onClick={() => handleSubmit(item)}
                        disabled={formState[item.id]?.rating === undefined}
                      >
                        Submit Feedback
                      </SubmitButton>
                    </FeedbackBox>
                  )}
                </Card>
              ))}
              {totalPages > 1 && (
                <PaginationWrapper>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <PageButton
                      key={index}
                      active={index + 1 === currentPage}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </PageButton>
                  ))}
                </PaginationWrapper>
              )}
            </>
          )}
        </PageWrapper>
      </WhiteContainer>
    </PageLayout>
  );
};

export default InterRaterPage;
