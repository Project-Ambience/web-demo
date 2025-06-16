import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeaderWrapper = styled.header`
  background-color: #2c3e50;
  padding: 20px 40px;
  color: white;
  text-align: center;
`;

const SiteTitle = styled.h1`
  margin: 0;
  font-size: 2rem;
  a {
    color: white;
    text-decoration: none;
  }
`;

const Header = () => (
  <HeaderWrapper>
    <SiteTitle>
      <Link to="/">Project Ambience</Link>
    </SiteTitle>
  </HeaderWrapper>
);

export default Header;