import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  useGetInterRaterResponsePairsQuery,
  useGetAiModelByIdQuery,
  useAddInterRaterMutation,
  useAddInterRaterFeedbackMutation,
} from '../app/apiSlice';
import Spinner from '../components/common/Spinner';

const PageLayout = styled.div`
  padding: 2rem 3rem 4rem;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
`;

const SeeMoreButton = styled.button`
  background: none;
  border: none;
  color: #005eb8;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;

  &:hover {
    color: #004199;
  }
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
  gap: 0.5rem;
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
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  h2 {
    font-size: 2rem;
    color: #333;
    margin: 0;
    margin-bottom: 1rem;
  }

  p {
    color: #4c6272;
    margin-top: 0.2rem;
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

const ResponseComparison = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ResponseBox = styled.div`
  flex: 1;
  background-color: #f9fafb;
  padding: 1rem;
  border: 1px solid #dce3e8;
  border-radius: 8px;
  min-width: 300px;

  h4 {
    margin-top: 0;
    font-size: 1rem;
    color: #333;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.25rem;
    margin-bottom: 0.75rem;
  }

  p {
    white-space: pre-line;
    color: #444;
    line-height: 1.5;
    font-size: 0.95rem;
  }
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background-color: ${({ highlight }) => (highlight ? '#d1f7c4' : '#e6f0fa')};
  color: ${({ highlight }) => (highlight ? '#1a5e20' : 'rgb(130, 132, 133)')};
  padding: 0.3rem 0.75rem;
  margin-right: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: ${({ clickable, highlight }) =>
      clickable ? (highlight ? '#b2e9a4' : '#d4e7f9') : (highlight ? '#d1f7c4' : '#e6f0fa')};
    color: ${({ clickable, highlight }) =>
      clickable ? (highlight ? '#145a1a' : '#1d4ed8') : (highlight ? '#1a5e20' : 'rgb(130, 132, 133)')};
  }
