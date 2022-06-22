import { IProjectFolderData } from './../services/projectFolders';
import {
  definePermissionRule,
  IRouteItem,
} from 'services/permissions/permissions';
import { isProjectFolderModerator, moderatesFolder } from './roles';
import { isAdmin } from 'services/permissions/roles';
import {
  canAccessRoute,
  isModeratorRoute,
  isAdminRoute,
  MODERATOR_ROUTES,
} from 'services/permissions/rules/routePermissions';
import { IUser } from 'services/users';
import { IAppConfigurationData } from 'services/appConfiguration';
import { isNilOrError } from 'utils/helperUtils';

const canUserAccessAdminFolderRoute = (
  item: IRouteItem,
  user: IUser | null,
  tenant: IAppConfigurationData
) => {
  const hasAdminFolderRouteAccess =
    !isNilOrError(user) &&
    isProjectFolderModerator(user.data) &&
    // folder mods have the same
    // access rights as project mods
    // besides their respective folders/projects
    (isModeratorRoute(item) || item.path.includes('folders'));

  return (
    canAccessRoute(item, user, tenant) ||
    hasAdminFolderRouteAccess ||
    // To be refactored.
    // Removing this at the moment, redirects
    // a folder mod to the home page on refreshing a page
    // the mod has access too.
    (isAdminRoute(item.path) &&
      (user ? isProjectFolderModerator(user.data) : false) &&
      MODERATOR_ROUTES.includes(item.path))
  );
};

definePermissionRule('route', 'access', canUserAccessAdminFolderRoute);

definePermissionRule(
  'project_folder',
  'create',
  (_folder: IProjectFolderData, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'delete',
  (_folder: IProjectFolderData, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'reorder',
  (_folder: IProjectFolderData, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'project_folder',
  'moderate',
  (folder: IProjectFolderData, user: IUser) => {
    return moderatesFolder(user.data, folder.id);
  }
);
