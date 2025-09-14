import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Icon } from '@components/icons';
import { socialMedia } from '@config';

const StyledFooter = styled.footer`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  height: auto;
  min-height: 70px;
  padding: 15px;
  text-align: center;
`;

const StyledSocialLinks = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    width: 100%;
    max-width: 270px;
    margin: 0 auto 10px;
    color: var(--light-slate);
  }

  ul {
    ${({ theme }) => theme.mixins.flexBetween};
    padding: 0;
    margin: 0;
    list-style: none;

    a {
      padding: 10px;
      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
`;

const StyledCredit = styled.div`
  color: var(--light-slate);
  font-family: var(--font-mono);
  font-size: var(--fz-xxs);
  line-height: 1;

  a {
    padding: 10px;
  }

  .github-stats {
    margin-top: 10px;

    & > span {
      display: inline-flex;
      align-items: center;
      margin: 0 7px;
    }
    svg {
      display: inline-block;
      margin-right: 5px;
      width: 14px;
      height: 14px;
    }
  }
`;

interface GitHubInfo {
  stars: number | null;
  forks: number | null;
}

const Footer: React.FC = () => {
  const [githubInfo, setGitHubInfo] = useState<GitHubInfo>({
    stars: null,
    forks: null,
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    fetch('https://github.com/GuidoTapia/personal-site')
      .then(response => response.json())
      .then(json => {
        const { stargazers_count, forks_count } = json;
        setGitHubInfo({
          stars: stargazers_count,
          forks: forks_count,
        });
      })
      .catch(e => console.error(e));
  }, []);

  return (
    <StyledFooter>
      <StyledSocialLinks>
        <ul>
          {socialMedia &&
            socialMedia.map(({ name, url }, i) => (
              <li key={i}>
                <a href={url} aria-label={name}>
                  <Icon name={name} />
                </a>
              </li>
            ))}
        </ul>
      </StyledSocialLinks>

      <StyledCredit tabIndex={-1}>
        <a href="https://github.com/GuidoTapia/personal-site">
          <div>Built by Guido Tapia Oré</div>

          {githubInfo.stars && githubInfo.forks && (
            <div className="github-stats">
              <span>
                <Icon name="Star" />
                <span>{githubInfo.stars.toLocaleString()}</span>
              </span>
              <span>
                <Icon name="Fork" />
                <span>{githubInfo.forks.toLocaleString()}</span>
              </span>
            </div>
          )}
        </a>
      </StyledCredit>
    </StyledFooter>
  );
};

export default Footer;
