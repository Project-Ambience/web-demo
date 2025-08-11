import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createConsumer } from '@rails/actioncable';
import { apiSlice } from '../app/apiSlice';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  useGetConversationsByAiModelQuery,
  useGetAiModelByIdQuery,
  useAddInterRaterMutation,
  useGetConversationsQuery,
  useGetAiModelsQuery,
  useCreateConversationMutation,
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

const SubmitButton = styled.button`
  background-color: #005eb8;
  color: #fff;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 2rem;

  &:hover {
    background-color: #004199;
  }

  &:disabled {
    background-color: #c8d3e0;
    cursor: not-allowed;
  }
`;

const ComparisonWrapper = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: stretch;
  margin-top: 0.2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ConversationColumn = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
`;

const SeeMoreButton = styled.button`
  background: none;
  border: none;
  color: #005eb8;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-top: 0.5rem;
  text-decoration: underline;

  &:hover {
    color: #004199;
  }
`;

const ResponseBox = styled.div`
  background-color: #f9fafb;
  padding: 1rem;
  border: 1px solid #dce3e8;
  border-radius: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;

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
    line-height: 1.4;
    font-size: 0.95rem;
    margin: 0.25rem 0;
  }

  strong {
    font-weight: 600;
    display: inline-block;
    margin-right: 0.25rem;
  }
`;


const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  gap: 1rem;

  span {
    flex: 1;
    text-align: center;
    font-weight: 500;
    color: #555;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 1.5rem;

  h2 {
    font-size: 2rem;
    color: #333;
    margin: 0;
  }

  p {
    color: #4c6272;
    margin-top: 1rem;
  }
`;

const NavButton = styled.button`
  background-color: #e0ebf6;
  color: #005eb8;
  border: none;
  padding: 0.4rem 0.9rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  min-width: 70px;

  &:hover {
    background-color: #cddff3;
  }

  &:disabled {
    background-color: #f0f4f8;
    color: #999;
    cursor: not-allowed;
  }
`;

const PageIndicator = styled.span`
  flex: 1;
  text-align: center;
  font-weight: 500;
  color: #555;
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

const FilterInput = styled.input`
  width: 100%;
  padding: 0.6rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid #dce3e8;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #005eb8;
    box-shadow: 0 0 0 3px rgba(0, 94, 184, 0.2);
  }

  &::placeholder {
    color: #999;
  }
`;

const MakeInferenceLink = styled.button`
  background: none;
  border: none;
  color: #005eb8;
  font-weight: bold;
  font-size: 0.95rem;
  text-decoration: underline;
  cursor: pointer;
  align-self: flex-end;
  margin-top: 2rem;

  &:hover {
    color: #004199;
  }
