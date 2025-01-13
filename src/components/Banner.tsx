import { css, styled } from "styled-components";

export type BannerProps = {
  backgroundImageSrc?: string;
};

export const Banner = styled.div.withConfig({
  shouldForwardProp: (prop) => !["backgroundImageSrc"].includes(prop),
})<BannerProps>`
  position: relative;
  width: 100%;
  aspect-ratio: 1280 / 720;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  @media (max-width: 1200px) {
    & {
      padding: 40px;
    }
  }
  @media (max-width: 800px) {
    & {
      padding: 30px;
    }
  }

  ${({ backgroundImageSrc }) => {
    return !!backgroundImageSrc
      ? css`
          background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
            url(${backgroundImageSrc});
          background-size: contain;
          background-repeat: no-repeat;
        `
      : "";
  }}
`;

export const BannerContent = styled.div`
  @media (max-width: 800px) {
    & {
      position: absolute;
      left: 30px;
      right: 30px;
      bottom: 15px;
    }
  }

  @media (max-width: 340px) {
    & {
      left: 20px;
      right: 20px;
    }
  }
`;

export type BannerTitleProps = {
  textLength: number;
};

export const BannerTitle = styled.h2.withConfig({
  shouldForwardProp: (prop) => !["textLength"].includes(prop),
})<BannerTitleProps>`
  text-shadow: 2px 2px #000;
  margin-bottom: 15px;
  @media (max-width: 600px) {
    & {
      margin-bottom: 0;
    }
  }

  --font-size-scale-factor: 1;
  @media (min-width: 1901px) {
    & {
      --font-size-scale-factor: 3;
    }
  }
  @media (max-width: 1900px) {
    & {
      --font-size-scale-factor: 2.5;
    }
  }
  @media (max-width: 1200px) {
    & {
      --font-size-scale-factor: 2;
    }
  }
  @media (max-width: 1000px) {
    & {
      --font-size-scale-factor: 1.8;
    }
  }
  @media (max-width: 800px) {
    & {
      --font-size-scale-factor: 1.6;
    }
  }
  @media (max-width: 600px) {
    & {
      --font-size-scale-factor: 1.4;
    }
  }
  @media (max-width: 400px) {
    & {
      --font-size-scale-factor: 1;
    }
  }
  ${({ textLength }) => {
    let baseFontSize = 28;
    if (textLength > 30) {
      baseFontSize = 24;
    }
    return css`
      --font-size: calc(${baseFontSize}px * var(--font-size-scale-factor, 1));
      --round-interval: 1px;
      font-size: clamp(
        24px,
        round(var(--font-size), var(--round-interval)),
        68px
      );
    `;
  }}
`;

export const BannerOverview = styled.div`
  text-shadow: 2px 2px #000;
  line-height: 1.2;
  width: 50%;
  @media (min-width: 1901px) {
    & {
      width: 30%;
    }
  }
  @media (max-width: 1900px) {
    & {
      width: 30%;
    }
  }
  @media (max-width: 1500px) {
    & {
      width: 40%;
    }
  }
  @media (max-width: 800px) {
    & {
      width: 100%;
    }
  }

  font-size: 18px;
  @media (max-width: 1000px) {
    & {
      font-size: 16px;
    }
  }
`;

export const BannerContentMobile = styled.div`
  background-color: #000;

  padding: 0 30px 30px;
  @media (max-width: 340px) {
    & {
      padding: 0 20px 20px;
    }
  }
`;
