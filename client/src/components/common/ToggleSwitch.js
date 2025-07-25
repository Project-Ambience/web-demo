import React from 'react';
import styled from 'styled-components';

const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 22px;

  &:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const SwitchInputChecked = styled(SwitchInput)`
  &:checked + ${Slider} {
    background-color: #005eb8;
  }

  &:checked + ${Slider}:before {
    transform: translateX(18px);
  }
`;


const ToggleSwitch = ({ isOn, handleToggle }) => {
  return (
    <SwitchContainer>
      <SwitchInputChecked type="checkbox" checked={isOn} onChange={handleToggle} />
      <Slider />
    </SwitchContainer>
  );
};

export default ToggleSwitch;
