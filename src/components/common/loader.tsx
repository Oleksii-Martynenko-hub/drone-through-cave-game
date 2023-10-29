import React from 'react';
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoaderWrapper = styled.div`
  width: 150px;
  height: 150px;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  background-color: #646464;
`;

const LoaderInner = styled.div`
  display: inline-block;
  position: relative;
  left: 0px;
  width: 100%;
  height: 100%;
  border: 40px solid #fff;
  border-radius: 45%;
  clip-path: polygon(
    13% 20%,
    21% 12%,
    30% 10%,
    42% 9%,
    54% 9%,
    65% 9%,
    76% 12%,
    84% 17%,
    91% 24%,
    95% 32%,
    94% 41%,
    91% 51%,
    90% 61%,
    91% 70%,
    92% 83%,
    87% 90%,
    78% 93%,
    69% 93%,
    58% 91%,
    46% 90%,
    36% 90%,
    26% 91%,
    16% 88%,
    8% 81%,
    4% 70%,
    6% 59%,
    8% 49%,
    9% 39%,
    10% 29%
  );

  &::before {
    content: '';
    position: absolute;
    top: 41px;
    left: -30px;
    width: 30px;
    height: 3px;
    background-color: #4fccff;
  }

  &::after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: 25px;
    left: -23px;
    transform-origin: 57px;
    width: 0px;
    height: 0px;
    border: 9px solid transparent;
    border-bottom: 12px solid #32c800;
    animation: ${rotate} 2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }
`;

const Loader: React.FC = () => {
  return (
    <LoaderWrapper>
      <LoaderInner />
    </LoaderWrapper>
  );
};

export default Loader;
