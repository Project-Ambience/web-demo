import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useGetFineTuneRequestsQuery, useGetRabbitMQTrafficQuery, useGetTunableModelsQuery } from '../app/apiSlice';
import Spinner from '../components/common/Spinner';

const CheckmarkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.00016 16.1698L4.83016 11.9998L3.41016 13.4098L9.00016 18.9998L21.0002 6.99984L19.5902 5.58984L9.00016 16.1698Z" fill="#005eb8"/>
  </svg>
);

const DropdownArrow = ({ isOpen }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-in-out' }}>
    <path d="M7 10l5 5 5-5z" />
  </svg>
);

const SearchIcon = (props) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
    </svg>
);

const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
};

const PageLayout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  height: 100%;
  width: 100%;
`;

const Sidebar = styled.aside`
  background-color: #f0f4f5;
  border-right: 1px solid #e8edee;
  padding: 1.5rem 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  user-select: none;
`;

const SidebarTitle = styled.h2`
  font-size: 1.25rem;
  color: #003087;
  padding: 0 1.5rem 1rem 1.5rem;
  margin: 0;
  border-bottom: 1px solid #e8edee;
`;

const FilterSection = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid #e8edee;
  &:last-of-type {
    border-bottom: none;
  }
`;

const RelativeFilterSection = styled(FilterSection)`
  position: relative;
`;

const FilterSectionTitle = styled.h4`
  font-size: 1rem;
  color: #4c6272;
  margin: 0 1.5rem 0.75rem 1.5rem;
`;

const SearchContainer = styled.div`
  position: relative;
  margin: 0 1.5rem;
  
  svg {
    position: absolute;
    top: 50%;
    left: 0.75rem;
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

const OptionList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const OptionListItem = styled.li`
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: ${({ isActive }) => (isActive ? '600' : 'normal')};
  color: ${({ isActive }) => (isActive ? '#005eb8' : '#4c6272')};
  background-color: ${({ isActive }) => (isActive ? '#eaf1f8' : 'transparent')};
  transition: background-color 0.2s;
  font-size: 0.9rem;
  text-transform: capitalize;

  &:hover {
    background-color: #e8edee;
  }

  svg {
    visibility: ${({ isActive }) => (isActive ? 'visible' : 'hidden')};
  }
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  max-height: 220px;
  overflow-y: auto;
  padding: 0.5rem 0;
`;

const CustomDateWrapper = styled.div`
  background-color: #dde3ea;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  label {
    font-weight: 600;
    font-size: 0.85rem;
  }
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
`;

const MainContent = styled.main`
  padding: 1rem 2rem 1rem 0;
  overflow-y: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e8edee;
  border-radius: 4px;
  padding: 1.5rem;
  text-align: center;
`;

const CardTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #4c6272;
  font-size: 1rem;
`;

const CardValue = styled.p`
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #005eb8;
`;

const TableContainer = styled.div`
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8edee;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e8edee;
  }
  
  tr:last-child td {
    border-bottom: none;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: capitalize;
  white-space: nowrap;
  color: #fff;
  background-color: ${({ status }) => {
    switch (status) {
      case 'done': return '#2e7d32';
      case 'failed': return '#c62828';
      case 'in_progress': return '#0277bd';
      case 'pending':
      default: return '#5f6368';
    }
  }};
`;

const ActionButton = styled(Link)`
  background-color: #005eb8;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  font-size: 0.9rem;

  &:hover {
    background-color: #003087;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: 1px solid #ced4da;
    background: #fff;
    cursor: pointer;
    border-radius: 20px;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }
`;

const EmptyStateWrapper = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  margin-top: 2rem;
  background-color: #f8f9fa;
  border: 1px dashed #ced4da;
  border-radius: 8px;
  color: #4c6272;
