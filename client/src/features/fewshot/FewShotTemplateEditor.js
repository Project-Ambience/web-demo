import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  useGetFewShotTemplateQuery,
  useUpdateFewShotTemplateMutation,
  useCreateFewShotTemplateMutation,
} from '../../app/apiSlice';
import Spinner from '../../components/common/Spinner';

const EditorContainer = styled.div`
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
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
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
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
  transition: background-color 0.2s, color 0.2s;
`;

const PrimaryButton = styled(Button)`
  background-color: #005eb8;
  color: white;
  &:hover:not(:disabled) { background-color: #003087; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const SecondaryButton = styled(Button)`
  background-color: #e9ecef;
  color: #495057;
  border-color: #ced4da;
  &:hover { background-color: #dee2e6; }
`;

const DeleteButton = styled.button`
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
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fff3e0;
  border: 1px solid #ffe0b2;
  border-radius: 4px;
`;


const FewShotTemplateEditor = ({ templateId, onSaveComplete, onCancel }) => {
  const { data: existingTemplate, isLoading } = useGetFewShotTemplateQuery(templateId, {
    skip: !templateId,
  });

  const [updateTemplate, { isLoading: isUpdating }] = useUpdateFewShotTemplateMutation();
  const [createTemplate, { isLoading: isCreating }] = useCreateFewShotTemplateMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [examples, setExamples] = useState([]);

  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name);
      setDescription(existingTemplate.description || '');
      setExamples(existingTemplate.examples);
    } else {
      setName('');
      setDescription('');
      setExamples([{ input: '', output: '' }]);
    }
  }, [existingTemplate]);

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setExamples(newExamples);
  };

  const addExample = () => {
    setExamples([...examples, { input: '', output: '' }]);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      few_shot_template: {
        name,
        description,
        examples_attributes: examples,
      }
    };

    try {
      if (templateId) {
        await updateTemplate({ id: templateId, ...payload }).unwrap();
      } else {
        await createTemplate(payload).unwrap();
      }
      onSaveComplete();
    } catch (err) {
      alert('Failed to save template: ' + JSON.stringify(err.data));
    }
  };

  if (isLoading) return <Spinner />;

  const visibleExamples = examples.filter(ex => !ex._destroy);

  return (
    <EditorContainer>
      <Header>
        <Title>{templateId ? 'Edit Template' : 'Create New Template'}</Title>
        <div>
          <SecondaryButton onClick={onCancel} style={{ marginRight: '0.5rem' }}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={isUpdating || isCreating}>
            {isUpdating || isCreating ? 'Saving...' : 'Save Changes'}
          </PrimaryButton>
        </div>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="templateName">Template Name</Label>
          <Input id="templateName" value={name} onChange={(e) => setName(e.target.value)} required />
          <Label htmlFor="templateDescription" style={{ marginTop: '1rem' }}>Description (Optional)</Label>
          <Textarea id="templateDescription" value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <h3 style={{ marginTop: 0 }}>Examples</h3>
          {visibleExamples.map((ex, index) => {
            const originalIndex = examples.findIndex(e => e === ex);
            return (
              <ExampleCard key={ex.id || index}>
                <Label>Input</Label>
                <Textarea value={ex.input} onChange={(e) => handleExampleChange(originalIndex, 'input', e.target.value)} />
                <Label style={{ marginTop: '1rem' }}>Output</Label>
                <Textarea value={ex.output} onChange={(e) => handleExampleChange(originalIndex, 'output', e.target.value)} />
                <DeleteButton type="button" onClick={() => removeExample(originalIndex)}>Delete</DeleteButton>
              </ExampleCard>
            )
          })}
          <SecondaryButton type="button" onClick={addExample} style={{ marginTop: '1.5rem' }}>
            + Add Example
          </SecondaryButton>
          {visibleExamples.length >= 5 && (
            <WarningText>
              Warning: Using 5 or more examples may impact model performance.
            </WarningText>
          )}
        </FormGroup>
      </Form>
    </EditorContainer>
  );
};

export default FewShotTemplateEditor;
