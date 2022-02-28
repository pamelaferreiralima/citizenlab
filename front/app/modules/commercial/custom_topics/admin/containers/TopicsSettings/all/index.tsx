import React, { useState } from 'react';

// resources
import { deleteTopic } from '../../../../services/topics';

// hooks
import useTopics from 'hooks/useTopics';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import {
  Section,
  SectionDescription,
  SectionTitle,
  StyledLink,
} from 'components/admin/Section';
import { List } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import { ButtonWrapper } from 'components/admin/PageWrapper';
import DefaultTopicRow from './DefaultTopicRow';
import CustomTopicRow from './CustomTopicRow';
import Modal, {
  ModalContentContainer,
  ButtonsWrapper,
  Content,
} from 'components/UI/Modal';

// utils
import { isNilOrError } from 'utils/helperUtils';

const TopicList = () => {
  const topics = useTopics();

  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [topicIdToDelete, setTopicIdToDelete] = useState<string | null>(null);
  const [processingDeletion, setProcessingDeletion] = useState<boolean>(false);

  if (isNilOrError(topics)) return null;

  const handleDeleteClick =
    (topicId: string) => (event: React.FormEvent<any>) => {
      event.preventDefault();

      setShowConfirmationModal(true);
      setTopicIdToDelete(topicId);
    };

  const closeSendConfirmationModal = () => {
    setShowConfirmationModal(false);
    setTopicIdToDelete(null);
  };

  const handleTopicDeletionConfirm = () => {
    if (topicIdToDelete) {
      setProcessingDeletion(true);

      deleteTopic(topicIdToDelete)
        .then(() => {
          setProcessingDeletion(false);
          setShowConfirmationModal(false);
          setTopicIdToDelete(null);
        })
        .catch(() => {
          setProcessingDeletion(false);
        });
    }
  };

  return (
    <Section>
      <SectionTitle>
        <FormattedMessage {...messages.titleTopicManager} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage
          {...messages.descriptionTopicManagerText}
          values={{
            adminProjectsLink: (
              <StyledLink to="/admin/projects/">
                <FormattedMessage {...messages.projectsSettings} />
              </StyledLink>
            ),
          }}
        />
      </SectionDescription>

      <ButtonWrapper>
        <Button
          buttonStyle="cl-blue"
          icon="plus-circle"
          linkTo="/admin/settings/topics/new"
          id="e2e-add-custom-topic-button"
        >
          <FormattedMessage {...messages.addTopicButton} />
        </Button>
      </ButtonWrapper>
      <List key={topics.length}>
        {topics.map((topic, index) => {
          const isLastItem = index === topics.length - 1;

          if (!isNilOrError(topic)) {
            const isDefaultTopic = topic.attributes.code !== 'custom';

            return isDefaultTopic ? (
              <DefaultTopicRow
                topic={topic}
                isLastItem={isLastItem}
                key={topic.id}
              />
            ) : (
              <CustomTopicRow
                topic={topic}
                isLastItem={isLastItem}
                handleDeleteClick={handleDeleteClick}
                key={topic.id}
              />
            );
          }

          return null;
        })}
      </List>
      <Modal
        opened={showConfirmationModal}
        close={closeSendConfirmationModal}
        header={<FormattedMessage {...messages.confirmHeader} />}
      >
        <ModalContentContainer>
          <Content>
            <FormattedMessage {...messages.deleteTopicConfirmation} />
          </Content>
          <ButtonsWrapper>
            <Button
              buttonStyle="secondary"
              onClick={closeSendConfirmationModal}
            >
              <FormattedMessage {...messages.cancel} />
            </Button>
            <Button
              buttonStyle="delete"
              onClick={handleTopicDeletionConfirm}
              processing={processingDeletion}
              id="e2e-custom-topic-delete-confirmation-button"
            >
              <FormattedMessage {...messages.delete} />
            </Button>
          </ButtonsWrapper>
        </ModalContentContainer>
      </Modal>
    </Section>
  );
};

export default TopicList;
