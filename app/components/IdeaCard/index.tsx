import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link, browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import Unauthenticated from 'components/IdeaCard/Unauthenticated';
import VoteControl from 'components/VoteControl';
import { IModalProps } from 'containers/App';

// services
import { authUserStream } from 'services/auth';
import { localeStream } from 'services/locale';
import { ideaByIdStream, IIdea } from 'services/ideas';
import { userStream, IUser } from 'services/users';
import { ideaImageStream, IIdeaImage } from 'services/ideaImages';

// utils
import T from 'containers/T';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage, FormattedRelative } from 'react-intl';
import messages from './messages';

// styles
import styled, { keyframes } from 'styled-components';

const IdeaContainer: any = styled(Link)`
  width: 100%;
  height: 370px;
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transition: all 150ms ease-out;
  position: relative;
  border: solid 1px #e5e5e5;

  &:hover {
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.08);
  }
`;

/*
const fadeIn = keyframes`
  0% { display:none ; opacity: 0; }
  1% { display: flex ; opacity: 0; }
  100% { display: flex ; opacity: 1; }
`;

const IdeaHoverBar = styled.div`
  background: rgba(0,0,0,0.65);
  height: 60px;
  position: absolute;
  top: 0;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  color: #fff;
  padding: 20px;
  border-radius: 5px 5px 0 0;

  display: none;
  opacity: 0;

  ${IdeaContainer}:hover & {
    animation: ${fadeIn} 0.15s ease-out;
    display: flex;
    opacity: 1;
    display: none;
  }
`;
*/

const CommentCount = styled.span`
  padding-left: 6px;
`;

const IdeaImage: any = styled.div`
  width: 100%;
  height: 135px;
  border-bottom: solid 1px #e5e5e5;
  background-image: url(${(props: any) => props.src});  
  background-repeat: no-repeat;
  background-size: cover;
`;

const IdeaImagePlaceholder = styled.div`
  width: 100%;
  height: 135px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #cfd6db;
  border-bottom: solid 1px #e5e5e5;
`;

const IdeaImagePlaceholderIcon = styled(Icon)`
  height: 50px;
  fill: #fff;
`;

const IdeaContent = styled.div`
  flex-grow: 1;
  padding: 20px;
`;

const IdeaFooter = styled.div`
  padding: 20px;
`;

const IdeaTitle: any = styled.h4`
  color: #333;
  display: block;
  display: -webkit-box;
  max-width: 400px;
  max-height: 60px;
  margin: 0;
  font-size: 22px;
  line-height: 26px;
  font-weight: 500;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
`;

const IdeaAuthor = styled.div`
  color: #999;
  font-size: 14px;
  font-weight: 300;
  margin-top: 12px;
`;

// We use <span> instead of Link, because the whole card is already
// a Link (more important for SEO) and <a> tags can not be nested
const AuthorLink = styled.span`
  color: #333;

  &:hover {
    color: #333;
    text-decoration: underline;
  }
`;

type Props = {
  ideaId: string;
};

type State = {
  idea: IIdea | null;
  ideaImage: IIdeaImage | null;
  ideaAuthor: IUser | null;
  isAuthenticated: boolean;
  locale: string | null;
  showUnauthenticated: boolean;
  loading: boolean;
};

export default class IdeaCard extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      idea: null,
      ideaImage: null,
      ideaAuthor: null,
      isAuthenticated: false,
      locale: null,
      showUnauthenticated: false,
      loading: true
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { ideaId } = this.props;
    const locale$ = localeStream().observable;
    const isAuthenticated$ = authUserStream().observable.map(authUser => !_.isNull(authUser));
    const ideaWithMeta$ = ideaByIdStream(ideaId).observable.switchMap((idea) => {
      const ideaId = idea.data.id;
      const ideaImages = idea.data.relationships.idea_images.data;
      const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);
      const idea$ = ideaByIdStream(ideaId).observable;
      const ideaAuthor$ = userStream(idea.data.relationships.author.data.id).observable;
      const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable : Rx.Observable.of(null));

      return Rx.Observable.combineLatest(idea$, ideaImage$, ideaAuthor$).map(([idea, ideaImage, ideaAuthor]) => {
        return { idea, ideaImage, ideaAuthor };
      });
    });

    this.subscriptions = [
      eventEmitter.observe(voteControlNamespace, 'unauthenticatedVoteClick')
        .filter(({ eventValue }) => eventValue === ideaId)
        .subscribe(() => this.setState({ showUnauthenticated: true })),

      Rx.Observable.combineLatest(
        locale$,
        isAuthenticated$,
        ideaWithMeta$
      ).subscribe(([locale, isAuthenticated, { idea, ideaImage, ideaAuthor }]) => {
        this.setState({ idea, ideaImage, ideaAuthor, locale, isAuthenticated, loading: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onCardClick = (event) => {
    const { idea } = this.state;

    if (idea) {
      event.preventDefault();
      const ideaId = idea.data.id;
      const ideaSlug = idea.data.attributes.slug;
      eventEmitter.emit<IModalProps>(namespace, 'ideaCardClick', { ideaId, ideaSlug });
    }
  }

  onAuthorClick = (event) => {
    const { ideaAuthor } = this.state;

    if (ideaAuthor) {
      event.stopPropagation();
      event.preventDefault();
      browserHistory.push(`/profile/${ideaAuthor.data.attributes.slug}`);
    }
  }

  render() {
    const { idea, ideaImage, ideaAuthor, isAuthenticated, locale, showUnauthenticated, loading } = this.state;

    if (!loading && idea && ideaAuthor && locale) {
      const ideaImageUrl = (ideaImage ? ideaImage.data.attributes.versions.medium : null);
      const authorName = (ideaAuthor ? `${ideaAuthor.data.attributes.first_name} ${ideaAuthor.data.attributes.last_name}` : null);

      return (
        <IdeaContainer onClick={this.onCardClick} to={`/ideas/${idea.data.attributes.slug}`}>
          {/*
          <IdeaHoverBar>
            <FormattedRelative value={idea.data.attributes.created_at} />
            <div>
              <Icon name="comment" />
              <CommentCount>{idea.data.attributes.comments_count}</CommentCount>
            </div>
          </IdeaHoverBar>
          */}

          {ideaImageUrl && <IdeaImage src={ideaImageUrl} />}
          {!ideaImageUrl && 
            <IdeaImagePlaceholder>
              <IdeaImagePlaceholderIcon name="idea" />
            </IdeaImagePlaceholder>
          }
          <IdeaContent>
            <IdeaTitle>
              <T value={idea.data.attributes.title_multiloc} />
            </IdeaTitle>
            <IdeaAuthor>
              <FormattedRelative value={idea.data.attributes.created_at} />&nbsp;
              <FormattedMessage
                {...messages.byAuthorLink}
                values={{
                  authorLink: <AuthorLink onClick={this.onAuthorClick}>{authorName}</AuthorLink>,
                }}
              />
            </IdeaAuthor>
          </IdeaContent>
          {!showUnauthenticated &&
            <IdeaFooter>
              <VoteControl ideaId={idea.data.id} />
            </IdeaFooter>
          }
          {showUnauthenticated && <Unauthenticated />}
        </IdeaContainer>
      );
    }

    return null;
  }
}
