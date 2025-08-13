import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useGetAiModelByIdQuery,
  useGetClinicianTypesQuery,
  useCreateFineTuneRequestMutation,
  useGetQueueTrafficQuery,
  useGetAiModelsQuery,
  useGetFineTuneRequestsQuery,
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

const ValidationErrorText = styled(FileErrorText)`
  margin-top: -1rem;
  text-align: left;
`;

const SuccessPanel = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f4f7f6;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
`;

const ContentBox = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem 3rem;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SuccessHeader = styled.h2`
  font-size: 2rem;
  color: #005eb8;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #4c6272;
  margin-bottom: 2.5rem;
`;

const LifecycleList = styled.ul`
  list-style: none;
  padding-left: 1rem;
  margin: 0;
  text-align: left;
`;

const LifecycleItem = styled.li`
  position: relative;
  padding-left: 2rem;
  padding-bottom: 2rem;
  
  &:last-child {
    padding-bottom: 0;
  }

  &::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 7px;
    width: 1px;
    height: 100%;
    background-color: #ced4da;
  }

  &:last-child::before {
    height: 0;
  }
`;

const LifecycleDot = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid #005eb8;
  background-color: #fff;
  z-index: 1;
`;

const LifecycleContent = styled.div`
  h5 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    color: #003087;
  }
  p {
    margin: 0;
    font-size: 0.95rem;
    color: #4c6272;
    line-height: 1.5;
  }
`;

const CheckmarkIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#2e7d32"/>
      <path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const FormatDisplayContainer = styled.div`
  border: 1px solid #cdd4d8;
  border-radius: 4px;
  overflow: hidden;
`;

const FormatTabs = styled.div`
  display: flex;
  background-color: #f0f4f5;
  border-bottom: 1px solid #cdd4d8;
`;

const FormatTab = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background-color: ${({ isActive }) => (isActive ? '#fff' : 'transparent')};
  color: ${({ isActive }) => (isActive ? '#005eb8' : '#4c6272')};
  border-bottom: 2px solid ${({ isActive }) => (isActive ? '#005eb8' : 'transparent')};
  margin-bottom: -1px;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ isActive }) => (isActive ? '#fff' : '#e8edee')};
  }
`;

const CodeBlock = styled.pre`
  background-color: #fff;
  padding: 1rem;
  margin: 0;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
