import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { 
  useGetAiModelByIdQuery, 
  useGetClinicianTypesQuery, 
  useCreateFineTuneRequestMutation 
} from '../app/apiSlice';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

const PageWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: 960px) {
    grid-template-columns: 2fr 1fr;
  }

  gap: 2rem;
`;

const MainContent = styled.div`
  background-color: #fff;
  padding: 2rem;
  border: 1px solid #e8edee;
  border-radius: 4px;
`;

const Sidebar = styled.div`
  background-color: #f0f4f5;
  padding: 1.5rem;
  border-radius: 4px;
  height: fit-content;
`;

const Section = styled.section`
  margin-bottom: 2rem;

  h3 {
    font-size: 1.25rem;
    color: #4c6272;
    border-bottom: 2px solid #e8edee;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #aeb7bd;
    font-family: inherit;
    font-size: 1rem;
    margin-bottom: 1rem;
    resize: vertical;

    &:focus {
      outline: 2px solid #005eb8;
      border-color: #005eb8;
    }
  }
`;

const ButtonBase = styled.button`
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent;
  width: 100%;
  margin-bottom: 0.5rem;
  text-align: center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(ButtonBase)`
  background-color: #005eb8;
  color: white;

  &:hover:not(:disabled) {
    background-color: #003087;
  }
`;

