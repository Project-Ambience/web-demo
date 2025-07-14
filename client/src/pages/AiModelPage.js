import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  useGetAiModelByIdQuery, 
  useAddRatingMutation, 
  useAddCommentMutation,
  useCreateConversationMutation
} from '../app/apiSlice';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StarRating from '../components/common/StarRating';
import InteractiveStarRating from '../components/common/InteractiveStarRating';

const PageWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 960px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const MainContent = styled.div`
  background-color: #fff;
  padding: 2rem;
  border: 1px solid #e8edee;
  border-radius: 4px;
`;

const Sidebar = styled.div`
  background-color: #f0f4f5;
  padding: 1.5rem;
  border-radius: 4px;
  height: fit-content;
`;

const ModelHeader = styled.div`
  border-bottom: 1px solid #e8edee;
  padding-bottom: 1rem;
  margin-bottom: 1rem;

  h2 {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
  }
`;

const Section = styled.section`
  margin-bottom: 2rem;
  h3 {
    font-size: 1.25rem;
    color: #4c6272;
    border-bottom: 2px solid #e8edee;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
  &:last-child {
    margin-bottom: 0;
  }
`;

const CommentList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin-top: 1rem;
`;

const CommentItem = styled.li`
  background-color: #fff;
  border: 1px solid #e8edee;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;

  p {
    margin: 0 0 0.5rem 0;
  }

  small {
    color: #757575;
  }
`;

const ButtonBase = styled.button`
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent;
  width: 100%;
  margin-bottom: 0.5rem;
  text-align: center;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(ButtonBase)`
  background-color: #005eb8;
  color: white;

  &:hover:not(:disabled) {
    background-color: #003087;
  }
`;

const SecondaryButton = styled(ButtonBase)`
  background-color: white;
  color: #005eb8;
  border: 2px solid #005eb8;

  &:hover:not(:disabled) {
    background-color: #e8edee;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #aeb7bd;
  font-family: inherit;
  font-size: 1rem;
  min-height: 100px;
  margin-bottom: 1rem;
  resize: vertical;

  &:focus {
    outline: 2px solid #005eb8;
    border-color: #005eb8;
  }
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 2rem;
  font-weight: bold;
  color: #005eb8;
  text-decoration: none;

  &:before {
    content: '‹ ';
    font-size: 1.2rem;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const AiModelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newRating, setNewRating] = useState(0);
  const [commentText, setCommentText] = useState('');

  const {
    data: model,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetAiModelByIdQuery(id);

  const [addRating, { isLoading: isRatingLoading }] = useAddRatingMutation();
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();
  const [createConversation, { isLoading: isCreatingConversation }] = useCreateConversationMutation();

  const handleUseModel = async () => {
    try {
      const newConversation = await createConversation({
        conversation: {
          ai_model_id: model.id,
          title: `Chat with ${model.name}`,
        },
      }).unwrap();
      
      navigate(`/chat/${newConversation.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  };

  const handleFineTune = async () => {
    navigate(`/fine-tune/${model.id}`);
  };

  const handleRateSubmit = async () => {
    if (newRating > 0) {
      try {
        await addRating({ ai_model_id: id, rating: { rating: newRating } }).unwrap();
        setNewRating(0);
      } catch (err) {
        console.error('Failed to add rating:', err);
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      try {
        await addComment({ ai_model_id: id, comment: { comment: commentText } }).unwrap();
        setCommentText('');
      } catch (err) {
        console.error('Failed to add comment:', err);
      }
    }
  };

  let content;

  if (isLoading) {
    content = <Spinner />;
  } else if (isSuccess) {
    content = (
      <div>
        <BackLink to="/">Back to Catalogue</BackLink>
        <PageWrapper>
          <MainContent>
            <ModelHeader>
              <h2>{model.name}</h2>
              <p><strong>Clinical Specialty:</strong> {model.clinician_type}</p>
              <StarRating rating={model.average_rating} />
            </ModelHeader>
            <Section>
              <h3>Description</h3>
              <p>{model.description}</p>
            </Section>
            <Section>
              <h3>Comments</h3>
              <CommentList>
                {model.comments.length > 0 ? (
                  model.comments.map(comment => (
                    <CommentItem key={comment.id}>
                      <p>"{comment.comment}"</p>
                      <small>Posted on: {new Date(comment.created_at).toLocaleDateString()}</small>
                    </CommentItem>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
              </CommentList>
            </Section>
          </MainContent>
          <Sidebar>
            <h3>Actions</h3>
            <Section>
              <h4>Add a Comment</h4>
              <form onSubmit={handleCommentSubmit}>
                <TextArea 
                  placeholder="Enter your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <PrimaryButton type="submit" disabled={isCommenting || !commentText.trim()}>
                  {isCommenting ? 'Submitting...' : 'Submit Comment'}
                </PrimaryButton>
              </form>
            </Section>
            <Section>
              <InteractiveStarRating onRate={setNewRating} />
              <PrimaryButton 
                onClick={handleRateSubmit} 
                disabled={newRating === 0 || isRatingLoading}
              >
                {isRatingLoading ? 'Submitting...' : 'Submit Rating'}
              </PrimaryButton>
            </Section>
            <Section>
              <h4>Model Utilities</h4>
              <PrimaryButton onClick={handleUseModel} disabled={isCreatingConversation}>
                {isCreatingConversation ? 'Starting...' : 'Use the model'}
              </PrimaryButton>
              <SecondaryButton onClick={handleFineTune} disabled={!model.allow_fine_tune}>
                Fine-tune
              </SecondaryButton>
            </Section>
          </Sidebar>
        </PageWrapper>
      </div>
    );
  } else if (isError) {
    console.error(`Failed to load AI model with id ${id}:`, error);
    content = <ErrorMessage>Failed to load model data. Please try again later.</ErrorMessage>;
  }

  return <div>{content}</div>;
};

export default AiModelPage;
