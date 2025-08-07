import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useDispatch } from 'react-redux';
import { createConsumer } from '@rails/actioncable';
import { useNavigate, useParams } from 'react-router-dom';
import {
  apiSlice,
  useGetConversationsQuery,
  useGetConversationQuery,
  useGetMessagesQuery,
  useAddMessageMutation,
  useUpdateConversationMutation,
  useDeleteConversationMutation,
  useGetAiModelByIdQuery,
  useAcceptFeedbackMutation,
  useRejectFeedbackMutation,
  useGetFewShotTemplatesQuery,
} from '../app/apiSlice';
import Spinner from '../components/common/Spinner';
import FewShotTemplateList from '../features/fewshot/FewShotTemplateList';
import FewShotTemplateDetail from '../features/fewshot/FewShotTemplateDetail';
import AddContentPanel from '../features/fewshot/AddContentPanel';

const SearchIcon = (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
    </svg>
);

const SendIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
    </svg>
);

const ViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const SendSuggestionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12.0001H15M15 12.0001L10.4 7.50006M15 12.0001L10.4 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EmptySuggestionIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#a0a0a0">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
`;

const LoadingDot = styled.div`
  background-color: #5f6368;
  border-radius: 50%;
  width: 8px;
  height: 8px;
  margin: 0 3px;
  animation: ${bounce} 1.4s infinite ease-in-out both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
`;

const ChatPageWrapper = styled.div`
    position: fixed;
    top: 70px;
    left: 0;
    width: 100vw;
    height: calc(100vh - 70px);
    overflow: hidden;
    background: #fff;
`;

const ChatLayout = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100%;
  width: 100%;
`;

const Sidebar = styled.aside`
  background-color: #f0f4f5;
  border-right: 1px solid #e8edee;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  overflow: hidden;
`;

const SidebarTitle = styled.h2`
  font-size: 1.25rem;
  color: #003087;
  padding: 0 1.5rem 1rem 1.5rem;
  margin: 0;
  border-bottom: 1px solid #e8edee;
`;

const SearchContainer = styled.div`
  padding: 0.75rem 1.5rem;
  position: relative;
  flex-shrink: 0;
  
  svg {
    position: absolute;
    top: 50%;
    left: 2.25rem;
    transform: translateY(-50%);
    color: #5f6368;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border-radius: 20px;
  border: none;
  background-color: #dde3ea;
  font-size: 0.9rem;

  &:focus {
    outline: 2px solid #005eb8;
  }
`;

const ConversationList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
`;

const MenuButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s;
  color: #444746;
  font-size: 1.25rem;
  flex-shrink: 0;
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);

  &:hover {
    background-color: rgba(0,0,0,0.1);
  }
`;

const ConversationTitle = styled.div`
  font-weight: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 2rem; 
`;

const ConversationItem = styled.li`
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  position: relative;
  font-size: 0.9rem;
  font-weight: ${({ isActive }) => (isActive ? 'bold' : 'normal')};
  background-color: ${({ isActive }) => (isActive ? '#fff' : 'transparent')};
  border-right: ${({ isActive }) => (isActive ? '3px solid #005eb8' : 'none')};
  color: ${({ isActive }) => (isActive ? '#005eb8' : '#4c6272')};
  transition: background-color 0.2s;

  &:hover { 
    background-color: #e8edee;
    ${MenuButton} {
      visibility: visible;
      opacity: 1;
    }
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 15px;
  top: 45px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
  overflow: hidden;
  width: 130px;
`;

const DropdownItem = styled.button`
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: #f0f4f8;
  }
`;

const EditInput = styled.input`
  width: 100%;
  padding: 0;
  font-size: 0.9rem;
  border: none;
  background: transparent;
  outline: none;
  color: inherit;
  font-weight: inherit;
  font-family: inherit;
`;

const EditForm = styled.form`
  border: 2px solid #005eb8;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
`;

const ChatWindow = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #5f6368;

  h1 {
    font-size: 3rem;
    font-weight: 500;
    color: #1f1f1f;
  }
  
  p {
    font-size: 1rem;
    max-width: 450px;
  }
`;

const MessageArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  min-height: 0;
`;

const MessagesContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
`;

const MessageTurn = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  
  &[data-role="user"] {
    align-items: flex-end;
  }
  
  &[data-role="assistant"] {
    align-items: flex-start;
  }
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 0.75rem 1.25rem;
  border-radius: 20px;
  line-height: 1.5;
  font-size: 1rem;
  overflow-wrap: break-word;

  &[data-role="user"] {
    background-color: #f0f4f8;
    color: #1f1f1f;
    border-top-right-radius: 5px;
  }

  &[data-role="assistant"] {
    background-color: #eaf1f8;
    color: #1f1f1f;
    border-top-left-radius: 5px;
  }
`;

const LoadingMessageBubble = styled(MessageBubble)`
  width: fit-content;
  max-width: fit-content;
`;

const LoadingDotContainer = styled.div`
  display: flex;
  align-items: center;
  height: 1.5em;
`;

const AssistantLoadingIndicator = () => (
  <MessageTurn data-role="assistant">
    <LoadingMessageBubble data-role="assistant">
      <LoadingDotContainer>
        <LoadingDot />
        <LoadingDot />
        <LoadingDot />
      </LoadingDotContainer>
    </LoadingMessageBubble>
  </MessageTurn>
);

const MessageInputContainer = styled.div`
  padding: 0 1rem;
  width: 100%;
  max-width: 900px;
  margin: 1rem auto;
`;

const MessageInputForm = styled.form`
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #f0f4f8;
  border-radius: 28px;
  padding: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
`;

const MessageTextarea = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  resize: none;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  max-height: 200px;
  padding: 0.5rem;
  box-sizing: border-box;

  &::placeholder {
    color: #5f6368;
  }

  &:focus {
    outline: none;
  }
