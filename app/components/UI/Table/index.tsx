import React from 'react';
import styled from 'styled-components';
import { fontSize, color } from 'utils/styleUtils';

const StyledTable: any = styled.table`
  width:100%;
  padding: 0;
  margin: 0;
  border: none;
  border-spacing: 0;
  border-collapse: collapse;

  th, td {
    padding: 0;
    margin: 0;
  }

  thead {
    tr {
      th {
        color: ${color('label')};
        font-size: ${fontSize('small')};
        font-weight: 400;
        line-height: 18px;
        display: flex;
        align-items: center;
        margin-left: 20px;
        margin-right: 20px;
        padding-top: 10px;
        padding-bottom: 10px;

        &.center {
          justify-content: center;
        }

        &:hover,
        &.active {
          color: ${color('text')};
        }
      }
    }
  }

  tbody {
    tr {
      border-radius: 5px;
      border: solid1px red;

      td {
        color: ${color('clBlue2Darkest')};
        font-size: ${fontSize('small')};
        font-weight: 400;
        line-height: 18px;
        margin-left: 20px;
        margin-right: 20px;
        padding-top: 10px;
        padding-bottom: 10px;

        &.center {
          justify-content: center;
        }
      }

      &:hover {
        cursor: pointer;
        background: ${color('background')};
        color: #999;
      }
    }
  }
`;

interface Props {}

interface State {}

export default class Label extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { children } = this.props;
    const className = this.props['className'];

    return (
      <StyledTable cellspacing="0" cellpadding="0" className={className}>{children}</StyledTable>
    );
  }
}
