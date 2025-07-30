import React from 'react';
import styled from 'styled-components';

const IconSpan = styled.span.attrs({ className: 'material-symbols-outlined' })`
  font-size: 1.2em;
  vertical-align: middle;
  line-height: 1;
  position: relative;
  top: -0.05em;
`;

const MaterialIcon = ({ iconName, ...props }) => {
  return <IconSpan {...props}>{iconName}</IconSpan>;
};

export default MaterialIcon;
