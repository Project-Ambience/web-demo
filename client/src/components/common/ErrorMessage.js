import React from 'react';
import styled from 'styled-components';

const ErrorWrapper = styled.div`
  border: 1px solid #e74c3c;
  background-color: #fbeae5;
  color: #c0392b;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
`;

const ErrorMessage = ({ children }) => <ErrorWrapper>{children}</ErrorWrapper>;

export default ErrorMessage;