`;

const SendButton = styled.button`
  background-color: #C8D3E0;
  color: #1f1f1f;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: #BCC8D8;
  }
  
  &:disabled {
    background-color: #E8EBF0;
    color: #9e9e9e;
    cursor: not-allowed;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const AddContentButton = styled.button`
  position: relative;
  background-color: rgb(226, 231, 238);
  color: rgb(148, 147, 147);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 1;

  &:hover {
    background-color: #BCC8D8;
  }
`;

const FileErrorText = styled.div`
  color: #e53935;
  font-size: 0.8rem;
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
  height: 1rem;
`;

const SelectionBubblesContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

const SelectedItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #333;
  background: #e4e9f0;
  border-radius: 16px;
  padding: 0.4rem 0.75rem;
`;

const BubbleText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
`;

const ItemActionButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
`;

const RemoveItemButton = styled(ItemActionButton)`
  font-size: 1rem;
  &:hover {
    color: #e53935;
  }
`;

const AddContentWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const SuggestionsHeader = styled.h4`
  text-align: center;
  color: #5f6368;
  font-weight: 500;
  margin: 2rem 0 1rem;
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
  max-width: 900px;
  margin: 0 auto;
`;

const SuggestionCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border-color: #dee2e6;
  }
`;

const SuggestionText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #343a40;
  flex: 1;
`;

const EmptySuggestionState = styled.div`
  text-align: center;
  padding: 2.5rem;
  margin: 1rem auto;
  max-width: 900px;
  background: #fbfbfc;
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  p {
    margin: 0;
    color: #888;
  }
`;

const FeedbackContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
`;

const FeedbackButton = styled.button`
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    border: 1px solid #005eb8;

    &.accept {
        background-color: #005eb8;
        color: white;
        &:hover { background-color: #003087; }
    }

    &.reject {
        background-color: #fff;
        color: #005eb8;
        &:hover { background-color: #f0f4f5; }
    }
`;

const CompletedMessage = styled.div`
  text-align: center;
  padding: 1.5rem;
  color: #5f6368;
  font-style: italic;
  max-width: 900px;
  margin: 0 auto;
`;

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const OverlayContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  width: 90%;
  height: 90%;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #e9ecef;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  &:hover { background-color: #dee2e6; }
`;

const MessageAttachmentContainer = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const AttachmentBubble = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #e9ecef;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
`;

const AttachmentLink = styled.a`
  color: #005eb8;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  &:hover { text-decoration: underline; }
`;

const AttachmentButton = styled.button`
  background: none;
  border: none;
  color: #005eb8;
  cursor: pointer;
  padding: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  &:hover { text-decoration: underline; }
`;

const Modal = styled.div`
  background-color: white;
  padding: 2.5rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  position: relative;

  h3 {
    margin-top: 0;
    color: #003087;
  }

  p, li {
    font-size: 1rem;
    line-height: 1.6;
    color: #4c6272;
  }

  ul {
    padding-left: 1.2rem;
  }

  strong {
    color: #333;
  }

  a {
    color: #005eb8;
    text-decoration: none;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ModalCloseButton = styled(CloseButton)`
  top: 0.75rem;
  right: 0.75rem;
`;

const ChatPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId: activeConversationId } = useParams();

  const [editingConversationId, setEditingConversationId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isCoTEnabled, setIsCoTEnabled] = useState(false);
  const [showCoTInfoModal, setShowCoTInfoModal] = useState(false);
  const [showFewShotInfoModal, setShowFewShotInfoModal] = useState(false);
  const [conversationPage, setConversationPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [allConversations, setAllConversations] = useState([]);

  const [fileError, setFileError] = useState('');
  const [viewMode, setViewMode] = useState('chat');
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [viewingTemplateData, setViewingTemplateData] = useState(null);
  const [isTemplateViewReadOnly, setIsTemplateViewReadOnly] = useState(false);
  const [showAddContentPanel, setShowAddContentPanel] = useState(false);
  
  const menuRef = useRef(null);
  const addContentRef = useRef(null);
  const cable = useRef();
  const fileInputRef = useRef(null);
  const messageAreaRef = useRef(null);
  const conversationListRef = useRef(null);
  const prevScrollHeightRef = useRef(null);

  const { data: conversationsResponse, isFetching: isFetchingConversations } = useGetConversationsQuery(conversationPage);
  const { data: activeConversation } = useGetConversationQuery(activeConversationId, { skip: !activeConversationId });
  const { data: messagesResponse, isFetching: isFetchingMessages } = useGetMessagesQuery(
    { conversationId: activeConversationId, page: messagePage },
    { skip: !activeConversationId }
  );
  
  useEffect(() => {
    if (conversationsResponse && conversationsResponse.data) {
      if (conversationPage === 1) {
        setAllConversations(conversationsResponse.data);
      } else {
        setAllConversations(prev => [...prev, ...conversationsResponse.data]);
      }
    }
  }, [conversationsResponse, conversationPage]);

  useEffect(() => {
    setConversationPage(1);
    setAllConversations([]);
  }, [searchTerm]);

  const { data: modelDetails, isFetching: isFetchingModelDetails } = useGetAiModelByIdQuery(
    activeConversation?.ai_model_id,
    { skip: !activeConversation?.ai_model_id }
  );
  
  const { data: templates } = useGetFewShotTemplatesQuery();
  const [addMessage, { isLoading: isSendingMessage }] = useAddMessageMutation();
  const [updateConversation] = useUpdateConversationMutation();
  const [deleteConversation] = useDeleteConversationMutation();
  const [acceptFeedback, { isLoading: isAccepting }] = useAcceptFeedbackMutation();
  const [rejectFeedback, { isLoading: isRejecting }] = useRejectFeedbackMutation();

  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  
  const { data: messages = [], pagination: msgPagination } = messagesResponse || {};
  const { pagination: convoPagination } = conversationsResponse || {};

  useEffect(() => {
    setMessagePage(1);
    dispatch(apiSlice.util.resetApiState());
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    if (activeConversation) {
      setIsCoTEnabled(activeConversation.cot);
    }
  }, [activeConversation]);

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const isWaiting = isSendingMessage || (lastMessage?.role === 'user' && !isFetchingMessages);
  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);
  const [tempFileUrl, setTempFileUrl] = useState(null);

  const handleConversationScroll = useCallback(() => {
    const listEl = conversationListRef.current;
    if (listEl) {
      const { scrollTop, scrollHeight, clientHeight } = listEl;
      if (scrollTop + clientHeight >= scrollHeight - 5 && !isFetchingConversations && convoPagination?.current_page < convoPagination?.total_pages) {
        setConversationPage(p => p + 1);
      }
    }
  }, [isFetchingConversations, convoPagination]);

  const handleMessageScroll = useCallback(() => {
    if (messageAreaRef.current?.scrollTop === 0 && !isFetchingMessages && msgPagination && msgPagination.current_page < msgPagination.total_pages) {
      prevScrollHeightRef.current = messageAreaRef.current.scrollHeight;
      setMessagePage(p => p + 1);
    }
  }, [isFetchingMessages, msgPagination]);
  
  useEffect(() => {
    const msgEl = messageAreaRef.current;
    if (msgEl) {
      if (messagePage === 1) {
        msgEl.scrollTop = msgEl.scrollHeight;
      } else if (!isFetchingMessages && prevScrollHeightRef.current) {
        msgEl.scrollTop = msgEl.scrollHeight - prevScrollHeightRef.current;
        prevScrollHeightRef.current = null;
      }
    }
  }, [messages, messagePage, isFetchingMessages]);

  const handleTextareaInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setInput(textarea.value);
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpenFor(null);
      if (addContentRef.current && !addContentRef.current.contains(event.target)) setShowAddContentPanel(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      if (!cable.current) cable.current = createConsumer(process.env.REACT_APP_CABLE_URL);
      const subscription = cable.current.subscriptions.create(
        { channel: 'ConversationChannel', conversation_id: activeConversationId },
        {
          received: () => {
             dispatch(apiSlice.util.invalidateTags([{ type: 'Message' }]));
          },
        }
      );
      return () => subscription.unsubscribe();
    }
  }, [activeConversationId, dispatch]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() && activeConversationId && !isWaiting) {
      addMessage({
        conversation_id: activeConversationId,
        message: { content: input, file: selectedFile, few_shot_template_id: selectedTemplateId, enable_cot: isCoTEnabled },
      });
      setInput('');
      setSelectedFile(null);
      setSelectedTemplateId(null);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStartEditing = (convo) => {
    setEditingConversationId(convo.id);
    setNewTitle(convo.title);
    setMenuOpenFor(null);
  };
  
  const handleCancelEditing = () => {
    setEditingConversationId(null);
    setNewTitle('');
  };

  const handleSaveTitle = async (e, convoId) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await updateConversation({ id: convoId, conversation: { title: newTitle } }).unwrap();
      handleCancelEditing();
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleDelete = async (convoId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(convoId).unwrap();
        setMenuOpenFor(null);
        if (activeConversationId === String(convoId)) {
          navigate('/chat');
        }
      } catch (err) {
        console.error('Failed to delete conversation:', err);
      }
    }
  };
  
  const handlePromptClick = (prompt) => {
    setInput(prompt);
    textareaRef.current?.focus();
    setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, 0);
  };
  
  const handleToggleCoT = () => {
    setIsCoTEnabled(prevState => !prevState);
  };

  const renderInputArea = () => {
    if (!activeConversation) return null;

    switch(activeConversation.status) {
        case 'awaiting_feedback':
            if (lastMessage?.role === 'assistant') {
                return (
                    <FeedbackContainer>
                        <FeedbackButton
                          className="accept"
                          onClick={() => acceptFeedback(activeConversation.id)}
                          disabled={isAccepting || isRejecting}
                        >
                            Accept
                        </FeedbackButton>
                        <FeedbackButton
                          className="reject"
                          onClick={() => rejectFeedback(activeConversation.id)}
                          disabled={isAccepting || isRejecting}
                        >
                            Reject
                        </FeedbackButton>
                    </FeedbackContainer>
                );
            }
            return null;

        case 'awaiting_rejection_comment':
        case 'awaiting_prompt':
            return (
                <MessageInputContainer>
                    {fileError && <FileErrorText>{fileError}</FileErrorText>}
                    <SelectionBubblesContainer>
                      {activeConversation.status === 'awaiting_prompt' && isCoTEnabled && (
                        <SelectedItemWrapper>
                          💭 Thinking
                          <RemoveItemButton type="button" onClick={() => setIsCoTEnabled(false)}>
                            ✕
                          </RemoveItemButton>
                        </SelectedItemWrapper>
                      )}
                      {activeConversation.status === 'awaiting_prompt' && selectedTemplate && (
                          <SelectedItemWrapper>
                              ✨ <BubbleText>{selectedTemplate.name}</BubbleText>
                              <ItemActionButton type="button" onClick={() => {
                                setViewingTemplateData(selectedTemplate);
                                setIsTemplateViewReadOnly(true);
                                setViewMode('templateDetail');
                              }}>
                                <ViewIcon />
                              </ItemActionButton>
                              <RemoveItemButton type="button" onClick={() => setSelectedTemplateId(null)}>
                                  ✕
                              </RemoveItemButton>
                          </SelectedItemWrapper>
                      )}
                      {activeConversation.status === 'awaiting_prompt' && selectedFile && (
                          <SelectedItemWrapper>
                              📎 <BubbleText>{selectedFile.name}</BubbleText>
                              <ItemActionButton as="a" href={tempFileUrl} target="_blank" rel="noopener noreferrer">
                                <ViewIcon />
                              </ItemActionButton>
                              <RemoveItemButton type="button" onClick={() => {
                                  setSelectedFile(null);
                                  if (fileInputRef.current) fileInputRef.current.value = '';
                              }}>
                                  ✕
                              </RemoveItemButton>
                          </SelectedItemWrapper>
                      )}
                    </SelectionBubblesContainer>
                    <MessageInputForm onSubmit={handleSendMessage}>
                        <MessageTextarea
                            ref={textareaRef}
                            value={input}
                            onInput={handleTextareaInput}
                            placeholder={activeConversation.status === 'awaiting_rejection_comment' ? "Please provide feedback for the rejection..." : "Enter a prompt here"}
                            rows="1"
                            disabled={!activeConversationId || isWaiting || (activeConversation.file_url && selectedFile)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        {activeConversation.status === 'awaiting_prompt' && (
                            <AddContentWrapper ref={addContentRef}>
                                <HiddenFileInput
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.gif,.webp,.bmp,.txt,.pdf,.json"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        const maxSizeMB = 100;
                                        const maxSizeBytes = maxSizeMB * 1024 * 1024;
                                        
                                        if (file && file.size > maxSizeBytes) {
                                          setFileError(`File size should not exceed ${maxSizeMB}MB`);
                                          e.target.value = '';
                                          setTimeout(() => setFileError(''), 4000);
                                          return;
                                        }
                                        
                                        setSelectedFile(file);
                                        setFileError('');
                                    }}
                                />
                                <AddContentButton type="button" onClick={() => setShowAddContentPanel(p => !p)}>
                                  +
                                </AddContentButton>
                                {showAddContentPanel && (
                                  <AddContentPanel
                                    onFileUpload={() => {
                                      fileInputRef.current?.click();
                                      setShowAddContentPanel(false);
                                    }}
                                    onAddFewShot={() => {
                                      setViewMode('templateList');
                                      setShowAddContentPanel(false);
                                    }}
                                    isCoTEnabled={isCoTEnabled}
                                    onToggleCoT={handleToggleCoT}
                                    onShowCoTInfo={() => {
                                      setShowCoTInfoModal(true);
                                      setShowAddContentPanel(false);
                                    }}
                                    onShowFewShotInfo={() => {
                                      setShowFewShotInfoModal(true);
                                      setShowAddContentPanel(false);
                                    }}
                                  />
                                )}
                            </AddContentWrapper>
                        )}
                        <SendButton type="submit" disabled={!input.trim() || !activeConversationId || isWaiting}>
                            <SendIcon />
                        </SendButton>
                    </MessageInputForm>
                </MessageInputContainer>
            );

        case 'completed':
            return <CompletedMessage>This conversation has been completed.</CompletedMessage>;
        
        default:
            return null;
    }
  }

  const filteredConversations = useMemo(() => 
    allConversations.filter(convo => convo.title.toLowerCase().includes(searchTerm.toLowerCase())),
    [allConversations, searchTerm]
  );
  
  const renderOverlayContent = () => {
    switch(viewMode) {
      case 'templateList':
        return <FewShotTemplateList
          onViewTemplate={(id) => {
            setEditingTemplateId(id);
            setIsTemplateViewReadOnly(false);
            setViewMode('templateDetail');
          }}
          onCreateNew={() => {
            setEditingTemplateId(null);
            setIsTemplateViewReadOnly(false);
            setViewMode('templateDetail');
          }}
        />
      case 'templateDetail':
        return <FewShotTemplateDetail
          templateId={editingTemplateId}
          isReadOnly={isTemplateViewReadOnly}
          templateData={viewingTemplateData}
          onSaveComplete={(newId) => {
            if (newId) {
              setEditingTemplateId(newId);
            }
            setIsTemplateViewReadOnly(false);
            setViewMode('templateDetail');
          }}
          onBack={() => {
            setViewingTemplateData(null);
            isTemplateViewReadOnly ? setViewMode('chat') : setViewMode('templateList');
          }}
          onDeleteComplete={() => setViewMode('templateList')}
          onSelectTemplate={(id) => {
            setSelectedTemplateId(id);
            setViewMode('chat');
          }}
        />
      default:
        return null;
    }
  };

  const renderCoTInfoModal = () => (
    <OverlayContainer onClick={() => setShowCoTInfoModal(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={() => setShowCoTInfoModal(false)}>×</ModalCloseButton>
        <h3>What is Thinking?</h3>
        <p>
	  Enabling "Thinking" uses a technique called <strong>Chain-of-Thought (CoT)</strong>. It prompts the AI to "think out loud" by explaining its reasoning step-by-step before providing a final answer. This makes the response more transparent and easier to verify.
        </p>
        <h4>When to use it:</h4>
        <ul>
          <li><strong>For Complex Problems:</strong> When you need the AI to solve multi-step or logical reasoning tasks.</li>
          <li><strong>For Fact-Checking:</strong> To see <em>how</em> the AI reached a conclusion, helping you spot potential errors in its logic.</li>
          <li><strong>For Creative Tasks:</strong> To generate more detailed and structured content by having it outline its thought process first.</li>
        </ul>
        <h4>Keep in Mind:</h4>
        <ul>
            <li>Responses may take slightly longer to generate.</li>
            <li>The output will be more verbose.</li>
        </ul>
        <p>
          For a more technical explanation, you can read this article from IBM: <a href="https://www.ibm.com/think/topics/chain-of-thoughts" target="_blank" rel="noopener noreferrer">Learn more about CoT prompting</a>.
        </p>
      </Modal>
    </OverlayContainer>
  );

  const renderFewShotInfoModal = () => (
    <OverlayContainer onClick={() => setShowFewShotInfoModal(false)}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={() => setShowFewShotInfoModal(false)}>×</ModalCloseButton>
        <h3>What is Few-Shot Prompting?</h3>
        <p>
          Few-shot prompting is a technique where you provide the AI with a few examples of the task you want it to perform. Instead of just asking a question, you first show it a pattern of inputs and desired outputs. The AI then uses these examples to generate a better, more accurate response for your actual prompt.
        </p>
        <h4>When to use it:</h4>
        <ul>
          <li><strong>To get responses in a specific format</strong> (e.g., JSON, a numbered list, or a specific sentence structure).</li>
          <li><strong>To guide the AI's tone or style</strong> (e.g., formal, clinical, casual).</li>
          <li><strong>For complex classification or data extraction tasks</strong> where simple instructions are not enough.</li>
        </ul>
        <h4>Keep in Mind:</h4>
        <ul>
            <li>Providing too many examples (usually more than 5) can sometimes confuse the model.</li>
            <li>The quality and consistency of your examples directly impacts the quality of the response.</li>
        </ul>
        <p>
          For a more technical explanation, you can read this article from IBM: <a href="https://www.ibm.com/think/topics/few-shot-prompting" target="_blank" rel="noopener noreferrer">Learn more about few-shot prompting</a>.
        </p>
      </Modal>
    </OverlayContainer>
  );

  return (
    <ChatPageWrapper>
      {showCoTInfoModal && renderCoTInfoModal()}
      {showFewShotInfoModal && renderFewShotInfoModal()}
      <ChatLayout>
        <Sidebar>
          <SidebarTitle>Prompt History</SidebarTitle>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search history"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <ConversationList ref={conversationListRef} onScroll={handleConversationScroll}>
            {filteredConversations?.map(convo => (
              <ConversationItem
                key={convo.id}
                isActive={String(convo.id) === activeConversationId}
                onClick={() => editingConversationId !== convo.id && navigate(`/chat/${convo.id}`)}
              >
                {editingConversationId === convo.id ? (
                   <EditForm onSubmit={(e) => handleSaveTitle(e, convo.id)}>
                      <EditInput
                        type="text"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        onBlur={handleCancelEditing}
                        autoFocus
                      />
                   </EditForm>
                ) : (
                  <>
                    <ConversationTitle>ID: {convo.id} {convo.title}</ConversationTitle>
                    <MenuButton onClick={(e) => { e.stopPropagation(); setMenuOpenFor(menuOpenFor === convo.id ? null : convo.id); }}>⋮</MenuButton>
                    {menuOpenFor === convo.id && (
                      <DropdownMenu ref={menuRef}>
                        <DropdownItem onClick={(e) => { e.stopPropagation(); handleStartEditing(convo); }}>Rename</DropdownItem>
                        <DropdownItem onClick={(e) => { e.stopPropagation(); handleDelete(convo.id); }}>Delete</DropdownItem>
                      </DropdownMenu>
                    )}
                  </>
                )}
              </ConversationItem>
            ))}
            {isFetchingConversations && <Spinner />}
          </ConversationList>
        </Sidebar>
        <ChatWindow>
          {activeConversationId ? (
            <>
              <MessageArea ref={messageAreaRef} onScroll={handleMessageScroll}>
                <MessagesContentWrapper>
                  {isFetchingMessages && messagePage === 1 ? <Spinner /> : (
                    <>
                      {isFetchingMessages && messagePage > 1 && <div style={{ textAlign: 'center', padding: '1rem' }}><Spinner /></div>}
                      {messages.map((msg, index) => (
                        <MessageTurn key={msg.id || `msg-${index}`} data-role={msg.role} >
                          {index === 0 && msg.role === 'user' && (
                            <MessageAttachmentContainer>
                              {activeConversation.cot && (
                                <AttachmentBubble>
                                  💭 <AttachmentButton as="span" style={{ cursor: 'default', textDecoration: 'none' }}>Thinking</AttachmentButton>
                                </AttachmentBubble>
                              )}
                              {activeConversation.few_shot_template?.name && (
                                <AttachmentBubble>
                                  ✨
                                  <AttachmentButton onClick={() => {
                                    setViewingTemplateData(activeConversation.few_shot_template);
                                    setIsTemplateViewReadOnly(true);
                                    setViewMode('templateDetail');
                                  }}>
                                    {activeConversation.few_shot_template.name}
                                  </AttachmentButton>
                                </AttachmentBubble>
                              )}
                              {activeConversation?.file_url && (
                                 <AttachmentBubble>
                                   📎 <AttachmentLink href={activeConversation.file_url} target="_blank" rel="noopener noreferrer">{activeConversation.file_name || "Attached File"}</AttachmentLink>
                                 </AttachmentBubble>
                              )}
                            </MessageAttachmentContainer>
                          )}
                          <MessageBubble data-role={msg.role}>{msg.content}</MessageBubble>
                        </MessageTurn>
                      ))}
                    </>
                  )}

                  {messages.length === 0 && !isFetchingMessages && !isWaiting && (
                    <>
                      {isFetchingModelDetails ? (
                        <Spinner />
                      ) : modelDetails?.suggested_prompts?.length > 0 ? (
                        <div>
                          <SuggestionsHeader>Here are some starting tutorial prompts to help you get started:</SuggestionsHeader>
                          <SuggestionsGrid>
                            {modelDetails.suggested_prompts.map((p, i) => (
                              <SuggestionCard key={i} onClick={() => handlePromptClick(p.prompt)}>
                                <SuggestionText>{p.prompt}</SuggestionText>
                                <SendSuggestionIcon />
                              </SuggestionCard>
                            ))}
                          </SuggestionsGrid>
                        </div>
                      ) : (
                        <EmptySuggestionState>
                           <EmptySuggestionIcon />
                           <p>No starting tutorial prompts available for this model right now.</p>
                        </EmptySuggestionState>
                      )}
                    </>
                  )}
                  {isWaiting && <AssistantLoadingIndicator />}
                </MessagesContentWrapper>
              </MessageArea>
              {renderInputArea()}
            </>
          ) : (
            <EmptyStateWrapper>
              <h1>Project Ambience</h1>
              <p>Start a new conversation by selecting a model from the catalogue, or continue an existing chat from the history panel.</p>
            </EmptyStateWrapper>
          )}
        </ChatWindow>
      </ChatLayout>
      
      {(viewMode === 'templateList' || viewMode === 'templateDetail') && (
        <OverlayContainer>
          <OverlayContent>
            <CloseButton onClick={() => setViewMode('chat')}>×</CloseButton>
            {renderOverlayContent()}
          </OverlayContent>
        </OverlayContainer>
      )}

    </ChatPageWrapper>
  );
};

export default ChatPage;
