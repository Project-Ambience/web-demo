import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components'; // Added keyframes for animation
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
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

// --- (Icons and most styled-components are unchanged) ---

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
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 0.75rem 1.25rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 1rem;
  display: flex; // Added for loader alignment
  align-items: center; // Added for loader alignment

  &[data-role="user"] {
    background-color: #e8f0fe; // A light blue for user prompts
    color: #1f1f1f;
    margin-left: auto;
    border-top-right-radius: 5px;
  }

  &[data-role="assistant"] {
    background-color: #f0f4f5; // A light grey for assistant responses
    color: #1f1f1f;
    margin-right: auto;
    border-bottom-left-radius: 5px;
  }
`;

// NEW: Animation for the typing indicator dots
const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
`;

// NEW: Styled component for the typing indicator
const TypingIndicator = styled.div`
  span {
    display: inline-block;
    background-color: #5f6368;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin: 0 2px;
    animation: ${bounce} 1.4s infinite ease-in-out both;
  }

  span:nth-of-type(1) {
    animation-delay: -0.32s;
  }

  span:nth-of-type(2) {
    animation-delay: -0.16s;
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

const ChatPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  
  const { activeConversationId } = useSelector((state) => state.ui);

  // NEW: Local state to track if we are waiting for the model's response
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  const [editingConversationId, setEditingConversationId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const menuRef = useRef(null);
  const cable = useRef();

  const { data: conversations, isLoading: isLoadingConversations } = useGetConversationsQuery();
  const { data: activeConversation, isFetching: isFetchingMessages } = useGetConversationQuery(conversationId, {
    skip: !conversationId,
  });
  const [addMessage, { isLoading: isSendingMessage }] = useAddMessageMutation();
  const [updateConversation] = useUpdateConversationMutation();
  const [deleteConversation] = useDeleteConversationMutation();

  const [input, setInput] = useState('');
  const messageAreaRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      dispatch(conversationSelected(conversationId));
    }
  }, [conversationId, dispatch]);

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
  }, [activeConversation, isAwaitingResponse]); // NEW: Also scroll when loader appears

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
        cable.current = createConsumer('ws://localhost:5090/cable');
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

  // NEW: Effect to turn off the loading indicator when an assistant message arrives
  useEffect(() => {
    if (activeConversation && activeConversation.messages.length > 0) {
      const lastMessage = activeConversation.messages[activeConversation.messages.length - 1];
      // If the last message is from the assistant, we are no longer waiting.
      if (lastMessage.role === 'assistant') {
        setIsAwaitingResponse(false);
      }
    }
  }, [activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() && conversationId && !isSendingMessage) {
      const messageContent = input;
      setInput('');
      if(textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      try {
        await addMessage({ conversation_id: conversationId, message: { content: messageContent } }).unwrap();
        // NEW: After successfully sending the user's message, turn on the loading indicator.
        setIsAwaitingResponse(true);
      } catch (err) {
        console.error("Failed to send message:", err);
        // Turn off loader on error
        setIsAwaitingResponse(false);
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
        if (conversationId === convoId.toString()) {
          navigate('/chat');
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
                  isActive={convo.id.toString() === conversationId}
                  onClick={() => {
                      if (editingConversationId !== convo.id) {
                          navigate(`/chat/${convo.id}`);
                      }
                  }}
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
          {conversationId ? (
            <>
              <MessageArea ref={messageAreaRef}>
                {isFetchingMessages && !activeConversation ? <Spinner /> : (
                  activeConversation?.messages.map(msg => (
                    <Message key={msg.id} data-role={msg.role}>{msg.content}</Message>
                  ))
                )}
                {/* NEW: Display the typing indicator when waiting for a response */}
                {isAwaitingResponse && (
                  <Message data-role="assistant">
                    <TypingIndicator>
                      <span /><span /><span />
                    </TypingIndicator>
                  </Message>
                )}
              </MessageArea>
              <MessageInputContainer>
                <MessageInputForm onSubmit={handleSendMessage}>
                  <MessageTextarea 
                    ref={textareaRef}
                    value={input}
                    onInput={handleTextareaInput}
                    placeholder="Enter a prompt here"
                    rows="1"
                    disabled={!conversationId || isAwaitingResponse} // Also disable while waiting
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                        }
                    }}
                  />
                  <SendButton type="submit" disabled={!input.trim() || !conversationId || isAwaitingResponse}>
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
