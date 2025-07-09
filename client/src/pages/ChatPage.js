import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { createConsumer } from '@rails/actioncable';
import { conversationSelected } from '../features/ui/uiSlice';
import { 
  apiSlice,
  useGetConversationsQuery, 
  useGetConversationQuery,
  useAddMessageMutation,
  useUpdateConversationMutation,
  useDeleteConversationMutation
} from '../app/apiSlice';
import Spinner from '../components/common/Spinner';

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

const Message = styled.div`
  max-width: 80%;
  padding: 0.75rem 1.25rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 1rem;

  &[data-role="user"] {
    background-color: #f0f4f8;
    color: #1f1f1f;
    margin-left: auto;
    border-top-right-radius: 5px;
  }

  &[data-role="assistant"] {
    background-color: #fff;
    color: #1f1f1f;
    margin-right: auto;
    border-bottom-left-radius: 5px;
  }
`;

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

const FileButton = styled.button`
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

  &::after {
    content: 'Max 1 file, 100MB';
    position: absolute;
    bottom: 125%; /* Move above the button */
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease-in-out;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const SelectedFileWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #333;
  background: #e4e9f0;
  border-radius: 16px;
  padding: 0.4rem 0.75rem;
  margin: 0.5rem auto 0;
  width: fit-content;
  max-width: 90%;
  margin-bottom: 0.5rem;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  margin-left: 0.5rem;

  &:hover {
    color: #e53935;
  }
`;

const FileButtonWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const FileButtonTooltip = styled.div`
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e53935;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.3s ease;
  pointer-events: none;
`;


const ChatPage = () => {
  const dispatch = useDispatch();
  const { activeConversationId } = useSelector((state) => state.ui);

  const [editingConversationId, setEditingConversationId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  
  const menuRef = useRef(null);
  const cable = useRef();
  const fileInputRef = useRef(null);

  const { data: conversations, isLoading: isLoadingConversations } = useGetConversationsQuery();
  const { data: activeConversation, isFetching: isFetchingMessages } = useGetConversationQuery(activeConversationId, {
    skip: !activeConversationId,
  });
  const [addMessage, { isLoading: isSendingMessage }] = useAddMessageMutation();
  const [updateConversation] = useUpdateConversationMutation();
  const [deleteConversation] = useDeleteConversationMutation();

  const [input, setInput] = useState('');
  const messageAreaRef = useRef(null);
  const textareaRef = useRef(null);

  const handleTextareaInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setInput(textarea.value);
  };
  
  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [activeConversation, isSendingMessage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenFor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  useEffect(() => {
    if (activeConversationId) {
      if (!cable.current) {
        cable.current = createConsumer(process.env.CABLE_URL);
      }
      
      const channelParams = {
        channel: 'ConversationChannel',
        conversation_id: activeConversationId,
      };

      const channelHandlers = {
        received(data) {
          console.log('Received new message via Action Cable:', data.message);
          dispatch(
            apiSlice.util.invalidateTags([{ type: 'Conversation', id: activeConversationId }])
          );
        },
        connected() {
          console.log(`Connected to ConversationChannel ${activeConversationId}`);
        },
        disconnected() {
          console.log(`Disconnected from ConversationChannel ${activeConversationId}`);
        },
      };

      const subscription = cable.current.subscriptions.create(channelParams, channelHandlers);

      return () => {
        console.log(`Unsubscribing from ConversationChannel ${activeConversationId}`);
        subscription.unsubscribe();
      };
    }
  }, [activeConversationId, dispatch]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() && activeConversationId && !isSendingMessage) {
      await addMessage({
        conversation_id: activeConversationId,
        message: {
          content: input,
          file: selectedFile,
        },
      });
      setInput('');
      setSelectedFile(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        if (activeConversationId === convoId) {
          dispatch(conversationSelected(null));
        }
      } catch (err) {
        console.error('Failed to delete conversation:', err);
      }
    }
  };

  const filteredConversations = conversations?.filter(convo => 
    convo.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ChatPageWrapper>
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
          {isLoadingConversations ? <Spinner /> : (
            <ConversationList>
              {filteredConversations?.map(convo => (
                <ConversationItem 
                  key={convo.id}
                  isActive={convo.id === activeConversationId}
                  onClick={() => editingConversationId !== convo.id && dispatch(conversationSelected(convo.id))}
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
                      <ConversationTitle>{convo.title}</ConversationTitle>
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
            </ConversationList>
          )}
        </Sidebar>
        <ChatWindow>
          {activeConversationId ? (
            <>
              <MessageArea ref={messageAreaRef}>
                <MessagesContentWrapper>
                  {isFetchingMessages ? <Spinner /> : (
                    messages.map(msg => (
                      <Message key={msg.id} data-role={msg.role}>
                        {msg.content && <div>{msg.content}</div>}
                        {msg.file_url && (
                          <div style={{ marginTop: '0.5rem' }}>
                            📎 <a
                              href={msg.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#005eb8' }}
                            >
                              {msg.file_name || 'View file'}
                            </a>
                          </div>
                        )}
                      </Message>
                    ))
                  )}
                  {isSendingMessage && <Spinner />}
                </MessagesContentWrapper>
              </MessageArea>
              <MessageInputContainer>
                {selectedFile && (
                  <SelectedFileWrapper>
                    📎 {selectedFile.name}
                    <RemoveFileButton type="button" onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}>
                      ✕
                    </RemoveFileButton>
                  </SelectedFileWrapper>
                )}
                <MessageInputForm onSubmit={handleSendMessage}>
                  <MessageTextarea 
                    ref={textareaRef}
                    value={input}
                    onInput={handleTextareaInput}
                    placeholder="Enter a prompt here"
                    rows="1"
                    disabled={!activeConversationId}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                        }
                    }}
                  />
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

                  <FileButtonWrapper>
                    <FileButton type="button" onClick={() => fileInputRef.current?.click()}>
                      +
                    </FileButton>
                    <FileButtonTooltip visible={!!fileError}>
                      {fileError}
                    </FileButtonTooltip>
                  </FileButtonWrapper>
                  <SendButton type="submit" disabled={!input.trim() || !activeConversationId || isSendingMessage}>
                      <SendIcon />
                  </SendButton>
                </MessageInputForm>
              </MessageInputContainer>
            </>
          ) : (
            <EmptyStateWrapper>
              <h1>Project Ambience</h1>
              <p>Start a new conversation by selecting a model from the catalogue, or continue an existing chat from the history panel.</p>
            </EmptyStateWrapper>
          )}
        </ChatWindow>
      </ChatLayout>
    </ChatPageWrapper>
  );
};

export default ChatPage;
