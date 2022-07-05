import { isNilOrError } from 'utils/helperUtils';
import { IUserData, TRole } from 'services/users';
import { isAdmin } from 'services/permissions/roles';

declare module 'services/users' {
  interface IProjectFolderModeratorRole {
    type: 'project_folder_moderator';
    project_folder_id: string;
  }

  interface IRoleRegisty {
    IProjectFolderModeratorRole: IProjectFolderModeratorRole;
  }
}

export function userModeratesFolder(
  user: IUserData | null,
  projectFolderId: string
) {
  if (isNilOrError(user)) {
    return false;
  }

  return (
    isAdmin({ data: user }) ||
    !!user.attributes?.roles?.find((role: TRole) => {
      return (
        role.type === 'project_folder_moderator' &&
        role.project_folder_id === projectFolderId
      );
    })
  );
}

export function isProjectFolderModerator(user: IUserData) {
  return !!user.attributes?.roles?.find((role: TRole) => {
    return role.type === 'project_folder_moderator';
  });
}
