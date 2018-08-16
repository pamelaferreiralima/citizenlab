import React, { PureComponent } from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Text = styled.span`
  color: ${colors.label};
  font-size: 17px;
  font-weight: 400;
  line-height: 26px;
  transition: all 100ms ease-out;
`;

const DropdownIcon = styled(Icon)`
  width: 11px;
  height: 7px;
  fill: ${colors.label};
  margin-left: 4px;
  margin-top: 2px;
  transition: all 100ms ease-out;
`;

const Container = styled.div`
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  margin: 0;
  position: relative;

  &:hover,
  &.deployed {
    ${Text} {
      color: #000;
    }

    ${DropdownIcon} {
      fill: #000;
    }
  }
`;

type Props = {
  title: string | JSX.Element,
  deployed: boolean,
  onClick: Function,
  baseID: string,
};

type State = {};

export default class Title extends PureComponent<Props, State> {
  handleClick = (event) => {
    this.props.onClick(event);
  }

  render() {
    const className = this.props['className'];
    const { title, deployed, baseID } = this.props;

    return (
      <Container
        onClick={this.handleClick}
        aria-expanded={deployed}
        id={`${baseID}-label`}
        className={`e2e-filter-selector-button FilterSelectorTitle ${deployed ? 'deployed' : ''} ${className}`}
      >
        <Text className="FilterSelectorTitleText">{title}</Text>
        <DropdownIcon className="FilterSelectorTitleIcon" name="dropdown" />
      </Container>
    );
  }
}
