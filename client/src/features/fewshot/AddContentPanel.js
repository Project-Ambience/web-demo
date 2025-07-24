import React from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-70%);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;

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
  bottom: 110%;
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
  & > ${PanelButton} {
    border-radius: 8px 8px 0 0;
  }

  &:hover ${TooltipText} {
    visibility: visible;
    opacity: 1;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 0.5rem;

  &:hover {
    background-color: #f0f4f8;
  }

  ${PanelButton}:hover {
    background-color: transparent;
  }
`;

const HelpButton = styled.button`
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  color: #888;
  font-size: 0.9rem;
  flex-shrink: 0;

  &:hover {
    background-color: #e0e6ec;
    color: #005eb8;
  }
`;


const AddContentPanel = ({ onFileUpload, onAddFewShot, onEnableCoT, onShowCoTInfo, onShowFewShotInfo }) => {
  return (
    <PanelContainer>
      <ButtonWrapper>
        <PanelButton onClick={onFileUpload}>
          📎 Upload File
        </PanelButton>
        <TooltipText>Max 1 file, 100MB</TooltipText>
      </ButtonWrapper>

      <ButtonRow>
        <PanelButton onClick={onEnableCoT}>
          🧠 Enable Chain-of-Thought
        </PanelButton>
        <HelpButton onClick={(e) => { e.stopPropagation(); onShowCoTInfo(); }}>?</HelpButton>
      </ButtonRow>

      <ButtonRow>
        <PanelButton onClick={onAddFewShot}>
          ✨ Add Few-Shot
        </PanelButton>
        <HelpButton onClick={(e) => { e.stopPropagation(); onShowFewShotInfo(); }}>?</HelpButton>
      </ButtonRow>
    </PanelContainer>
  );
};

export default AddContentPanel;
