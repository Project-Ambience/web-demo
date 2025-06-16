import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useGetAiModelByIdQuery } from '../app/apiSlice';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

const DetailWrapper = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CommentList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin-top: 1rem;
`;

const CommentItem = styled.li`
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const AiModelPage = () => {
  const { id } = useParams();
  const {
    data: model,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetAiModelByIdQuery(id);

  let content;

  if (isLoading) {
    content = <Spinner />;
  } else if (isSuccess) {
    content = (
      <DetailWrapper>
        <h2>{model.name}</h2>
        <p><strong>Clinician Type:</strong> {model.clinician_type}</p>
        <p><strong>Average Rating:</strong> {model.average_rating || 'Not yet rated'}</p>
        <hr />
        <h3>Description</h3>
        <p>{model.description}</p>
        <hr />
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
      </DetailWrapper>
    );
  } else if (isError) {
    // FIX: Stringify the error object to see its contents
    content = <ErrorMessage>{JSON.stringify(error)}</ErrorMessage>;
  }

  return <div>{content}</div>;
};

export default AiModelPage;