import React from 'react';
import styled from 'styled-components';
// Import Link and NavLink from React Router
import { Link, NavLink } from 'react-router-dom';

const HeaderContainer = styled.header`
  background-color: #005eb8; // NHS Blue
  color: white;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const StyledNavLink = styled(NavLink)`
  color: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: bold;
  padding: 0.5rem 0;
  position: relative;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }

  // This style is applied automatically by NavLink when the route is active
  &.active {
    opacity: 1;
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: white;
      border-radius: 2px;
    }
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <Logo to="/">Project Ambience</Logo>
      <Nav>
        <StyledNavLink to="/" end>
          Model Catalogue
        </StyledNavLink>
        <StyledNavLink to="/chat">
          Chat
        </StyledNavLink>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;