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
  white-space: nowrap;

  &:hover {
    background-color: #f0f4f8;
  }
`;

const TooltipText = styled.span`
  visibility: hidden;
  width: 130px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -65px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.75rem;
  white-space: nowrap;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }
`;

const ButtonWrapper = styled.div`
  position: relative;

  &:hover ${TooltipText} {
    visibility: visible;
    opacity: 1;
  }
`;

const AddContentPanel = ({ onFileUpload, onAddFewShot }) => {
  return (
    <PanelContainer>
      <ButtonWrapper>
        <PanelButton onClick={onFileUpload}>
          📎 Upload File
        </PanelButton>
        <TooltipText>Max 1 file, 100MB</TooltipText>
      </ButtonWrapper>
      <PanelButton onClick={onAddFewShot}>
        ✨ Add Few-Shot
      </PanelButton>
    </PanelContainer>
  );
};

export default AddContentPanel;