const ToggleButton = styled.button`
  font-size: 0.85rem;
  background: none;
  border: none;
  color: #005eb8;
  cursor: pointer;
  margin-bottom: 0.75rem;
  padding: 0;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;

const FormatBox = styled.pre`
  background-color: #fff;
  border: 1px solid #cdd4d8;
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 2rem;
  font-weight: bold;
  color: #005eb8;
  text-decoration: none;

  &:before {
    content: '‹ ';
    font-size: 1.2rem;
  }

  &:hover {
    text-decoration: underline;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
`;

const ModalTitle = styled.h4`
  margin-top: 0;
  font-size: 1.25rem;
`;

const ParamList = styled.ul`
  list-style: none;
  padding: 0;
  font-size: 0.95rem;

  li {
    margin-bottom: 0.5rem;
  }

  strong {
    color: #003087;
  }
`;

const ModalButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
  gap: 1rem;
`;

const ModalButton = styled(ButtonBase)`
  width: auto;
  padding: 0.5rem 1.25rem;
`;

const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 110%;
  left: 0;
  background-color: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  
  ${FileInputWrapper}:hover & {
    opacity: 1;
  }
`;

const ErrorTooltip = styled.div`
  position: absolute;
  bottom: 110%;
  left: 0;
  background-color: #e53935;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
`;


const FineTunePage = () => {
  const { id } = useParams();
  const { data: model, isLoading, isError } = useGetAiModelByIdQuery(id);

  const {
    data: clinicianTypes,
    isLoading: isClinicianTypesLoading,
    isError: isClinicianTypesError,
  } = useGetClinicianTypesQuery();

  const [createFineTuneRequest, { isLoading: isSubmitting }] = useCreateFineTuneRequestMutation();

  const [modelName, setModelName] = useState('');
  const [description, setDescription] = useState('');
  const [taskId, setTaskId] = useState('');
  const [clinicianTypeId, setClinicianTypeId] = useState('');
  const [file, setFile] = useState(null);
  const [showFormat, setShowFormat] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitParams, setSubmitParams] = useState(null);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [fileError, setFileError] = useState('');


  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded && uploaded.type === 'application/json') {
      setFile(uploaded);
    } 
    else {
      setSubmissionError('Please upload a fine-tuning .json file.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!file) {
      setSubmissionError('Please upload a fine-tuning .json file.');
      return;
    }
    
    const selectedTask = model.fine_tune_tasks.find((t) => String(t.id) === String(taskId));
    const selectedClinician = clinicianTypes.find((c) => String(c.id) === String(clinicianTypeId));
    
    setSubmitParams({
      modelName,
      description,
      task: selectedTask?.title || '(unknown)',
      clinicianType: selectedClinician?.name || '(unknown)',
      fileName: file.name,
    });
  
    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    if (!submitParams) return;
  
    const formData = new FormData();
    formData.append('name', modelName);
    formData.append('description', description);
    formData.append('fine_tune_task_id', taskId);
    formData.append('clinician_type_id', clinicianTypeId);
    formData.append('file', file);
    formData.append('ai_model_id', model.id);
  
    try {
      await createFineTuneRequest(formData).unwrap();
      setSubmissionSuccess('Fine-tune request submitted successfully!');
      setShowConfirmModal(false);
    } catch (err) {
      const message = err?.data?.error || 'Failed to submit fine-tune request.';
      setSubmissionError(message);
      setShowConfirmModal(false);
    }
  };  

  if (isLoading || isClinicianTypesLoading) return <Spinner />;
  if (isError || isClinicianTypesError) return <ErrorMessage>Failed to load data.</ErrorMessage>;

  return (
    <div>
      <BackLink to={`/ai-models/${model.id}`}>Back to model</BackLink>
      <PageWrapper>
        <MainContent>
          <Section>
            <h3>Fine tune {model.name}</h3>

            {submissionError && (
              <div style={{
                backgroundColor: '#fdecea',
                color: '#a4282a',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                padding: '1rem',
                marginBottom: '1rem',
              }}>
                {submissionError}
              </div>
            )}

            {submissionSuccess && (
              <div style={{
                backgroundColor: '#e6f4ea',
                color: '#1e4620',
                border: '1px solid #a5d6a7',
                borderRadius: '4px',
                padding: '1rem',
                marginBottom: '1rem',
              }}>
                {submissionSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label htmlFor="modelName">Model name</label>
              <input
                id="modelName"
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Enter a new name for the fine-tuned model"
                required
              />
  
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this fine-tuned model"
                required
              />
  
              <label htmlFor="task">Task</label>
              <select
                id="task"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                required
              >
                <option value="">Select task</option>
                {model.fine_tune_tasks.map((taskItem) => (
                  <option key={taskItem.id} value={taskItem.id}>
                    {taskItem.title}
                  </option>
                ))}
              </select>
  
              <label htmlFor="clinicianType">Clinician type</label>
              <select
                id="clinicianType"
                value={clinicianTypeId}
                onChange={(e) => setClinicianTypeId(e.target.value)}
                required
              >
                <option value="">Select clinician type</option>
                {clinicianTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
  
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </PrimaryButton>
            </form>
          </Section>
  
          <Section>
            <h3>History</h3>
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              {model.model_fine_tune_requests?.length > 0 ? (
                model.model_fine_tune_requests.map((request, index) => (
                  <div
                    key={request.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      borderBottom:
                        index !== model.model_fine_tune_requests.length - 1
                          ? '1px solid #ccc'
                          : 'none',
                      backgroundColor: '#fff',
                    }}
                  >
                    <div>
                      <strong>Model name:</strong> {request.name}
                      <br />
                      <strong>Status:</strong> {request.status}
                      <br />
                      <strong>Task:</strong> {request.task}
                      <br />
                      <strong>Created at:</strong> {request.created_at}
                    </div>
                    <div>
                      {request.status === 'done' && (
                        <Link
                          to={`/ai-models/${request.new_ai_model_id}`}
                          style={{
                            color: '#005eb8',
                            fontWeight: 'normal',
                            fontSize: '0.95rem',
                          }}
                        >
                          Visit model
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ padding: '1rem' }}>No fine-tune requests submitted yet.</p>
              )}
            </div>
          </Section>
        </MainContent>
  
        <Sidebar>
          <Section>
            <h3>Fine-Tuning Data</h3>
            <label htmlFor="file">Upload JSON file</label>
            <FileInputWrapper>
              <input
                id="file"
                type="file"
                accept=".json"
                onChange={(e) => {
                  const uploaded = e.target.files[0];
                  const maxSizeMB = 50;
                  const maxSizeBytes = maxSizeMB * 1024 * 1024;

                  if (uploaded) {
                    if (uploaded.size > maxSizeBytes) {
                      setFile(null);
                      setFileError(`File size should not exceed ${maxSizeMB}MB`);
                      e.target.value = '';
                      setTimeout(() => setFileError(''), 4000);
                    } else if (uploaded.type !== 'application/json') {
                      setFile(null);
                      setFileError('Please upload a .json file');
                      e.target.value = '';
                      setTimeout(() => setFileError(''), 4000);
                    } else {
                      setFile(uploaded);
                      setFileError('');
                    }
                  }
                }}
                required
              />
              <Tooltip>Max 1 file, 50MB</Tooltip>
              {fileError && <ErrorTooltip>{fileError}</ErrorTooltip>}
            </FileInputWrapper>

            {file && (
              <p>
                <strong>Selected file:</strong> {file.name}
              </p>
            )}
  
            <ToggleButton type="button" onClick={() => setShowFormat((prev) => !prev)}>
              {showFormat ? 'Hide format' : 'View expected format'}
            </ToggleButton>
  
            {showFormat && (
              <FormatBox>
                {(() => {
                  try {
                    const parsed = JSON.parse(model.fine_tune_data_format);
                    return JSON.stringify(parsed, null, 2);
                  } catch (err) {
                    return 'Invalid JSON format';
                  }
                })()}
              </FormatBox>
            )}
          </Section>
        </Sidebar>
      </PageWrapper>
  
      {showConfirmModal && submitParams && (
        <ModalOverlay>
          <ModalBox>
            <ModalTitle>Confirm Submission</ModalTitle>
            <p>
              Are you sure you want to submit a fine-tune request for model{' '}
              <strong>{model.name}</strong>?
            </p>
            <ParamList>
              <li>
                <strong>Model name:</strong> {submitParams.modelName}
              </li>
              <li>
                <strong>Description:</strong> {submitParams.description}
              </li>
              <li>
                <strong>Task:</strong> {submitParams.task}
              </li>
              <li>
                <strong>Clinician type:</strong> {submitParams.clinicianType}
              </li>
              <li>
                <strong>File:</strong> {submitParams.fileName}
              </li>
            </ParamList>
            <ModalButtonGroup>
              <ModalButton onClick={() => setShowConfirmModal(false)}>Cancel</ModalButton>
              <PrimaryButton onClick={handleConfirmedSubmit}>Submit</PrimaryButton>
            </ModalButtonGroup>
          </ModalBox>
        </ModalOverlay>
      )}
    </div>
  );  
};

export default FineTunePage;
