// These are the pages you can go to. (within the admin)
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
import dashboardRoutes from './dashboard/routes';
import ideasRoutes from './ideas/routes';
import usersRoutes from './users/routes';
import invitationsRoutes from './invitations/routes';
import projectsRoutes from './projects/routes';
import settingsRoutes from './settings/routes';
import settingsAreasRoutes from './settings/areas/routes';
import customFieldRoutes from './settings/registration/CustomFields/routes';
import pagesRoutes from './pages/routes';
import emailsRoutes from './emails/routes';

import { hasPermission } from 'services/permissions';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
import { currentTenantStream } from 'services/tenant';
import { combineLatest } from 'rxjs';

const isUserAuthorized = (nextState, replace) => {
  const pathNameWithLocale = nextState.location.pathname;
  const { pathname, urlLocale } = removeLocale(pathNameWithLocale);
  combineLatest(
    hasPermission({
      item: { type: 'route', path: pathname },
      action: 'access'
    }),
    currentTenantStream().observable
  ).subscribe(([accessAthorized, tenant]) => {
    if (!accessAthorized) {
      if (tenant.data.attributes.settings.core.lifecycle_stage === 'churned') {
        replace(`${urlLocale && `/${urlLocale}`}/subscription-ended`);
      } else {
        replace(`${urlLocale && `/${urlLocale}`}/sign-in/`);
      }
    }
  });
};

export default () => ({
  path: 'admin',
  name: 'Admin page',
  component: Loadable({
    loader: () => import('containers/Admin'),
    loading: () => null,
  }),
  onEnter: isUserAuthorized,
  indexRoute: {
    onEnter: (nextState, replace) => {
      const pathNameWithLocale = nextState.location.pathname;
      const { urlLocale } = removeLocale(pathNameWithLocale);
      replace(`${urlLocale && `/${urlLocale}`}/admin/dashboard`);
    }
  },
  childRoutes: [
    dashboardRoutes(),
    ideasRoutes(),
    usersRoutes(),
    projectsRoutes(),
    {
      path: 'settings/registration/custom_fields',
      ...(customFieldRoutes()),
    },
    settingsRoutes(),
    settingsAreasRoutes(),
    pagesRoutes(),
    invitationsRoutes(),
    emailsRoutes(),
    {
      path: 'favicon',
      component: Loadable({
        loader: () => import('containers/Admin/favicon'),
        loading: LoadableLoadingAdmin,
        delay: 500
      }),
    },
    {
      path: 'dashboard/insights/:clusteringId',
      component: Loadable({
        loader: () => import('./dashboard/clusterings/Show'),
        loading: LoadableLoadingAdmin,
        delay: 500
      }),
    },
    {
      path: 'guide',
      component: Loadable({
        loader: () => import('containers/Admin/guide'),
        loading: LoadableLoadingAdmin,
        delay: 500
      }),
    },
  ],
});
