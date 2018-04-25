import * as React from 'react';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';

// router
import { Link, withRouter, WithRouterProps } from 'react-router';

// components
import Icon, { IconNames } from 'components/UI/Icon';
import FeatureFlag from 'components/FeatureFlag';
import { hasPermission } from 'services/permissions';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled, { css } from 'styled-components';
import { media } from 'utils/styleUtils';

const Menu = styled.div`
  width: 240px;
  height: 100%;
  position: fixed;
  z-index: 1;
  margin-top: 0px;
  background: #3b3b3b;
  padding-top: 45px;

  ${media.smallerThanMinTablet`
    width: 70px;
  `}
`;

const IconWrapper = styled.div`
  width: 49px;
  height: 49px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledIcon = styled(Icon)`
  height: 18px;
  max-width: 30px;
  fill: #fff;
  opacity: 0.5;

  &.idea {
    height: 21px;
  }
`;

const Text = styled.div`
  color: #fff;
  font-size: 17px;
  font-weight: 400;
  line-height: 21px;
  margin-left: 15px;
  opacity: 0.4;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const MenuLink = styled(Link)`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  padding-left: 12px;
`;

const MenuItem: any = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  padding: 0;
  padding-bottom: 1px;
  margin: 0;
  margin-bottom: 5px;
  cursor: pointer;

  &:hover {
    ${StyledIcon} {
      opacity: 1;
    };

    ${Text} {
      opacity: 1;
    };
  }

  ${(props: any) => props.active && css`
    background: #222;

    ${StyledIcon} {
      opacity: 1;
    };

    ${Text} {
      opacity: 1;
    };
  `}
`;

type Props = {};

type State = {
  navItems: NavItem[];
};

type NavItem = {
  id: string,
  link: string,
  iconName: IconNames,
  message: keyof typeof messages,
  featureName?: string,
  isActive: (pathname: string) => boolean,
};

class Sidebar extends React.PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  routes: NavItem[];

  constructor(props: Props) {
    super(props as any);

    this.state = {
      navItems: [],
    };

    this.routes = [
      {
        id: 'dashboard',
        link: '/admin',
        iconName: 'analytics',
        message: 'dashboard',
        isActive: (pathname) => (pathname === '/admin'),
      },
      {
        id: 'users',
        link: '/admin/users/registered',
        iconName: 'people',
        message: 'users',
        isActive: (pathName) => (pathName.startsWith('/admin/users'))
      },
      {
        id: 'groups',
        link: '/admin/groups',
        iconName: 'groups',
        message: 'groups',
        featureName: 'groups',
        isActive: (pathName) => (pathName.startsWith('/admin/groups'))
      },
      {
        id: 'projects',
        link: '/admin/projects',
        iconName: 'project',
        message: 'projects',
        isActive: (pathName) => (pathName.startsWith('/admin/projects'))
      },
      {
        id: 'settings',
        link: '/admin/settings/general',
        iconName: 'settings',
        message: 'settings',
        isActive: (pathName) => (pathName.startsWith('/admin/settings'))
      },
    ];
  }

  componentDidMount() {
    const permissionsObservables: Observable<boolean>[] = [];
    const navItems: NavItem[] = [];

    this.routes.forEach((route) => {
      permissionsObservables.push(hasPermission({
        item: { type: 'route', path: route.link },
        action: 'access'
      }));
    });

    combineLatest(permissionsObservables)
    .subscribe((permissions) => {
      permissions.forEach((permission, index) => {
        if (permission) {
          navItems.push(this.routes[index]);
        }
      });

      this.setState({ navItems });
    });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { pathname } = this.props.location;
    const { navItems } = this.state;

    if (navItems.length <= 1) {
      return null;
    }

    return (
      <Menu>
        {navItems.map((route) => (
          <FeatureFlag name={route.featureName} key={route.id}>
            <MenuItem active={route.isActive(pathname)}>
              <MenuLink to={route.link}>
                <IconWrapper><StyledIcon name={route.iconName} /></IconWrapper>
                <Text>{formatMessage({ ...messages[route.message] })}</Text>
          </MenuLink>
        </MenuItem>
        </FeatureFlag>
        ))}
      </Menu>
    );
  }
}

export default withRouter(injectIntl<Props>(Sidebar) as any);