`;

const FAILED_STATUSES = ['formatting_failed', 'fine_tuning_failed', 'formatting_rejected'];

const JSON_EXAMPLE = `[
  {
    "instruction": "Summarize the clinical note.",
    "input": "Patient is a 65-year-old male with a history of hypertension and type 2 diabetes...",
    "response": "65yo M w/ hx HTN, T2DM."
  },
  {
    "instruction": "Extract the key symptom.",
    "input": "A 42-year-old female presents with acute abdominal pain in the right lower quadrant...",
    "response": "Symptom: Acute RLQ abdominal pain."
  }
]`;

const CSV_EXAMPLE = `instruction,input,response
"Summarize the clinical note.","Patient is a 65-year-old male with a history of hypertension and type 2 diabetes...","65yo M w/ hx HTN, T2DM."
"Extract the key symptom.","A 42-year-old female presents with acute abdominal pain in the right lower quadrant...","Symptom: Acute RLQ abdominal pain."`;


const FineTunePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: model, isLoading, isError } = useGetAiModelByIdQuery(id);

  const {
    data: clinicianTypes,
    isLoading: isClinicianTypesLoading,
  } = useGetClinicianTypesQuery();

  const { data: allModels, isLoading: isLoadingAllModels } = useGetAiModelsQuery();
  const { data: allRequestsData, isLoading: isLoadingAllRequests } = useGetFineTuneRequestsQuery({ status: 'all', per: 10000 });
  const allRequests = allRequestsData?.requests;


  const [createFineTuneRequest] = useCreateFineTuneRequestMutation();
  
  const { data: trafficData, isLoading: isTrafficLoading } = useGetQueueTrafficQuery(undefined, {
    pollingInterval: 15000,
  });

  const [modelName, setModelName] = useState('');
  const [description, setDescription] = useState('');
  const [fine_tuning_notes, setFineTuningNotes] = useState('');
  const [taskId, setTaskId] = useState('');
  const [clinicianTypeId, setClinicianTypeId] = useState('');
  const [file, setFile] = useState(null);
  const [showFormat, setShowFormat] = useState(false);
  const [activeFormat, setActiveFormat] = useState('json');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitParams, setSubmitParams] = useState(null);
  const [submissionError, setSubmissionError] = useState('');
  const [fileError, setFileError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showQueueWarning, setShowQueueWarning] = useState(false);
  const [submissionState, setSubmissionState] = useState('idle');
  const [isValidatingFile, setIsValidatingFile] = useState(false);

  const fileInputRef = useRef(null);

  const validateModelName = (name) => {
    if (!allModels || !allRequests) return true;

    const normalizedName = name.trim().toLowerCase();
    if (!normalizedName) return true;

    const isNameInModels = allModels.some(m => m.name.toLowerCase() === normalizedName);
    if (isNameInModels) {
      setNameError('This model name is already in use.');
      return false;
    }
    
    const activeRequests = allRequests.filter(req => !FAILED_STATUSES.includes(req.status));
    const isNameInActiveRequests = activeRequests.some(req => req.name.toLowerCase() === normalizedName);
    if (isNameInActiveRequests) {
      setNameError('This name is already used in an active request.');
      return false;
    }

    setNameError('');
    return true;
  };
  
  const handleNameChange = (e) => {
    setModelName(e.target.value);
    if (nameError) {
      validateModelName(e.target.value);
    }
  };

  const resetForm = () => {
    setModelName('');
    setDescription('');
    setFineTuningNotes('');
    setTaskId('');
    setClinicianTypeId('');
    setFile(null);
    setSubmissionError('');
    setFileError('');
    setNameError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const parseCsvToJson = (csvText) => {
    const parseRows = (text) => {
      const rows = [];
      let row = [];
      let cur = "";
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];

        if (ch === '"') {
          if (inQuotes && next === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
          if (ch === '\r' && next === '\n') i++;
          row.push(cur);
          cur = "";
          rows.push(row);
          row = [];
        } else if (ch === ',' && !inQuotes) {
          row.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }

      if (inQuotes) {
        throw new Error("CSV parse error: unclosed quotes");
      }
      row.push(cur);
      rows.push(row);

      return rows;
    };

    csvText = (csvText ?? "").replace(/^\uFEFF/, "");
    const rows = parseRows(csvText.trim());

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => (h ?? "").trim().replace(/^"|"$/g, ""));

    const idx = {
      Instruction: headers.indexOf("Instruction"),
      Input: headers.indexOf("Input"),
      Response: headers.indexOf("Response"),
    };

    const missing = [];
    if (idx.Instruction < 0) missing.push("Instruction");
    if (idx.Response < 0) missing.push("Response");
    if (missing.length > 0) {
        throw new Error("CSV missing required header(s): " + missing.join(", "));
    }

    const getCell = (cols, index) => {
      if (index < 0) return "";
      let v = (cols[index] ?? "").trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      return v;
    };

    const result = [];
    for (let r = 1; r < rows.length; r++) {
      const cols = rows[r];
      if (cols.every(c => (c ?? "").trim() === "")) continue;

      const instruction = getCell(cols, idx.Instruction);
      const input = getCell(cols, idx.Input);
      const response = getCell(cols, idx.Response);

      const text =
        `### Instruction:\n${instruction}\n` +
        `### Input:\n${input}\n` +
        `### Response:\n${response}`;

      result.push({ text });
    }

    return result;
  };


  const validateJsonData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { isValid: false, message: 'Dataset must be a non-empty array of objects.' };
    }

    const pattern = /^###\s*Instruction:\s*\r?\n([\s\S]*?)\r?\n###\s*Input:\s*\r?\n([\s\S]*?)\r?\n###\s*Response:\s*\r?\n([\s\S]*?)\s*$/;

    for (const [index, item] of data.entries()) {
      const recordNum = index + 1;

      if (typeof item !== 'object' || item === null) {
        return { isValid: false, message: `Record ${recordNum} is not a valid object.` };
      }

      if (!Object.prototype.hasOwnProperty.call(item, 'text')) {
        return { isValid: false, message: `Record ${recordNum} is missing required field "text".` };
      }
      if (typeof item.text !== 'string') {
        return { isValid: false, message: `Record ${recordNum} field "text" must be a string.` };
      }

      const text = item.text;
      const m = text.match(pattern);
      if (!m) {
        return {
          isValid: false,
          message: `Record ${recordNum} does not match required format. Expected sections in order: "### Instruction:", "### Input:", "### Response:".`
        };
      }

      const [, instruction, input, response] = m;

      if ((instruction ?? '').trim() === '') {
        return { isValid: false, message: `Record ${recordNum} has an empty "Instruction" section.` };
      }
      if ((response ?? '').trim() === '') {
        return { isValid: false, message: `Record ${recordNum} has an empty "Response" section.` };
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
    
    if (!validateModelName(modelName)) return;
  
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
    navigate('/fine-tune-status');
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
    } catch (err) {
      const message = err?.data?.error || 'Failed to submit fine-tune request.';
      setSubmissionError(message);
      setSubmissionState('idle');
    }
  };  

  const truncateFilename = (name, maxLength = 20) => {
    if (name.length <= maxLength) {
      return name;
    }
    return `${name.substring(0, maxLength)}...`;
  };

  const getJsonFormatExample = () => {
    if (!model?.fine_tune_data_format) {
      return 'Invalid JSON format';
    }
    try {
      const parsed = JSON.parse(model.fine_tune_data_format);
      return JSON.stringify(parsed, null, 2);
    } catch (err) {
      return 'Invalid JSON format';
    }
  };

  if (isLoading || isClinicianTypesLoading || isLoadingAllModels || isLoadingAllRequests) return <Spinner />;
  if (isError) return <ErrorMessage>Failed to load data.</ErrorMessage>;

  if (submissionState === 'success') {
    return (
      <SuccessPanel>
        <ContentBox>
          <SuccessHeader>
            <CheckmarkIcon />
            Submission Successful!
          </SuccessHeader>
          <Subtitle>Your dataset has been added to the queue. Here's what happens next:</Subtitle>
          <LifecycleList>
            <LifecycleItem>
              <LifecycleDot />
              <LifecycleContent>
                <h5>Data Formatting & Validation</h5>
                <p>Your submitted dataset is being automatically processed and validated to ensure it matches the required format for fine-tuning.</p>
              </LifecycleContent>
            </LifecycleItem>
            <LifecycleItem>
              <LifecycleDot />
              <LifecycleContent>
                <h5>Manual Review & Confirmation</h5>
                <p>Once formatted, your request will move to "Awaiting Confirmation". You must go to the <strong>Fine-Tune Status</strong> page to review a data sample and confirm you want to proceed.</p>
              </LifecycleContent>
            </LifecycleItem>
            <LifecycleItem>
              <LifecycleDot />
              <LifecycleContent>
                <h5>Fine-Tuning Process</h5>
                <p>After your confirmation, the request enters the fine-tuning queue. The system will then use your data to train a new version of the base model.</p>
              </LifecycleContent>
            </LifecycleItem>
            <LifecycleItem>
              <LifecycleDot style={{ borderColor: '#2e7d32' }} />
              <LifecycleContent>
                <h5 style={{ color: '#2e7d32' }}>Completion</h5>
                <p>When the process is finished, a new, fine-tuned model will be created and will become available in the Model Catalogue.</p>
              </LifecycleContent>
            </LifecycleItem>
          </LifecycleList>
          <PrimaryButton onClick={handleRedirectNow} style={{ width: 'auto', marginTop: '2.5rem' }}>Go to Status Page</PrimaryButton>
        </ContentBox>
      </SuccessPanel>
    );
  }

  return (
    <div style={{ width: '100%' }}>
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
                onChange={handleNameChange}
                onBlur={() => validateModelName(modelName)}
                placeholder="Enter a new name for the fine-tuned model"
                required
              />
              {nameError && <ValidationErrorText>{nameError}</ValidationErrorText>}
  
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
  
              <PrimaryButton type="submit" disabled={submissionState === 'submitting' || !!nameError}>
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
              accept=".json,.csv"
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
                <strong title={file.name}>{truncateFilename(file.name)}</strong>
                <SecondaryButton
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  style={{ width: 'auto', padding: '0.2rem 0.8rem', fontSize: '0.8rem', marginBottom: 0 }}
                >Remove</SecondaryButton>
              </FileDisplay>
            )}
  
            <ToggleButton type="button" onClick={() => setShowFormat((prev) => !prev)}>
              {showFormat ? 'Hide expected formats' : 'View expected formats'}
            </ToggleButton>
  
            {showFormat && (
              <FormatDisplayContainer>
                <FormatTabs>
                  <FormatTab isActive={activeFormat === 'json'} onClick={() => setActiveFormat('json')}>JSON</FormatTab>
                  <FormatTab isActive={activeFormat === 'csv'} onClick={() => setActiveFormat('csv')}>CSV</FormatTab>
                </FormatTabs>
                <CodeBlock>
                  {activeFormat === 'json' ? getJsonFormatExample() : model.fine_tune_data_format_csv || "There is no expected CSV format."}
                </CodeBlock>
              </FormatDisplayContainer>
            )}
          </Section>
          <Section>
            <h3>Queue Status</h3>
            {isTrafficLoading && <p>Loading traffic...</p>}
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
