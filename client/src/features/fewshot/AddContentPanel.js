import React from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
  overflow: hidden;
  width: 200px;
`;

const PanelButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background-color: #f0f4f8;
  }
`;

const AddContentPanel = ({ onFileUpload, onAddFewShot }) => {
  return (
    <PanelContainer>
      <PanelButton onClick={onFileUpload}>
        📎 Upload File
      </PanelButton>
      <PanelButton onClick={onAddFewShot}>
        ✨ Add Few-Shot
      </PanelButton>
    </PanelContainer>
  );
};

export default AddContentPanel;
