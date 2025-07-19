import React from 'react';
import styled from 'styled-components';
import { useGetFewShotTemplatesQuery, useDeleteFewShotTemplateMutation } from '../../app/apiSlice';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const ListContainer = styled.div`
  padding: 1.5rem;
  background-color: #f8f9fa;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  color: #343a40;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  flex: 1;
`;

const TemplateCard = styled.div`
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TemplateName = styled.h4`
  margin: 0 0 0.5rem;
  color: #005eb8;
`;

const TemplateDescription = styled.p`
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0 0 1rem;
  flex-grow: 1;
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  flex: 1;
`;

const PrimaryButton = styled(Button)`
  background-color: #005eb8;
  color: white;
  &:hover { background-color: #003087; }
`;

const SecondaryButton = styled(Button)`
  background-color: #e9ecef;
  color: #495057;
  border-color: #ced4da;
  &:hover { background-color: #dee2e6; }
`;

const DeleteButton = styled(Button)`
  background-color: transparent;
  color: #dc3545;
  border: none;
  padding: 0.25rem;
  margin-left: auto;
  flex: 0;
  font-size: 0.8rem;
  &:hover { text-decoration: underline; }
`;

const WarningText = styled.div`
  font-size: 0.8rem;
  color: #fd7e14;
  margin-top: 0.75rem;
`;

const FewShotTemplateList = ({ onSelectTemplate, onEditTemplate, onCreateNew, onBackToChat }) => {
  const { data: templates, isLoading, isError, error } = useGetFewShotTemplatesQuery();
  const [deleteTemplate] = useDeleteFewShotTemplateMutation();

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage>{JSON.stringify(error)}</ErrorMessage>;

  return (
    <ListContainer>
      <Header>
        <Title>Few-Shot Templates</Title>
        <div>
          <SecondaryButton onClick={onBackToChat} style={{ marginRight: '0.5rem' }}>Back to Chat</SecondaryButton>
          <PrimaryButton onClick={onCreateNew}>Create New</PrimaryButton>
        </div>
      </Header>
      <TemplateGrid>
        {templates.map(template => (
          <TemplateCard key={template.id}>
            <div>
              <TemplateName>{template.name}</TemplateName>
              <TemplateDescription>
                {template.description || <em>No description provided.</em>}
              </TemplateDescription>
              {template.examples.length >= 5 && (
                <WarningText>
                  Warning: {template.examples.length} examples may impact performance.
                </WarningText>
              )}
            </div>
            <ButtonGroup>
              <SecondaryButton onClick={() => onEditTemplate(template.id)}>Edit</SecondaryButton>
              <PrimaryButton onClick={() => onSelectTemplate(template.id)}>Select</PrimaryButton>
              <DeleteButton onClick={() => handleDelete(template.id)}>Delete</DeleteButton>
            </ButtonGroup>
          </TemplateCard>
        ))}
      </TemplateGrid>
    </ListContainer>
  );
};

export default FewShotTemplateList;
