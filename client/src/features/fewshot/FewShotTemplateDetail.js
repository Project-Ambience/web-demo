import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  useGetFewShotTemplateQuery,
  useUpdateFewShotTemplateMutation,
  useCreateFewShotTemplateMutation,
  useDeleteFewShotTemplateMutation,
} from '../../app/apiSlice';
import Spinner from '../../components/common/Spinner';

const DetailContainer = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  height: 100%;
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
  padding-right: 4rem;
`;

const Title = styled.h2`
  margin: 0;
  color: #343a40;
`;

const ContentGroup = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #495057;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  min-height: 80px;
  resize: vertical;
`;

const ReadOnlyText = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;
  padding-left: 1rem;
`;

const ExampleCard = styled.div`
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  position: relative;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #005eb8;
  color: white;
  &:hover:not(:disabled) { background-color: #003087; }
`;

const SecondaryButton = styled(Button)`
  background-color: #e9ecef;
  color: #495057;
  border-color: #ced4da;
  &:hover:not(:disabled) { background-color: #dee2e6; }
`;

const DestructiveOutlineButton = styled(Button)`
  background-color: transparent;
  color: #dc3545;
  border-color: #dc3545;
  &:hover:not(:disabled) { 
    background-color: #f8d7da;
    color: #721c24;
  }
`;

const BackLinkButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-weight: bold;
  color: #005eb8;
  text-decoration: none;
  font-size: 1rem;
  cursor: pointer;

  &:before {
    content: '‹ ';
    font-size: 1.2rem;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const RemoveExampleButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 0;
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-weight: 600;
  &:hover { text-decoration: underline; }
`;

const WarningText = styled.div`
  font-size: 0.9rem;
  color: #fd7e14;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #fff3e0;
  border: 1px solid #ffe0b2;
  border-radius: 4px;
`;

const FewShotTemplateDetail = ({ templateId, isReadOnly, templateData, onSaveComplete, onBack, onSelectTemplate, onDeleteComplete }) => {
  const [isEditing, setIsEditing] = useState(!templateId && !templateData);

  const { data: existingTemplate, isLoading, refetch } = useGetFewShotTemplateQuery(templateId, {
    skip: !templateId || !!templateData,
  });

  const [updateTemplate, { isLoading: isUpdating }] = useUpdateFewShotTemplateMutation();
  const [createTemplate, { isLoading: isCreating }] = useCreateFewShotTemplateMutation();
  const [deleteTemplate] = useDeleteFewShotTemplateMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [examples, setExamples] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const activeTemplateData = templateData || existingTemplate;

  const resetState = (template) => {
    setName(template ? template.name : '');
    setDescription(template ? template.description || '' : '');
    setExamples(template ? template.examples.map(ex => ({...ex})) : [{ input: '', output: '' }]);
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    resetState(activeTemplateData);
    if (!templateId && !templateData) {
      setIsEditing(true);
    }
  }, [activeTemplateData, templateId, templateData]);

  const handleFieldChange = (setter) => (e) => {
    setter(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);
    setHasUnsavedChanges(true);
  };

  const addExample = () => {
    setExamples([...examples, { input: '', output: '' }]);
    setHasUnsavedChanges(true);
  };

  const removeExample = (index) => {
    const newExamples = [...examples];
    const example = newExamples[index];
    if (example.id) {
      newExamples[index]._destroy = true;
    } else {
      newExamples.splice(index, 1);
    }
    setExamples(newExamples);
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      few_shot_template: { name, description, examples_attributes: examples }
    };

    try {
      if (templateId) {
        await updateTemplate({ id: templateId, ...payload }).unwrap();
        refetch();
        setIsEditing(false);
      } else {
        const newTemplate = await createTemplate(payload).unwrap();
        onSaveComplete(newTemplate.id);
      }
    } catch (err) {
      alert('Failed to save template: ' + JSON.stringify(err.data));
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this template permanently?')) {
      try {
        await deleteTemplate(templateId).unwrap();
        onDeleteComplete();
      } catch (err) {
        alert('Failed to delete template: ' + JSON.stringify(err.data));
      }
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        resetState(existingTemplate);
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  if (isLoading) return <Spinner />;

  const visibleExamples = examples.filter(ex => !ex._destroy);
  const isSaving = isUpdating || isCreating;

  const finalIsEditing = isReadOnly ? false : isEditing;

  return (
    <DetailContainer>
      <Header>
        <Title>{activeTemplateData ? activeTemplateData.name : 'Create New Template'}</Title>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {finalIsEditing ? (
            <>
              <SecondaryButton onClick={handleCancelEdit}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleSubmit} disabled={!hasUnsavedChanges || isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>
            </>
          ) : (
            <>
              {!isReadOnly && <BackLinkButton onClick={onBack}>Back to List</BackLinkButton>}
              <div style={{ flexGrow: 1 }} />
              {!isReadOnly && (
                <>
                  <DestructiveOutlineButton onClick={handleDelete}>Delete</DestructiveOutlineButton>
                  <SecondaryButton onClick={() => setIsEditing(true)}>Edit</SecondaryButton>
                  <PrimaryButton onClick={() => onSelectTemplate(templateId)}>Select Template</PrimaryButton>
                </>
              )}
            </>
          )}
        </div>
      </Header>
      
      {visibleExamples.length >= 5 && (
        <WarningText>
          Warning: This template has {visibleExamples.length} examples, which may impact model performance.
        </WarningText>
      )}

      {finalIsEditing ? (
        <form onSubmit={handleSubmit}>
          <ContentGroup>
            <Label htmlFor="templateName">Template Name</Label>
            <Input id="templateName" value={name} onChange={handleFieldChange(setName)} required />
            <Label htmlFor="templateDescription" style={{ marginTop: '1rem' }}>Description (Optional)</Label>
            <Textarea id="templateDescription" value={description} onChange={handleFieldChange(setDescription)} />
          </ContentGroup>
          <ContentGroup>
            <h3 style={{ marginTop: 0 }}>Examples</h3>
            {visibleExamples.map((ex, index) => {
              const originalIndex = examples.findIndex(e => e === ex);
              return (
                <ExampleCard key={ex.id || `new-${index}`}>
                  <Label>Input</Label>
                  <Textarea value={ex.input} onChange={(e) => handleExampleChange(originalIndex, 'input', e.target.value)} />
                  <Label style={{ marginTop: '1rem' }}>Output</Label>
                  <Textarea value={ex.output} onChange={(e) => handleExampleChange(originalIndex, 'output', e.target.value)} />
                  <RemoveExampleButton type="button" onClick={() => removeExample(originalIndex)}>Remove</RemoveExampleButton>
                </ExampleCard>
              )
            })}
            <SecondaryButton type="button" onClick={addExample} style={{ marginTop: '1.5rem' }}>
              + Add Example
            </SecondaryButton>
          </ContentGroup>
        </form>
      ) : (
        <>
          <ContentGroup>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid #e9ecef', paddingBottom: '1rem' }}>Description</h3>
            <ReadOnlyText>{activeTemplateData?.description || <em>No description provided.</em>}</ReadOnlyText>
          </ContentGroup>
          <ContentGroup>
            <h3 style={{ marginTop: 0 }}>Examples</h3>
            {visibleExamples.map((ex, index) => (
              <ExampleCard key={ex.id || index}>
                <Label>Input</Label>
                <ReadOnlyText>{ex.input}</ReadOnlyText>
                <Label style={{ marginTop: '1rem' }}>Output</Label>
                <ReadOnlyText>{ex.output}</ReadOnlyText>
              </ExampleCard>
            ))}
          </ContentGroup>
        </>
      )}
    </DetailContainer>
  );
};

export default FewShotTemplateDetail;
