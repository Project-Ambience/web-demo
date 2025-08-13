import React, { useState } from 'react';
import styled from 'styled-components';
import MaterialIcon from '../../components/common/MaterialIcon';
import ToggleSwitch from '../../components/common/ToggleSwitch';

const PanelContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
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

const RAGWrapper = styled.div`
  position: relative;
`;

const SubMenuRight = styled.div`
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 0.25rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 20;
  min-width: 220px;
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
  margin-left: auto;
  > *:last-child {
    margin-right: 0;
  }
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

const DisabledRow = styled(Row)`
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
`;

const AddContentPanel = ({
  onFileUpload,
  onAddFewShot,
  isCoTEnabled,
  onToggleCoT,
  onShowCoTInfo,
  onShowFewShotInfo,
  onShowRagInfo,
  isRAGEnabled,
  onToggleRAG,
  supportsRAG,
  onAddRagData
}) => {
  const [isRAGOpen, setIsRAGOpen] = useState(false);

  return (
    <PanelContainer>
      <ButtonWrapper>
        <PanelButton onClick={onFileUpload}>
          📎 Upload File
        </PanelButton>
        <TooltipText>Max 1 file, 100MB</TooltipText>
      </ButtonWrapper>

      <RAGWrapper>
        {supportsRAG ? (
          <Row onClick={() => setIsRAGOpen(!isRAGOpen)}>
            <LabelWrapper>
              <span>📚 RAG</span>
            </LabelWrapper>
            <MaterialIcon iconName="chevron_right" />
          </Row>
        ) : (
          <DisabledRow>
            <LabelWrapper>
              <span>📚 RAG (Not Supported)</span>
            </LabelWrapper>
          </DisabledRow>
        )}

        {supportsRAG && isRAGOpen && (
          <SubMenuRight>
            <Row
              onClick={(e) => {
                e.preventDefault();
                onToggleRAG();
              }}
            >
              <LabelWrapper>
                <span>Enable</span>
              </LabelWrapper>
              <ControlsWrapper>
                <ToggleSwitch isOn={isRAGEnabled} handleToggle={onToggleRAG} />
                <InfoIcon
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onShowRagInfo();
                  }}
                  aria-label="About RAG"
                >
                  <MaterialIcon iconName="help_outline" />
                </InfoIcon>
              </ControlsWrapper>
            </Row>

            <Row
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onAddRagData) onAddRagData();
              }}
            >
              <LabelWrapper>
                <span>➕ Add data to RAG</span>
              </LabelWrapper>
            </Row>
          </SubMenuRight>
        )}
      </RAGWrapper>

      <Row onClick={onToggleCoT}>
        <LabelWrapper>
          <span>💭 Enable Thinking</span>
        </LabelWrapper>
        <ControlsWrapper>
          <ToggleSwitch isOn={isCoTEnabled} handleToggle={onToggleCoT} />
          <InfoIcon
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShowCoTInfo();
            }}
            aria-label="About Thinking"
          >
            <MaterialIcon iconName="help_outline" />
          </InfoIcon>
        </ControlsWrapper>
      </Row>

      <ClickableRow onClick={onAddFewShot}>
        <LabelWrapper>
          <span>✨ Add Few-Shot</span>
        </LabelWrapper>
        <ControlsWrapper>
          <InfoIcon
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShowFewShotInfo();
            }}
            aria-label="About Few-Shot"
          >
            <MaterialIcon iconName="help_outline" />
          </InfoIcon>
        </ControlsWrapper>
      </ClickableRow>
    </PanelContainer>
  );
};

export default AddContentPanel;
