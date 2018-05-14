// libs
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// utils
import eventEmitter from 'utils/eventEmitter';
import { IModalInfo } from 'containers/App';

// components
import T from 'components/T';
import Button from 'components/UI/Button';
import { Button as SemanticButton, Icon } from 'semantic-ui-react';
import VoteControl from 'components/VoteControl';
import Unauthenticated from './Unauthenticated';
import VotingDisabled from 'components/VoteControl/VotingDisabled';

// resources
import GetIdea from 'resources/GetIdea';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

const Wrapper = styled.div`
  align-items: strech;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 30px;
  position: relative;
`;

const Title = styled.h2``;

const Description = styled.div`
  flex: 1 1 100%;
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;

  &::after {
    background: linear-gradient(0deg, white, rgba(255, 255, 255, 0));
    bottom: 0;
    content: "";
    display: block;
    height: 3rem;
    left: 0;
    right: 0;
    position: absolute;
  }
`;

const VoteComments = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  margin-bottom: 1rem;
`;
const StyledButton = styled(Button)`
  justify-self: flex-end;
`;

const CommentsCount = styled.span`
  color: ${color('label')};
  font-size: ${fontSize('base')};
`;

const CloseButton: any = styled(SemanticButton)`
  position: absolute;
  top: 0;
  right: 0;
`;

// Typings
export interface Props {
  idea: string;
  className?: string;
  onClose?: {(event): void};
}

type State = {
  showFooter: 'unauthenticated' | 'votingDisabled' | null;
};

export default class IdeaBox extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showFooter: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.idea !== prevProps.idea) {
      this.setState({
        showFooter: null,
      });
    }
  }

  createIdeaClickHandler = (idea) => (event) => {
    event.preventDefault();
    event.stopPropagation();

    eventEmitter.emit<IModalInfo>('projectIdeasMap', 'cardClick', {
      type: 'idea',
      id: idea.id,
      url: `/ideas/${idea.attributes.slug}`
    });
  }

  handleUnauthenticatedVoteClick = () => {
    this.setState({ showFooter: 'unauthenticated' });
  }

  handleDisabledVoteClick = () => {
    this.setState({ showFooter: 'votingDisabled' });
  }

  render() {
    const { showFooter } = this.state;

    return (
      <GetIdea id={this.props.idea}>
        {(idea) => {
          if (isNilOrError(idea)) return null;

          return (
            <Wrapper className={this.props.className}>
              {this.props.onClose && <CloseButton onClick={this.props.onClose} icon="close" circular basic />}
              <Title><T value={idea.attributes.title_multiloc} /></Title>
              <Description>
                <T as="div" value={idea.attributes.body_multiloc} />
              </Description>
              <VoteComments>
                {!showFooter &&
                  <>
                    <VoteControl
                      ideaId={idea.id}
                      size="1"
                      unauthenticatedVoteClick={this.handleUnauthenticatedVoteClick}
                      disabledVoteClick={this.handleDisabledVoteClick}
                    />
                    <CommentsCount>
                      <Icon name="comments" />
                      {idea.attributes.comments_count}
                    </CommentsCount>
                  </>
                }
                {showFooter === 'unauthenticated' &&
                  <Unauthenticated />
                }
                {showFooter === 'votingDisabled' &&
                  <VotingDisabled
                    votingDescriptor={idea.relationships.action_descriptor.data.voting}
                    projectId={idea.relationships.project.data.id}
                  />
                }
              </VoteComments>
              <StyledButton circularCorners={false} width="100%" onClick={this.createIdeaClickHandler(idea)}>
                <FormattedMessage {...messages.seeIdea} />
              </StyledButton>
            </Wrapper>
          );
        }}
      </GetIdea>
    );
  }
}
