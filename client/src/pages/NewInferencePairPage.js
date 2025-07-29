import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  useGetConversationsByAiModelQuery,
  useGetAiModelByIdQuery,
  useAddInterRaterMutation,
  useGetConversationsQuery,
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
  margin-top: 0.2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ConversationColumn = styled.div`
  flex: 1;
  min-width: 300px;
`;

const ResponseBox = styled.div`
  background-color: #f9fafb;
  padding: 1rem;
  border: 1px solid #dce3e8;
  border-radius: 8px;

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
  background-color: #e6f0fa;
  color: rgb(130, 132, 133);
  padding: 0.3rem 0.75rem;
  margin-right: 0.5rem;
  margin-top: 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: ${({ clickable }) => (clickable ? '#d4e7f9' : '#e6f0fa')};
    color: ${({ clickable }) => (clickable ? '#1d4ed8' : 'rgb(130, 132, 133)')};
  }
`;

const Icon = styled.svg`
  width: 14px;
  height: 14px;
  stroke: #888;
  transition: stroke 0.2s ease;

  ${Tag}:hover & {
    stroke: #1d4ed8; /* vivid blue on hover */
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

const NewInferencePairPage = () => {
  const { id: ai_model_id } = useParams();

  const [firstFilter, setFirstFilter] = useState('');
  const [secondFilter, setSecondFilter] = useState('');

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


  const { data: model } = useGetAiModelByIdQuery(ai_model_id);
  const [createInterRater] = useAddInterRaterMutation();

  const [firstIndex, setFirstIndex] = useState(0);
  const [secondIndex, setSecondIndex] = useState(1);
  const [showModal, setShowModal] = useState(false);

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

  const handleNavigate = (setIndex, currentIndex, direction, list) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < list.length) {
      setIndex(newIndex);
    }
  };

  const handleSubmit = async () => {
    try {
      await createInterRater({
        ai_model_id,
        first_conversation_id: convo1.id,
        second_conversation_id: convo2.id,
      }).unwrap();
      setShowModal(false);
      alert('✅ InterRater created successfully!');
    } catch (e) {
      alert('❌ Error creating InterRater');
    }
  };

  if (isLoadingFirst || isLoadingSecond || !model) return <Spinner />;

  const convo1 = firstConversations[firstIndex];
  const convo2 = secondConversations[secondIndex];

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
              <input
                type="text"
                placeholder="Filter by model name or ID"
                value={firstFilter}
                onChange={(e) => setFirstFilter(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
              />
              <ResponseBox>
                <h4>First Inference</h4>
                <p><strong>ID:</strong> {convo1?.id}</p>
                <p><strong>Model:</strong> {convo1?.ai_model?.name}</p>
                <p>
                  <Tag
                    clickable={convo1?.few_shot_template?.examples?.length > 0}
                    onClick={() => convo1?.few_shot_template && openModal(convo1.few_shot_template)}
                    title="Click to view few-shot template"
                  >
                    Few Shot: {convo1?.few_shot_template?.examples?.length > 0 ? 'True' : 'False'}
                  </Tag>
                  <Tag>RAG: False</Tag>
                  <Tag>CoT: False</Tag>
                </p>
                <hr style={{ margin: '1rem 0' }} />
                <p><strong>Prompt:</strong> {convo1?.base_prompt}</p>
                <p><strong>File:</strong> {convo1?.file_url ? <a href={convo1.file_url} target="_blank" rel="noreferrer">Attached File</a> : 'No file uploaded'}</p>
                <p><strong>Response:</strong> {convo1?.first_response}</p>
              </ResponseBox>
              <Navigation>
                <NavButton onClick={() => handleNavigate(setFirstIndex, firstIndex, -1, firstConversations)} disabled={firstIndex === 0}>Prev</NavButton>
                <PageIndicator>{firstIndex + 1} / {firstConversations.length}</PageIndicator>
                <NavButton onClick={() => handleNavigate(setFirstIndex, firstIndex, 1, firstConversations)} disabled={firstIndex >= firstConversations.length - 1}>Next</NavButton>
              </Navigation>
            </ConversationColumn>

            <ConversationColumn>
              <input
                type="text"
                placeholder="Filter by model name or ID"
                value={secondFilter}
                onChange={(e) => setSecondFilter(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
              />
              <ResponseBox>
                <h4>Second Inference</h4>
                <p><strong>ID:</strong> {convo2?.id}</p>
                <p><strong>Model:</strong> {convo2?.ai_model?.name}</p>
                <p>
                  <Tag
                    clickable={convo2?.few_shot_template?.examples?.length > 0}
                    onClick={() => convo2?.few_shot_template && openModal(convo2.few_shot_template)}
                    title="Click to view few-shot template"
                  >
                    Few Shot: {convo2?.few_shot_template?.examples?.length > 0 ? 'True' : 'False'}
                  </Tag>
                  <Tag>RAG: False</Tag>
                  <Tag>CoT: False</Tag>
                </p>
                <hr style={{ margin: '1rem 0' }} />
                <p><strong>Prompt:</strong> {convo2?.base_prompt}</p>
                <p><strong>File:</strong> {convo2?.file_url ? <a href={convo2.file_url} target="_blank" rel="noreferrer">Attached File</a> : 'No file uploaded'}</p>
                <p><strong>Response:</strong> {convo2?.first_response}</p>
              </ResponseBox>
              <Navigation>
                <NavButton onClick={() => handleNavigate(setSecondIndex, secondIndex, -1, secondConversations)} disabled={secondIndex === 0}>Prev</NavButton>
                <PageIndicator>{secondIndex + 1} / {secondConversations.length}</PageIndicator>
                <NavButton onClick={() => handleNavigate(setSecondIndex, secondIndex, 1, secondConversations)} disabled={secondIndex >= secondConversations.length - 1}>Next</NavButton>
              </Navigation>
            </ConversationColumn>
          </ComparisonWrapper>
        </WhiteContainer>

        <SubmitButton
          onClick={() => setShowModal(true)}
        >
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
    </PageLayout>
  );
};

export default NewInferencePairPage;
