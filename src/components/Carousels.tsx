import { styled } from "styled-components";

export const Carousels = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CarouselContainer = styled.div``;

export const CarouselTitle = styled.h1`
  margin: 15px 10px 10px calc(10% - 15px);
  font-size: 26px;
  font-weight: bold;

  @media (max-width: 1000px) {
    & {
      margin: 15px 0 15px 15px;
    }
  }
  @media (max-width: 400px) {
    & {
      font-size: 20px;
    }
  }
`;

export const CarouselDescription = styled.p`
  margin: 0 10px 15px 10%;

  font-size: 16px;
  font-weight: bold;
`;
