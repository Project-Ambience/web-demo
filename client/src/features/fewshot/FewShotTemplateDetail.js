import React, { useState, useEffect, useRef } from 'react';
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
  position: sticky;
  top: -1.5rem;
  margin: -1.5rem -1.5rem 0;
  padding: 1.5rem 4.5rem 1rem 1.5rem;
  background: white;
  z-index: 1;
  display: flex;
  align-items: center;
  border-bottom: 2px solid #e9ecef;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
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
  margin-top: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #495057;
  padding-top: 0.5rem;
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
  padding: 0.5rem 0;
`;

const ExampleCard = styled.div`
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  position: relative;
`;

const ExampleHeader = styled.h4`
  font-size: 1.1rem;
  color: #495057;
  margin-top: 0;
  margin-bottom: 1rem;
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  align-items: start;
  gap: 1rem;
  margin-bottom: 1rem;

  &:last-of-type {
    margin-bottom: 0;
  }
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

const OutlineButton = styled(Button)`
  background-color: transparent;
  color: #005eb8;
  border: 1px solid #005eb8;
  &:hover:not(:disabled) { 
    background-color: #eaf1f8; 
  }
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
  font-weight: 600;
`;

const ErrorText = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
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
  const [errors, setErrors] = useState({});

  const nameInputRef = useRef(null);
  const exampleRefs = useRef(new Map());

  const activeTemplateData = templateData || existingTemplate;

  useEffect(() => {
    if (Object.keys(errors).length === 0) return;

    const scrollOptions = { behavior: 'smooth', block: 'center' };

    if (errors.name && nameInputRef.current) {
      nameInputRef.current.scrollIntoView(scrollOptions);
      return;
    }

    if (errors['examples.input'] || errors['examples.output']) {
      for (let i = 0; i < examples.length; i++) {
        const example = examples[i];
        if (example._destroy) continue;

        const isInputBlank = !example.input?.trim();
        const isOutputBlank = !example.output?.trim();

        if (errors['examples.input'] && isInputBlank) {
          const el = exampleRefs.current.get(`${i}-input`);
          if (el) {
            el.scrollIntoView(scrollOptions);
            return;
          }
        }

        if (errors['examples.output'] && isOutputBlank) {
          const el = exampleRefs.current.get(`${i}-output`);
          if (el) {
            el.scrollIntoView(scrollOptions);
            return;
          }
        }
      }
    }
  }, [errors, examples]);

  const resetState = (template) => {
    setName(template ? template.name : '');
    setDescription(template ? template.description || '' : '');
    setExamples(template ? template.examples.map(ex => ({...ex})) : [{ input: '', output: '' }]);
    setHasUnsavedChanges(false);
    setErrors({});
  };

  useEffect(() => {
    resetState(activeTemplateData);
    if (!templateId && !templateData) {
      setIsEditing(true);
    }
  }, [activeTemplateData, templateId, templateData]);

  const handleFieldChange = (setter, fieldName) => (e) => {
    setter(e.target.value);
    setHasUnsavedChanges(true);
    if (errors[fieldName]) {
      const newErrors = { ...errors };
      delete newErrors[fieldName];
      setErrors(newErrors);
    }
  };

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);
    setHasUnsavedChanges(true);

    const errorKey = `examples.${field}`;
    if (errors[errorKey]) {
        const newErrors = { ...errors };
        delete newErrors[errorKey];
        setErrors(newErrors);
    }
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
    setErrors({});
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
      if (err.data) {
        setErrors(err.data);
      } else {
        setErrors({ general: "An unexpected error occurred. Please try again." });
      }
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
    if (!templateId) {
      if (hasUnsavedChanges) {
        if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
          onBack();
        }
      } else {
        onBack();
      }
      return;
    }

    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        resetState(existingTemplate);
        setIsEditing(false);
      }
    } else {
      resetState(existingTemplate);
      setIsEditing(false);
    }
  };

  const setExampleRef = (index, type) => (el) => {
    const key = `${index}-${type}`;
    if (el) {
      exampleRefs.current.set(key, el);
    } else {
      exampleRefs.current.delete(key);
    }
  };

  if (isLoading) return <Spinner />;

  const visibleExamples = examples.filter(ex => !ex._destroy);
  const isSaving = isUpdating || isCreating;

  const finalIsEditing = isReadOnly ? false : isEditing;

  return (
    <DetailContainer>
      <Header>
        {!finalIsEditing && !isReadOnly && <BackLinkButton onClick={onBack}>Back to List</BackLinkButton>}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto' }}>
          {finalIsEditing ? (
            <>
              <SecondaryButton onClick={handleCancelEdit}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </PrimaryButton>
            </>
          ) : (
            <>
              {!isReadOnly && (
                <>
                  <DestructiveOutlineButton onClick={handleDelete}>Delete</DestructiveOutlineButton>
                  <OutlineButton onClick={() => setIsEditing(true)}>Edit</OutlineButton>
                  <PrimaryButton onClick={() => onSelectTemplate(templateId)}>Select Template</PrimaryButton>
                </>
              )}
            </>
          )}
        </div>
      </Header>

      <TitleRow>
        <Title>
          {activeTemplateData ? activeTemplateData.name : 'Create New Template'}
        </Title>
        {visibleExamples.length >= 5 && (
          <WarningText>
            Warning: This template has {visibleExamples.length} examples. Using 5 or more examples may impact model performance.
          </WarningText>
        )}
      </TitleRow>

      {errors.general && <ErrorText style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>{errors.general}</ErrorText>}

      {finalIsEditing ? (
        <form>
          <ContentGroup>
            <Label htmlFor="templateName">Template Name</Label>
            <Input ref={nameInputRef} id="templateName" value={name} onChange={handleFieldChange(setName, 'name')} required />
            {errors.name && <ErrorText>{errors.name.join(', ')}</ErrorText>}

            <Label htmlFor="templateDescription" style={{ marginTop: '1rem' }}>Description (Optional)</Label>
            <Textarea id="templateDescription" value={description} onChange={handleFieldChange(setDescription, 'description')} />
          </ContentGroup>
          <ContentGroup>
            <h3 style={{ marginTop: 0 }}>Examples</h3>
            {visibleExamples.map((ex, index) => {
              const originalIndex = examples.findIndex(e => e === ex);
              const isInputBlank = !ex.input || ex.input.trim() === '';
              const isOutputBlank = !ex.output || ex.output.trim() === '';
              const hasInputError = errors['examples.input'] && isInputBlank;
              const hasOutputError = errors['examples.output'] && isOutputBlank;

              return (
                <ExampleCard key={ex.id || `new-${index}`}>
                  <ExampleHeader>Example {index + 1}</ExampleHeader>
                  <FieldRow>
                    <Label>Input</Label>
                    <div>
                      <Textarea ref={setExampleRef(originalIndex, 'input')} value={ex.input} onChange={(e) => handleExampleChange(originalIndex, 'input', e.target.value)} />
                      {hasInputError && <ErrorText>{errors['examples.input'].join(', ')}</ErrorText>}
                    </div>
                  </FieldRow>
                  <FieldRow>
                    <Label>Output</Label>
                    <div>
                      <Textarea ref={setExampleRef(originalIndex, 'output')} value={ex.output} onChange={(e) => handleExampleChange(originalIndex, 'output', e.target.value)} />
                      {hasOutputError && <ErrorText>{errors['examples.output'].join(', ')}</ErrorText>}
                    </div>
                  </FieldRow>
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
                <ExampleHeader>Example {index + 1}</ExampleHeader>
                <FieldRow>
                  <Label>Input</Label>
                  <ReadOnlyText>{ex.input}</ReadOnlyText>
                </FieldRow>
                <FieldRow>
                  <Label>Output</Label>
                  <ReadOnlyText>{ex.output}</ReadOnlyText>
                </FieldRow>
              </ExampleCard>
            ))}
          </ContentGroup>
        </>
      )}
    </DetailContainer>
  );
};

export default FewShotTemplateDetail;