`;

const NewInferencePairPage = () => {
  const { id: ai_model_id } = useParams();

  const [firstFilter, setFirstFilter] = useState('');
  const [secondFilter, setSecondFilter] = useState('');

  const [firstIndex, setFirstIndex] = useState(0);
  const [secondIndex, setSecondIndex] = useState(1);

  const { data: allFirstConversations = [], isLoading: isLoadingFirst } = useGetConversationsByAiModelQuery(ai_model_id);
  const { data: allSecondConversations = [], isLoading: isLoadingSecond } = useGetConversationsQuery();

  const firstConversations = allFirstConversations
  .filter(c => c.base_prompt && c.first_response)
  .filter(c =>
    c.id.toString().includes(firstFilter.trim()) ||
    (c.ai_model?.name || '').toLowerCase().includes(firstFilter.toLowerCase())
  );

  const secondConversations = allSecondConversations
    .filter(c => c.base_prompt && c.first_response)
    .filter(c =>
      c.id.toString().includes(secondFilter.trim()) ||
      (c.ai_model?.name || '').toLowerCase().includes(secondFilter.toLowerCase())
    );

  React.useEffect(() => {
    if (firstIndex >= firstConversations.length) {
      setFirstIndex(0);
    }
  }, [firstConversations.length]);

  React.useEffect(() => {
    setSecondIndex(0);
  }, [secondConversations.length]);

  const { data: model } = useGetAiModelByIdQuery(ai_model_id);
  const [createInterRater] = useAddInterRaterMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const [showModelSelection, setShowModelSelection] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('');

  const { data: allModels = [], isLoading: isLoadingModels } = useGetAiModelsQuery();

  const [showChatModal, setShowChatModal] = useState(false);
  const [chatConversationId, setChatConversationId] = useState(null);

  const [createConversation] = useCreateConversationMutation();

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

  const cable = useRef(null);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleModelSelect = async (modelId) => {
    const model = allModels.find((m) => m.id.toString() === modelId.toString());
    try {
      const convo = await createConversation({
        conversation: {
          ai_model_id: model.id,
          title: `Chat with ${model.name}`,
        },
      }).unwrap();
  
      setChatConversationId(convo.id);
      setShowModelSelection(false);
      setShowChatModal(true);
    } catch (error) {
      alert('Failed to create conversation.');
      console.error(error);
    }
  };

  const openModal = (template) => {
    setModalData(template);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleNavigate = (setIndex, currentIndex, direction, list) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < list.length) {
      setIndex(newIndex);
    }
  };
  
  const handleSubmit = async () => {
    const confirmed = window.confirm("Are you sure you want to submit this Inference Pair?");
    if (!confirmed) return;
  
    try {
      await createInterRater({
        ai_model_id,
        first_conversation_id: convo1.id,
        second_conversation_id: convo2.id,
      }).unwrap();
  
      navigate(`/ai-models/${ai_model_id}/evaluate`);
    } catch (e) {
      alert("❌ Error creating InterRater");
      console.error(e);
    }
  };  
  
  const convo1 = firstConversations[firstIndex];
  const convo2 = secondConversations[secondIndex];

  useEffect(() => {
    if (!chatConversationId || !showChatModal) {
      return () => {};
    }
  
    if (!cable.current) {
      cable.current = createConsumer(process.env.REACT_APP_CABLE_URL);
    }
  
    const subscription = cable.current.subscriptions.create(
      {
        channel: 'InferenceChannel',
        conversation_id: chatConversationId,
      },
      {
        received(data) {
          console.log('📡 InferenceChannel received:', data);
  
          dispatch(apiSlice.util.invalidateTags([
            { type: 'Conversation', id: chatConversationId },
            { type: 'Conversation', id: 'BY_AI_MODEL' }
          ]));
        },
        connected() {
          console.log(`✅ Connected to InferenceChannel ${chatConversationId}`);
        },
        disconnected() {
          console.log(`❌ Disconnected from InferenceChannel ${chatConversationId}`);
        },
      }
    );
  
    return () => {
      console.log(`🧹 Unsubscribed from InferenceChannel ${chatConversationId}`);
      subscription.unsubscribe();
    };
  }, [chatConversationId, showChatModal, dispatch]);

  if (isLoadingFirst || isLoadingSecond || !model) return <Spinner />;
  
  return (
    <PageLayout>
      <BackLink to={`/ai-models/${ai_model_id}/evaluate`}>
        Back to Evaluate
      </BackLink>
      <WhiteContainer>
        <PageHeader>
          <h2>New Inference Pair</h2>
          <p><strong>Model:</strong> {model?.name}</p>
          <p><strong>Base Model:</strong> {model?.base_model?.name}</p>
        </PageHeader>

        <WhiteContainer>
          <ComparisonWrapper>
            <ConversationColumn>
              <FilterInput
                type="text"
                placeholder="Filter by model name or ID"
                value={firstFilter}
                onChange={(e) => setFirstFilter(e.target.value)}
              />
              <ResponseBox>
                <h4>First Response</h4>
                {convo1 ? (
                  <>
                    <p><strong>ID:</strong> {convo1.id}</p>
                    <p><strong>Model:</strong> {convo1.ai_model?.name}</p>
                    <p>
                      <strong>Task:</strong> {convo1?.ai_model?.speciality || "-"}
                    </p>
                    <p>
                      <strong>Base Model:</strong> {convo1?.ai_model?.base_model_name || "-"}
                    </p>
                    <p>
                      <Tag
                        clickable={convo1.few_shot_template?.examples?.length > 0}
                        highlight={convo1.few_shot_template?.examples?.length > 0}
                        onClick={() => convo1.few_shot_template && openModal(convo1.few_shot_template)}
                        title="Click to view few-shot template"
                      >
                        Few Shot: {convo1.few_shot_template?.examples?.length > 0 ? 'True' : 'False'}
                        {convo1.few_shot_template && (
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
                      <Tag highlight={!!convo1.rag}>
                        RAG: {convo1.rag ? 'True' : 'False'}
                      </Tag>
                      <Tag highlight={!!convo1.cot}>
                        CoT: {convo1.cot ? 'True' : 'False'}
                      </Tag>
                    </p>
                    <hr style={{ margin: '1rem 0' }} />
                    <p><strong>Files:</strong> {convo1.file_url ? <a href={convo1.file_url} target="_blank" rel="noreferrer">Attached File</a> : 'No file uploaded'}</p>
                    <>
                      <p><strong>Prompt:</strong></p>
                      {(() => {
                        const { preview, needsMore } = getPreview(convo1.base_prompt);
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
                                      convo1.base_prompt
                                    )
                                  }
                                  aria-label={`See full prompt for conversation ${convo1.id}`}
                                >
                                  See more
                                </SeeMoreButton>
                              </>
                            )}
                          </p>
                        );
                      })()}
                    </>
                    <>
                      <p><strong>Response:</strong></p>
                      {(() => {
                        const { preview, needsMore } = getPreview(convo1.first_response);
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
                                      convo1.first_response
                                    )
                                  }
                                  aria-label={`See full response for conversation ${convo1.id}`}
                                >
                                  See more
                                </SeeMoreButton>
                              </>
                            )}
                          </p>
                        );
                      })()}
                    </>
                  </>
                ) : (
                  <p style={{ color: '#888' }}>No matching conversation found.</p>
                )}
              </ResponseBox>
              <Navigation>
                <NavButton onClick={() => handleNavigate(setFirstIndex, firstIndex, -1, firstConversations)} disabled={firstIndex === 0}>Prev</NavButton>
                <PageIndicator>
                  {firstConversations.length === 0 ? '0 / 0' : `${firstIndex + 1} / ${firstConversations.length}`}
                </PageIndicator>
                <NavButton onClick={() => handleNavigate(setFirstIndex, firstIndex, 1, firstConversations)} disabled={firstIndex >= firstConversations.length - 1}>Next</NavButton>
              </Navigation>
            </ConversationColumn>

            <ConversationColumn>
              <FilterInput
                type="text"
                placeholder="Filter by model name or ID"
                value={secondFilter}
                onChange={(e) => setSecondFilter(e.target.value)}
              />
              <ResponseBox>
                <h4>Second Response</h4>
                {convo2 ? (
                  <>
                    <p><strong>ID:</strong> {convo2.id}</p>
                    <p><strong>Model:</strong> {convo2.ai_model?.name}</p>
                    <p>
                      <strong>Task:</strong> {convo2?.ai_model?.speciality || "-"}
                    </p>
                    <p>
                      <strong>Base Model:</strong> {convo2?.ai_model?.base_model_name || "-"}
                    </p>
                    <p>
                      <Tag
                        clickable={convo2.few_shot_template?.examples?.length > 0}
                        highlight={convo2.few_shot_template?.examples?.length > 0}
                        onClick={() => convo2.few_shot_template && openModal(convo2.few_shot_template)}
                        title="Click to view few-shot template"
                      >
                        Few Shot: {convo2.few_shot_template?.examples?.length > 0 ? 'True' : 'False'}
                        {convo2.few_shot_template && (
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
                      <Tag highlight={!!convo2.rag}>
                        RAG: {convo2.rag ? 'True' : 'False'}
                      </Tag>
                      <Tag highlight={!!convo2.cot}>
                        CoT: {convo2.cot ? 'True' : 'False'}
                      </Tag>
                    </p>
                    <hr style={{ margin: '1rem 0' }} />
                    <p><strong>Files:</strong> {convo2.file_url ? <a href={convo2.file_url} target="_blank" rel="noreferrer">Attached File</a> : 'No file uploaded'}</p>
                    <>
                      <p><strong>Prompt:</strong></p>
                      {(() => {
                        const { preview, needsMore } = getPreview(convo2.base_prompt);
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
                                      convo2.base_prompt
                                    )
                                  }
                                  aria-label={`See full prompt for conversation ${convo2.id}`}
                                >
                                  See more
                                </SeeMoreButton>
                              </>
                            )}
                          </p>
                        );
                      })()}
                    </>
                    <>
                      <p><strong>Response:</strong></p>
                      {(() => {
                        const { preview, needsMore } = getPreview(convo2.first_response);
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
                                      convo2.first_response
                                    )
                                  }
                                  aria-label={`See full response for conversation ${convo2.id}`}
                                >
                                  See more
                                </SeeMoreButton>
                              </>
                            )}
                          </p>
                        );
                      })()}
                    </>
                  </>
                ) : (
                  <p style={{ color: '#888' }}>No matching conversation found.</p>
                )}
              </ResponseBox>
              <Navigation>
                <NavButton onClick={() => handleNavigate(setSecondIndex, secondIndex, -1, secondConversations)} disabled={secondIndex === 0}>Prev</NavButton>
                <PageIndicator>
                  {secondConversations.length === 0 ? '0 / 0' : `${secondIndex + 1} / ${secondConversations.length}`}
                </PageIndicator>
                <NavButton onClick={() => handleNavigate(setSecondIndex, secondIndex, 1, secondConversations)} disabled={secondIndex >= secondConversations.length - 1}>Next</NavButton>
              </Navigation>
            </ConversationColumn>
          </ComparisonWrapper>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <MakeInferenceLink onClick={() => setShowModelSelection(true)}>
              + Make New Inference
            </MakeInferenceLink>
          </div>
        </WhiteContainer>

        <SubmitButton onClick={handleSubmit}>
          Submit
        </SubmitButton>
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

      {showModelSelection && (
        <>
          <ModalOverlay onClick={() => setShowModelSelection(false)} />
          <ModalContainer>
            <ModalHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Select Model</span>
              <button
                onClick={() => setShowModelSelection(false)}
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
              {isLoadingModels ? (
                <p>Loading models...</p>
              ) : (
                <>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      marginBottom: '1rem',
                    }}
                  >
                    <option value="">Select a model</option>
                    {allModels
                      .map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                  </select>
                </>
              )}
            </ModalContent>
            <ModalFooter>
              <button
                onClick={() => setShowModelSelection(false)}
                style={{
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  marginRight: '1rem',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (selectedModelId) {
                    handleModelSelect(selectedModelId);
                  }
                }}
                disabled={!selectedModelId}
                style={{
                  backgroundColor: selectedModelId ? '#005eb8' : '#c8d3e0',
                  color: '#fff',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: selectedModelId ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                }}
              >
                Confirm
              </button>
            </ModalFooter>
          </ModalContainer>
        </>
      )}

      {showChatModal && chatConversationId && (
        <>
          <ModalOverlay onClick={() => setShowChatModal(false)} />
          <ModalContainer style={{ maxWidth: '900px', padding: 0 }}>
            <ModalHeader>
              Inference Chat
            </ModalHeader>
            <ModalContent style={{ padding: 0 }}>
              <iframe
                src={`/chat/${chatConversationId}?inferenceOnly=true`}
                style={{
                  border: 'none',
                  width: '100%',
                  height: '70vh',
                  borderBottomLeftRadius: '16px',
                  borderBottomRightRadius: '16px',
                }}
              />
            </ModalContent>
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

export default NewInferencePairPage;