`;

const STATUSES = ['all', 'pending', 'in_progress', 'done', 'failed'];
const TIME_PERIODS = {
  all: 'All Time',
  day: 'Last 24 Hours',
  week: 'Last 7 Days',
  month: 'Last 30 Days',
  custom: 'Custom Range'
};

const INITIAL_FILTERS = {
  search: '',
  base_model_id: '',
  time_period: 'all',
  status: 'all',
};

const FineTuneStatusPage = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [apiParams, setApiParams] = useState({ page: 1 });
  const [isBaseModelOpen, setIsBaseModelOpen] = useState(false);
  const baseModelRef = useRef();
  useOnClickOutside(baseModelRef, () => setIsBaseModelOpen(false));

  const { data: trafficData } = useGetRabbitMQTrafficQuery(undefined, {
    pollingInterval: 15000,
  });
  const { data: tunableModels, isLoading: isLoadingModels } = useGetTunableModelsQuery();

  useEffect(() => {
    const params = {
      page: 1,
      search: filters.search,
      base_model_id: filters.base_model_id,
      status: filters.status
    };

    const now = new Date();
    switch (filters.time_period) {
      case 'day':
        params.start_date = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
        break;
      case 'week':
        params.start_date = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        break;
      case 'month':
        params.start_date = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
        break;
      case 'custom':
        params.start_date = customDates.start;
        params.end_date = customDates.end;
        break;
      default:
        break;
    }
    setApiParams(prev => ({ ...params, page: prev.page }));
  }, [filters, customDates]);

  const { data, isLoading, isFetching } = useGetFineTuneRequestsQuery(apiParams);
  const requests = data?.requests || [];
  const pagination = data?.pagination || {};

  const selectedModelName = tunableModels?.find(m => m.id === filters.base_model_id)?.name || 'All Models';

  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' ||
           filters.base_model_id !== '' ||
           filters.status !== 'all' ||
           filters.time_period !== 'all';
  }, [filters]);

  return (
    <div style={{
        position: 'fixed',
        top: '70px',
        left: '0',
        width: '100vw',
        height: 'calc(100vh - 70px)',
    }}>
      <PageLayout>
        <Sidebar>
          <SidebarTitle>Refine by</SidebarTitle>

          <FilterSection>
            <FilterSectionTitle>New Model Name</FilterSectionTitle>
            <SearchContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                name="search"
                placeholder="Filter by name..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </SearchContainer>
          </FilterSection>

          <RelativeFilterSection ref={baseModelRef}>
            <FilterSectionTitle>Base Model</FilterSectionTitle>
            <OptionListItem as="div" isActive={true} onClick={() => setIsBaseModelOpen(prev => !prev)}>
              <span>{selectedModelName}</span>
              <DropdownArrow isOpen={isBaseModelOpen} />
            </OptionListItem>
            {isBaseModelOpen && (
              <DropdownMenu>
                <OptionList>
                  <OptionListItem isActive={!filters.base_model_id} onClick={() => { setFilters(f => ({ ...f, base_model_id: '' })); setIsBaseModelOpen(false); }}>
                    <span>All Models</span>
                    <CheckmarkIcon />
                  </OptionListItem>
                  {isLoadingModels ? <Spinner /> : tunableModels?.map(model => (
                    <OptionListItem
                      key={model.id}
                      isActive={filters.base_model_id === model.id}
                      onClick={() => { setFilters(f => ({ ...f, base_model_id: model.id })); setIsBaseModelOpen(false); }}
                    >
                      <span>{model.name}</span>
                      <CheckmarkIcon />
                    </OptionListItem>
                  ))}
                </OptionList>
              </DropdownMenu>
            )}
          </RelativeFilterSection>
          
          <FilterSection>
            <FilterSectionTitle>Status</FilterSectionTitle>
            <OptionList>
              {STATUSES.map(status => (
                <OptionListItem
                  key={status}
                  isActive={filters.status === status}
                  onClick={() => setFilters(f => ({ ...f, status }))}
                >
                  <span>{status.replace('_', ' ')}</span>
                  <CheckmarkIcon />
                </OptionListItem>
              ))}
            </OptionList>
          </FilterSection>

          <FilterSection>
            <FilterSectionTitle>Time Period</FilterSectionTitle>
            <OptionList>
              {Object.entries(TIME_PERIODS).map(([key, value]) => (
                <React.Fragment key={key}>
                  <OptionListItem isActive={filters.time_period === key} onClick={() => setFilters(f => ({...f, time_period: key}))}>
                    <span>{value}</span>
                    <CheckmarkIcon />
                  </OptionListItem>
                  {filters.time_period === 'custom' && key === 'custom' && (
                    <CustomDateWrapper>
                      <label htmlFor="start_date">From</label>
                      <input type="date" id="start_date" value={customDates.start} onChange={e => setCustomDates(d => ({ ...d, start: e.target.value }))} />
                      <label htmlFor="end_date">To</label>
                      <input type="date" id="end_date" value={customDates.end} onChange={e => setCustomDates(d => ({ ...d, end: e.target.value }))} />
                    </CustomDateWrapper>
                  )}
                </React.Fragment>
              ))}
            </OptionList>
          </FilterSection>
        </Sidebar>
        <MainContent>
          <h2>Fine-Tune Status Dashboard</h2>
          
          <DashboardGrid>
             <Card>
              <CardTitle>Jobs in Queue</CardTitle>
              <CardValue>{trafficData?.messages_ready ?? <Spinner />}</CardValue>
            </Card>
            <Card>
              <CardTitle>Jobs Running</CardTitle>
              <CardValue>{trafficData?.messages_unacknowledged ?? <Spinner />}</CardValue>
            </Card>
          </DashboardGrid>

          {isLoading || isFetching ? <Spinner /> : (
            <>
              {requests.length > 0 ? (
                <>
                  <TableContainer>
                    <TableWrapper>
                      <Table>
                        <thead>
                          <tr>
                            <th>Status</th>
                            <th>New Model Name</th>
                            <th>Base Model</th>
                            <th>Clinician Type</th>
                            <th>Task</th>
                            <th>Submitted At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.map(req => (
                            <tr key={req.id}>
                              <td><StatusBadge status={req.status}>{req.status.replace('_', ' ')}</StatusBadge></td>
                              <td>{req.name}</td>
                              <td><Link to={`/ai-models/${req.ai_model.id}`}>{req.ai_model.name}</Link></td>
                              <td>{req.clinician_type.name}</td>
                              <td>{req.task}</td>
                              <td>{new Date(req.created_at).toLocaleString()}</td>
                              <td>
                                {req.status === 'done' && req.new_ai_model_id && (
                                  <ActionButton to={`/ai-models/${req.new_ai_model_id}`}>View Model</ActionButton>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </TableWrapper>
                  </TableContainer>
                  <PaginationControls>
                    <button
                      onClick={() => setApiParams(p => ({ ...p, page: p.page - 1 }))}
                      disabled={!pagination.current_page || pagination.current_page === 1}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setApiParams(p => ({ ...p, page: p.page + 1 }))}
                      disabled={!pagination.total_pages || pagination.current_page === pagination.total_pages}
                    >
                      Next
                    </button>
                  </PaginationControls>
                </>
              ) : (
                <EmptyStateWrapper>
                  <h3>{hasActiveFilters ? 'No Results Found' : 'No Tasks Submitted'}</h3>
                  <p>
                    {hasActiveFilters 
                      ? 'Try adjusting your filters to find what you are looking for.' 
                      : 'There are no fine-tuning tasks to display yet.'
                    }
                  </p>
                </EmptyStateWrapper>
              )}
            </>
          )}
        </MainContent>
      </PageLayout>
    </div>
  );
};

export default FineTuneStatusPage;
