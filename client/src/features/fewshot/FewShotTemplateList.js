import React from 'react';
import styled from 'styled-components';
import { useGetFewShotTemplatesQuery } from '../../app/apiSlice';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const ListContainer = styled.div`
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

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  color: #343a40;
`;

const InfoLink = styled.a`
  font-size: 0.9rem;
  font-weight: 600;
  color: #005eb8;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const TemplateCard = styled.div`
  background-color: #fff;
  border: 1px solid #e8edee;
  border-radius: 4px;
  padding: 1.5rem;
  text-decoration: none;
  color: #333;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 150px;
  transition: box-shadow 0.3s, border-color 0.3s;
  cursor: pointer;

  &:hover {
    border-color: #005eb8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TemplateName = styled.h3`
  font-size: 1.25rem;
  color: #005eb8;
  margin: 0 0 0.5rem 0;
`;

const TemplateDescription = styled.p`
  font-size: 0.9rem;
  color: #4c6272;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  font-weight: 600;
`;

const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const ExampleCount = styled.span`
  font-weight: bold;
  font-size: 0.9rem;
  color: #495057;
`;

const CardWarningText = styled.p`
  font-size: 0.75rem;
  color: #fd7e14;
  font-weight: 600;
  margin: 0;
  text-align: right;
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
  &:hover { background-color: #003087; }
`;

const FewShotTemplateList = ({ onViewTemplate, onCreateNew }) => {
  const { data: templates, isLoading, isError, error } = useGetFewShotTemplatesQuery();

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage>{JSON.stringify(error)}</ErrorMessage>;

  return (
    <ListContainer>
      <Header>
        <TitleContainer>
          <Title>Few-Shot Templates</Title>
          <InfoLink href="https://www.ibm.com/think/topics/few-shot-prompting" target="_blank" rel="noopener noreferrer">
            What is Few-Shot?
          </InfoLink>
        </TitleContainer>
        <PrimaryButton onClick={onCreateNew}>Create New Template</PrimaryButton>
      </Header>
      <TemplateGrid>
        {templates.map(template => (
          <TemplateCard key={template.id} onClick={() => onViewTemplate(template.id)}>
            <div>
              <TemplateName>{template.name}</TemplateName>
              <TemplateDescription>
                {template.description
                  ? (template.description.length > 100 ? `${template.description.substring(0, 100)}...` : template.description)
                  : <em>No description provided.</em>
                }
              </TemplateDescription>
            </div>
            <CardFooter>
              <ExampleCount>
                {template.examples.length} Example{template.examples.length !== 1 ? 's' : ''}
              </ExampleCount>
              {template.examples.length >= 5 && (
                <CardWarningText>
                  Warning: 5+ examples<br />may impact performance.
                </CardWarningText>
              )}
            </CardFooter>
          </TemplateCard>
        ))}
      </TemplateGrid>
    </ListContainer>
  );
};

export default FewShotTemplateList;
