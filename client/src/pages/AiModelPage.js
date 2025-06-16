import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const AiModelPage = () => {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams(); // Gets the :id from the URL

  useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5090/api/ai_models/${id}`);
        const data = await response.json();
        setModel(data);
      } catch (error) {
        console.error("Failed to fetch model details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModelDetails();
  }, [id]); // Refetch if the ID in the URL changes

  if (isLoading) return <p>Loading model details...</p>;
  if (!model) return <p>Model not found.</p>;

  return (
    <div>
      <h2>{model.name}</h2>
      <p><strong>Clinician Type:</strong> {model.clinician_type}</p>
      <p><strong>Average Rating:</strong> {model.average_rating || 'Not yet rated'}</p>
      <hr />
      <h3>Description</h3>
      <p>{model.description}</p>
      <hr />
      <h3>Comments</h3>
      {model.comments.length > 0 ? (
        <ul>
          {model.comments.map(comment => (
            <li key={comment.id}>
              <p>{comment.comment}</p>
              <small>Posted on: {new Date(comment.created_at).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

export default AiModelPage;