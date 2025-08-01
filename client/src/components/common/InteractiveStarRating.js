import React, { useState } from 'react';
import styled from 'styled-components';

const RatingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const StarsWrapper = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const Star = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  font-size: 2rem;
  color: #e0e0e0; // Color for empty stars

  &.filled {
    color: #ffc107; // Color for filled stars
  }

  &:hover {
    transform: scale(1.2);
    transition: transform 0.2s;
  }
`;

const InteractiveStarRating = ({ onRate }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <RatingContainer>
      <h4>Rate this AI Model:</h4>
      <StarsWrapper>
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <Star
              key={starValue}
              className={(starValue <= (hover || rating)) ? 'filled' : ''}
              onClick={() => {
                setRating(starValue);
                onRate(starValue);
              }}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(rating)}
              aria-label={`Rate ${starValue} out of 5 stars`}
            >
              ★
            </Star>
          );
        })}
      </StarsWrapper>
    </RatingContainer>
  );
};

export default InteractiveStarRating;