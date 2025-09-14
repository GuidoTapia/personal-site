import React from 'react';
import styled from 'styled-components';
import { Layout, Hero, About, Jobs, Featured, Contact } from '@components';

const StyledMainContainer = styled.main`
  counter-reset: section;
`;

interface IndexPageProps {
  location: {
    pathname: string;
    hash?: string;
  };
}

const IndexPage: React.FC<IndexPageProps> = ({ location }) => (
  <Layout location={location}>
    <StyledMainContainer className="fillHeight">
      <Hero />
      <About />
      <Jobs />
      <Featured />
      {/* <Projects /> */}
      <Contact />
    </StyledMainContainer>
  </Layout>
);

export default IndexPage;
