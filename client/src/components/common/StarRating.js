import React from 'react';
import styled from 'styled-components';

const StarContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #4c6272;
`;

const Stars = styled.div`
  display: inline-flex;
  
  .star {
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    background-color: #ffc107;
    width: 16px;
    height: 16px;
    margin: 0 1px;
  }

  .star.empty {
    background-color: #e0e0e0;
  }
`;

const RatingText = styled.span`
  font-weight: bold;
  font-size: 0.9rem;
`;

const StarRating = ({ rating, showText = true }) => {
  // **THE FIX:** Default to 0 if rating is null, undefined, or not a number.
  const numericRating = (typeof rating === 'number' && !isNaN(rating)) ? rating : 0;

  // Round the rating to the nearest integer for simplicity and robustness.
  const fullStars = Math.round(numericRating);

  // Ensure the array lengths are never negative.
  const validFullStars = Math.max(0, Math.min(fullStars, 5));
  const validEmptyStars = Math.max(0, 5 - validFullStars);


  return (
    <StarContainer>
      <Stars>
        {[...Array(validFullStars)].map((_, i) => <div key={`full-${i}`} className="star" />)}
        {[...Array(validEmptyStars)].map((_, i) => <div key={`empty-${i}`} className="star empty" />)}
      </Stars>
      {showText && <RatingText>{numericRating > 0 ? `${numericRating.toFixed(1)} / 5.0` : 'No rating'}</RatingText>}
    </StarContainer>
  );
};

export default StarRating;