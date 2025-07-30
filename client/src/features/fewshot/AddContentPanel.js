import React from 'react';
import styled from 'styled-components';
import MaterialIcon from '../../components/common/MaterialIcon';
import ToggleSwitch from '../../components/common/ToggleSwitch';

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
  min-width: 240px;
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
  user-select: none;
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

const Row = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background-color: #f0f4f8;
  }
`;

const ClickableRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background-color: #f0f4f8;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ControlsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const InfoIcon = styled.span`
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
  font-size: 1rem;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  justify-content: center;
  
  &:hover {
    background-color: #e0e6ec;
    color: #005eb8;
  }

  & > .material-symbols-outlined {
    top: 0;
    font-size: 1.1rem;
  }
`;

const AddContentPanel = ({ onFileUpload, onAddFewShot, isCoTEnabled, onToggleCoT, onShowCoTInfo, onShowFewShotInfo }) => {
  return (
    <PanelContainer>
      <ButtonWrapper>
        <PanelButton onClick={onFileUpload}>
          📎 Upload File
        </PanelButton>
        <TooltipText>Max 1 file, 100MB</TooltipText>
      </ButtonWrapper>

      <Row onClick={onToggleCoT}>
        <LabelWrapper>
          <span>💭 Enable Thinking</span>
        </LabelWrapper>
        <ControlsWrapper>
          <InfoIcon onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShowCoTInfo(); }}>
            <MaterialIcon iconName="help_outline" />
          </InfoIcon>
          <ToggleSwitch isOn={isCoTEnabled} handleToggle={onToggleCoT} />
        </ControlsWrapper>
      </Row>

      <ClickableRow onClick={onAddFewShot}>
        <LabelWrapper>
            <span>✨ Add Few-Shot</span>
            <InfoIcon onClick={(e) => { e.stopPropagation(); onShowFewShotInfo(); }}>
                <MaterialIcon iconName="help_outline" />
            </InfoIcon>
        </LabelWrapper>
      </ClickableRow>
    </PanelContainer>
  );
};

export default AddContentPanel;
