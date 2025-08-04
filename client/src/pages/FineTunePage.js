import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useGetAiModelByIdQuery,
  useGetClinicianTypesQuery,
  useCreateFineTuneRequestMutation,
  useGetQueueTrafficQuery,
} from '../app/apiSlice';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const InlineSpinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: ${spinAnimation} 1s linear infinite;
`;

const PageWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 960px) {
    grid-template-columns: 2fr 1fr;
  }
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

const SecondaryButton = styled(ButtonBase)`
  background-color: white;
  color: #005eb8;
  border: 2px solid #005eb8;

  &:hover:not(:disabled) {
    background-color: #e8edee;
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

const UploadButton = styled(PrimaryButton)`
  border: 2px dashed transparent;
  background-color: ${({ isDragging }) => (isDragging ? '#003087' : '#005eb8')};
  border-color: ${({ isDragging }) => (isDragging ? '#fff' : 'transparent')};
  margin-bottom: 0.5rem;
`;

const FileDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #eaf1f8;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const FileErrorText = styled.p`
  color: #c62828;
  font-size: 0.85rem;
  text-align: center;
  margin-top: -0.25rem;
  margin-bottom: 1rem;
  height: 1rem;
`;

const SuccessPanel = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  
  h3 {
    font-size: 1.75rem;
    color: #003087;
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 1rem;
    color: #4c6272;
    margin-bottom: 1.5rem;
  }
`;

const FineTunePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: model, isLoading, isError } = useGetAiModelByIdQuery(id);

  const {
    data: clinicianTypes,
    isLoading: isClinicianTypesLoading,
    isError: isClinicianTypesError,
  } = useGetClinicianTypesQuery();

  const [createFineTuneRequest, { isLoading: isSubmitting }] = useCreateFineTuneRequestMutation();
  
  const { data: trafficData, isLoading: isTrafficLoading, isError: isTrafficError } = useGetQueueTrafficQuery(undefined, {
    pollingInterval: 15000,
  });

  const [modelName, setModelName] = useState('');
  const [description, setDescription] = useState('');
  const [fine_tuning_notes, setFineTuningNotes] = useState('');
  const [taskId, setTaskId] = useState('');
  const [clinicianTypeId, setClinicianTypeId] = useState('');
  const [file, setFile] = useState(null);
  const [showFormat, setShowFormat] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitParams, setSubmitParams] = useState(null);
  const [submissionError, setSubmissionError] = useState('');
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showQueueWarning, setShowQueueWarning] = useState(false);
  const [submissionState, setSubmissionState] = useState('idle');
  const [isValidatingFile, setIsValidatingFile] = useState(false);

  const fileInputRef = useRef(null);
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  const resetForm = () => {
    setModelName('');
    setDescription('');
    setFineTuningNotes('');
    setTaskId('');
    setClinicianTypeId('');
    setFile(null);
    setSubmissionError('');
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const parseCsvToJson = (csvText) => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const obj = {};
        const currentline = lines[i].split(',');
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j] ? currentline[j].trim().replace(/^"|"$/g, '') : '';
        }
        result.push(obj);
    }
    return result;
  };

  const validateJsonData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { isValid: false, message: 'Dataset must be a non-empty array of objects.' };
    }
    for (const [index, item] of data.entries()) {
      if (typeof item !== 'object' || item === null) {
        return { isValid: false, message: `Record ${index + 1} is not a valid object.` };
      }
      for (const key in item) {
        const value = item[key];
        if (value == null || (typeof value === 'string' && value.trim() === '')) {
          const lineNumber = index + 2;
          return { isValid: false, message: `Record ${index + 1} (line ${lineNumber}) has an empty value for field "${key}".` };
        }
      }
    }
    return { isValid: true };
  };

  const handleFileSelection = async (files) => {
    if (!files || files.length === 0) return;
    setIsValidatingFile(true);
    const uploaded = files[0];
    const maxSizeMB = 100;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const fileExtension = uploaded.name.substring(uploaded.name.lastIndexOf('.'));
  
    try {
      if (!uploaded) throw new Error("No file selected.");
      if (uploaded.size > maxSizeBytes) {
        throw new Error(`File size should not exceed ${maxSizeMB}MB`);
      }
      
      const fileText = await uploaded.text();
      let jsonData;

      if (fileExtension.toLowerCase() === '.json') {
          jsonData = JSON.parse(fileText);
      } else {
          jsonData = parseCsvToJson(fileText);
      }
      
      const validationResult = validateJsonData(jsonData);
      if (!validationResult.isValid) {
        throw new Error(validationResult.message);
      }

      const jsonString = JSON.stringify(jsonData);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const newFileName = uploaded.name.replace(/\.[^/.]+$/, "") + ".json";
      const jsonFile = new File([blob], newFileName, { type: 'application/json' });
      
      setFile(jsonFile);
      setFileError('');
    } catch (e) {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const errorMessage = e instanceof SyntaxError ? 'Invalid JSON syntax. Please check the file content.' : e.message;
      setFileError(errorMessage);
      setTimeout(() => setFileError(''), 4000);
    } finally {
      setIsValidatingFile(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!file) {
      setSubmissionError('Please upload a fine-tuning dataset file.');
      return;
    }
    
    const selectedTask = model.fine_tune_tasks.find((t) => String(t.id) === String(taskId));
    const selectedClinician = clinicianTypes.find((c) => String(c.id) === String(clinicianTypeId));
    
    setSubmitParams({
      modelName,
      description,
      fine_tuning_notes,
      task: selectedTask?.title || '(unknown)',
      clinicianType: selectedClinician?.name || '(unknown)',
      fileName: file.name,
    });
  
    if (trafficData?.formatting?.messages_ready > 5) {
      setShowQueueWarning(true);
    } else {
      setShowConfirmModal(true);
    }
  };
  
  const handleRedirectNow = () => {
    if (redirectTimer.current) {
      clearTimeout(redirectTimer.current);
    }
    navigate('/fine-tune-status');
    resetForm();
    setSubmissionState('idle');
  };

  const handleConfirmedSubmit = async () => {
    if (!submitParams) return;
  
    const formData = new FormData();
    formData.append('name', modelName);
    formData.append('description', description);
    formData.append('fine_tuning_notes', fine_tuning_notes);
    formData.append('fine_tune_task_id', taskId);
    formData.append('clinician_type_id', clinicianTypeId);
    formData.append('file', file);
    formData.append('ai_model_id', model.id);
    
    setSubmissionState('submitting');
    setShowConfirmModal(false);
  
    try {
      await createFineTuneRequest(formData).unwrap();
      setSubmissionState('success');
      
      redirectTimer.current = setTimeout(() => {
        navigate('/fine-tune-status');
        resetForm();
        setSubmissionState('idle');
      }, 2500);

    } catch (err) {
      const message = err?.data?.error || 'Failed to submit fine-tune request.';
      setSubmissionError(message);
      setSubmissionState('idle');
    }
  };  

  if (isLoading || isClinicianTypesLoading) return <Spinner />;
  if (isError || isClinicianTypesError) return <ErrorMessage>Failed to load data.</ErrorMessage>;

  return (
    <div style={{ width: '100%' }}>
      {submissionState === 'success' && (
        <SuccessPanel>
          <h3>Submission Successful!</h3>
          <p>Your formatting request has been added to the queue.<br />You will be redirected shortly.</p>
          <PrimaryButton onClick={handleRedirectNow} style={{ width: 'auto', margin: '0 auto' }}>
            Go to Status Page Now
          </PrimaryButton>
        </SuccessPanel>
      )}

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

              <label htmlFor="fine_tuning_notes">Fine Tuning Notes</label>
              <textarea
                id="fine_tuning_notes"
                value={fine_tuning_notes}
                onChange={(e) => setFineTuningNotes(e.target.value)}
                placeholder="Note for this fine-tuned model"
              />
  
              <PrimaryButton type="submit" disabled={submissionState === 'submitting'}>
                {submissionState === 'submitting' ? 'Submitting...' : 'Submit'}
              </PrimaryButton>
            </form>
          </Section>
        </MainContent>
  
        <Sidebar>
          <Section>
            <h3>Fine-Tuning Data</h3>
            <label htmlFor="file-upload">Upload Dataset File</label>
            <input
              id="file-upload"
              type="file"
              accept=".json,.csv,.txt"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelection(e.target.files)}
            />
            {!file ? (
              <>
                <UploadButton
                  as="button"
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  isDragging={isDragging}
                  disabled={isValidatingFile}
                >
                  {isValidatingFile ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <InlineSpinner />
                      Validating...
                    </span>
                  ) : (
                    'Upload File'
                  )}
                </UploadButton>
                {fileError && <FileErrorText>{fileError}</FileErrorText>}
              </>
            ) : (
              <FileDisplay>
                <strong>{file.name}</strong>
                <SecondaryButton
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  style={{ width: 'auto', padding: '0.2rem 0.8rem', fontSize: '0.8rem', marginBottom: 0 }}
                >Remove</SecondaryButton>
              </FileDisplay>
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
          <Section>
            <h3>Queue Status</h3>
            {isTrafficLoading && <p>Loading traffic...</p>}
            {isTrafficError && <p style={{ color: 'red' }}>Error loading traffic.</p>}
            {trafficData && (
              <div style={{
                background: '#fff',
                border: '1px solid #cdd4d8',
                borderRadius: '4px',
                padding: '1rem',
                fontSize: '0.95rem',
              }}>
                <p>
                  <strong>Formatting Queue:</strong> {trafficData.formatting?.messages_ready || 0}
                </p>
                <p>
                  <strong>Fine-Tuning Queue:</strong> {trafficData.fine_tuning?.messages_ready || 0}
                </p>
              </div>
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
              <li><strong>Model name:</strong> {submitParams.modelName}</li>
              <li><strong>Description:</strong> {submitParams.description}</li>
              <li><strong>Task:</strong> {submitParams.task}</li>
              <li><strong>Clinician type:</strong> {submitParams.clinicianType}</li>
              <li><strong>Fine Tuning Notes:</strong> {submitParams.fine_tuning_notes}</li>
              <li><strong>File:</strong> {submitParams.fileName}</li>
            </ParamList>
            <ModalButtonGroup>
              <ModalButton onClick={() => setShowConfirmModal(false)}>Cancel</ModalButton>
              <PrimaryButton onClick={handleConfirmedSubmit}>Submit</PrimaryButton>
            </ModalButtonGroup>
          </ModalBox>
        </ModalOverlay>
      )}
      {showQueueWarning && submitParams && (
        <ModalOverlay>
          <ModalBox>
            <ModalTitle>High Queue Notice</ModalTitle>
            <p>
              There are currently <strong>{trafficData?.formatting?.messages_ready || 0}</strong> requests waiting to be processed.
              Your request will be added to the queue and may take longer than usual.
            </p>
            <p>Do you still want to continue?</p>
            <ModalButtonGroup>
              <ModalButton onClick={() => setShowQueueWarning(false)}>Cancel</ModalButton>
              <PrimaryButton onClick={() => { setShowQueueWarning(false); setShowConfirmModal(true); }}>
                Continue
              </PrimaryButton>
            </ModalButtonGroup>
          </ModalBox>
        </ModalOverlay>
      )}
    </div>
  );  
};

export default FineTunePage;
