import React from 'react';
import styled from 'styled-components';
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
  display: flex;
  align-items: center;
  text-decoration: none;

  img {
    height: 35px;
    display: block;
  }
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
      <Logo to="/">
        <img src="/logo.png" alt="Logo" />
      </Logo>
      <Nav>
        <StyledNavLink to="/" end>
          Model Catalogue
        </StyledNavLink>
        <StyledNavLink to="/chat">
          Prompt
        </StyledNavLink>
        <StyledNavLink to="/fine-tune-status">
          Fine-Tune Status
        </StyledNavLink>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