`;

const Icon = styled.svg`
  width: 14px;
  height: 14px;
  stroke: #888;
  transition: stroke 0.2s ease;

  ${Tag}:hover & {
    stroke: #145a1a;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  width: 95%;
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  transform: translate(-50%, -50%);
  z-index: 1001;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

const ModalContent = styled.div`
  padding: 1rem 2rem 1.5rem 2rem;
  flex: 1;

  @media (max-width: 600px) {
    padding: 1rem 1.25rem;
  }
`;

const ModalHeader = styled.div`
  padding: 1rem 2rem;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2d3d;
`;

const ExampleCard = styled.div`
  background-color: #f1f6fa;
  border: 1px solid #dce6ed;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;

  p {
    margin: 0.3rem 0;
    strong {
      color: #2b3e50;
    }
  }
`;

const ModalFooter = styled.div`
  position: sticky;
  bottom: 0;
  padding: 1rem 2rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  background-color: #f8f9fa;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  z-index: 2;

  button {
    background-color: #005eb8;
    color: #fff;
    border: none;
    padding: 0.6rem 1.5rem;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;

    &:hover {
      background-color: #004199;
    }
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const InterRaterPage = () => {
  const { id: ai_model_id } = useParams();
  const [formState, setFormState] = useState({});
  const [feedbackSent, setFeedbackSent] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const { data: evaluations, isLoading } = useGetInterRaterResponsePairsQuery(ai_model_id);
  const { data: model, isLoading: isModelLoading } = useGetAiModelByIdQuery(ai_model_id);
  const [createInterRater] = useAddInterRaterMutation();

  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [textModalTitle, setTextModalTitle] = useState('');
  const [textModalBody, setTextModalBody] = useState('');

  const PREVIEW_CHARS = 200;

  const getPreview = (str = '', limit = PREVIEW_CHARS) => {
    if (!str) return { preview: '', needsMore: false };
    const needsMore = str.length > limit;
    const preview = needsMore ? `${str.slice(0, limit).trimEnd()}…` : str;
    return { preview, needsMore };
  };

  const openTextModal = (title, body) => {
    setTextModalTitle(title);
    setTextModalBody(body || '');
    setIsTextModalOpen(true);
  };

  const [createInterRaterFeedback] = useAddInterRaterFeedbackMutation();
  const totalItems = evaluations?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedEvaluations = evaluations?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openModal = (template) => {
    setModalData(template);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

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
    const form = formState[item.id];
    const payload = {
      inter_rater_id: item.id,
      rating: form?.rating,
      comment: form?.comment,
    };
  
    try {
      await createInterRaterFeedback(payload).unwrap();
  
      setFeedbackSent((prev) => ({
        ...prev,
        [item.id]: true,
      }));
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };
  
  return (
    <PageLayout>
      <BackLink to={`/ai-models/${ai_model_id}`}>Back to Model</BackLink>
      <WhiteContainer>
        <PageWrapper>
          <HeaderRow>
            <PageHeader>
              <h2>Model Evaluation</h2>
              {model && (
                <>
                  <p><strong>Model:</strong> {model.name}</p>
                  {model.base_model && <p><strong>Base Model:</strong> {model.base_model.name}</p>}
                </>
              )}
            </PageHeader>
            <Link to={`/ai-models/${ai_model_id}/new/inference-pair`} style={{ textDecoration: 'none' }}>
              <SubmitButton>New Inference Pair</SubmitButton>
            </Link>
          </HeaderRow>

          {isLoading || isModelLoading ? (
            <Spinner />
          ) : totalItems === 0 ? (
            <EmptyState>
              <h3>No Evaluation Data</h3>
              <p>This model does not have any evaluation data yet.</p>
            </EmptyState>
          ) : (
            <>
              {paginatedEvaluations.map((item) => (
                <Card key={item.id}>
                  <CardContent>
                    <ResponseComparison>
                      <ResponseBox>
                        <h4>First Response</h4>
                        <p>
                          <strong>Model:</strong>{' '}
                          {item.first_conversation_ai_model_name}
                        </p>
                        <p>
                          <strong>Task:</strong>{' '}
                          {item.first_conversation_ai_model_speciality || "-"}
                        </p>
                        <p>
                          <strong>Base Model:</strong>{' '}
                          {item.first_conversation_base_model_name || "-"}
                        </p>
                        <p>
                          <Tag
                            clickable={!!item.first_conversation_few_shot_template}
                            highlight={!!item.first_conversation_few_shot_template}
                            onClick={() => {
                              if (item.first_conversation_few_shot_template) {
                                openModal(item.first_conversation_few_shot_template);
                              }
                            }}
                            title="Click to view few-shot template"
                          >
                            Few Shot: {item.first_conversation_few_shot_template ? 'True' : 'False'}{' '}
                            {item.first_conversation_few_shot_template && (
                              <Icon
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </Icon>
                            )}
                          </Tag>
                          <Tag highlight={!!item.first_conversation_rag}>
                            RAG: {item.first_conversation_rag ? 'True' : 'False'}
                          </Tag>
                          <Tag highlight={!!item.first_conversation_cot}>
                            CoT: {item.first_conversation_cot ? 'True' : 'False'}
                          </Tag>
                        </p>
                        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #ccc' }} />
                        <p>
                          <strong>File:</strong>{' '}
                          {item.first_conversation_file_url && item.first_conversation_file_name ? (
                            <a
                              href={item.first_conversation_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Attached File 
                            </a>
                          ) : (
                            'No file uploaded'
                          )}
                        </p>
                        <>
                          <p><strong>Prompt:</strong></p>
                          {(() => {
                            const { preview, needsMore } = getPreview(item.first_conversation_base_prompt);
                            return (
                              <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>
                                {preview || '—'}
                                {needsMore && (
                                  <>
                                    {' '}
                                    <SeeMoreButton
                                      onClick={() =>
                                        openTextModal(
                                          `Prompt`,
                                          item.first_conversation_base_prompt
                                        )
                                      }
                                      aria-label="See full prompt (first response)"
                                    >
                                      See more
                                    </SeeMoreButton>
                                  </>
                                )}
                              </p>
                            );
                          })()}

                          <p><strong>Response:</strong></p>
                          {(() => {
                            const { preview, needsMore } = getPreview(item.first_conversation_first_response);
                            return (
                              <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>
                                {preview || '—'}
                                {needsMore && (
                                  <>
                                    {' '}
                                    <SeeMoreButton
                                      onClick={() =>
                                        openTextModal(
                                          `Response`,
                                          item.first_conversation_first_response
                                        )
                                      }
                                      aria-label="See full response (first response)"
                                    >
                                      See more
                                    </SeeMoreButton>
                                  </>
                                )}
                              </p>
                            );
                          })()}
                        </>
                      </ResponseBox>
                      <ResponseBox>
                        <h4>Second Response</h4>
                        <p>
                          <strong>Model:</strong>{' '}
                          {item.second_conversation_ai_model_name}
                        </p>
                        <p>
                          <strong>Task:</strong>{' '}
                          {item.second_conversation_ai_model_speciality || "-"}
                        </p>
                        <p>
                          <strong>Base Model:</strong>{' '}
                          {item.second_conversation_base_model_name || "-"}
                        </p>
                        <p>
                        <Tag
                            clickable={!!item.second_conversation_few_shot_template}
                            highlight={!!item.second_conversation_few_shot_template}
                            onClick={() => {
                              if (item.second_conversation_few_shot_template) {
                                openModal(item.second_conversation_few_shot_template);
                              }
                            }}
                            title="Click to view few-shot template"
                          >
                            Few Shot: {item.second_conversation_few_shot_template ? 'True' : 'False'}{' '}
                            {item.second_conversation_few_shot_template && (
                              <Icon
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </Icon>
                            )}
                          </Tag>
                          <Tag highlight={!!item.second_conversation_rag}>
                            RAG: {item.second_conversation_rag ? 'True' : 'False'}
                          </Tag>
                          <Tag highlight={!!item.second_conversation_cot}>
                            CoT: {item.second_conversation_cot ? 'True' : 'False'}
                          </Tag>
                        </p>
                        <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #ccc' }} />
                        <p>
                          <strong>File:</strong>{' '}
                          {item.second_conversation_file_url && item.second_conversation_file_name ? (
                            <a
                              href={item.second_conversation_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Attached File
                            </a>
                          ) : (
                            'No file uploaded'
                          )}
                        </p>
                        <>
                          <p><strong>Prompt:</strong></p>
                          {(() => {
                            const { preview, needsMore } = getPreview(item.second_conversation_base_prompt);
                            return (
                              <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>
                                {preview || '—'}
                                {needsMore && (
                                  <>
                                    {' '}
                                    <SeeMoreButton
                                      onClick={() =>
                                        openTextModal(
                                          `Prompt`,
                                          item.second_conversation_base_prompt
                                        )
                                      }
                                      aria-label="See full prompt (second response)"
                                    >
                                      See more
                                    </SeeMoreButton>
                                  </>
                                )}
                              </p>
                            );
                          })()}

                          <p><strong>Response:</strong></p>
                          {(() => {
                            const { preview, needsMore } = getPreview(item.second_conversation_first_response);
                            return (
                              <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>
                                {preview || '—'}
                                {needsMore && (
                                  <>
                                    {' '}
                                    <SeeMoreButton
                                      onClick={() =>
                                        openTextModal(
                                          `Response`,
                                          item.second_conversation_first_response
                                        )
                                      }
                                      aria-label="See full response (second response)"
                                    >
                                      See more
                                    </SeeMoreButton>
                                  </>
                                )}
                              </p>
                            );
                          })()}
                        </>
                      </ResponseBox>
                    </ResponseComparison>
                  </CardContent>

                  {feedbackSent[item.id] ? (
                    <ThankYouMessage>✅ Thank you for your feedback!</ThankYouMessage>
                  ) : (
                    <FeedbackBox>
                      <LikertScale>
                        {[0, 1, 2, 3].map((value) => (
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
                                'Strongly\nPrefer First Response',
                                'Prefer\nFirst Response',
                                'Prefer\nSecond Response',
                                'Strongly\nPrefer Second Response'
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
      {isModalOpen && (
        <>
          <ModalOverlay onClick={closeModal} />
          <ModalContainer>
            <ModalHeader>📘 Few Shot Template</ModalHeader>
            <ModalContent>
              {modalData ? (
                <>
                  <p><strong>Name:</strong> {modalData.name}</p>
                  <p><strong>Description:</strong> {modalData.description}</p>
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#2b3e50' }}>Examples:</h4>
                    {modalData.examples.map((example, idx) => (
                      <ExampleCard key={idx}>
                        <p><strong>Input:</strong> {example.input}</p>
                        <p><strong>Output:</strong> {example.output}</p>
                      </ExampleCard>
                    ))}
                  </div>
                </>
              ) : (
                <p>No template data available.</p>
              )}
            </ModalContent>
            <ModalFooter>
              <button onClick={closeModal}>Close</button>
            </ModalFooter>
          </ModalContainer>
        </>
      )}
      {isTextModalOpen && (
        <>
          <ModalOverlay onClick={() => setIsTextModalOpen(false)} />
          <ModalContainer role="dialog" aria-modal="true" aria-label={textModalTitle}>
            <ModalHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{textModalTitle || 'Full content'}</span>
              <button
                onClick={() => setIsTextModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: '#999',
                }}
                aria-label="Close"
              >
                ×
              </button>
            </ModalHeader>
            <ModalContent>
              <div style={{ whiteSpace: 'pre-wrap' }}>{textModalBody}</div>
            </ModalContent>
            <ModalFooter>
              <button onClick={() => setIsTextModalOpen(false)}>Close</button>
            </ModalFooter>
          </ModalContainer>
        </>
      )}
    </PageLayout>
  );
};

export default InterRaterPage;
