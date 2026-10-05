export type NavItemId =
  | "create-application"
  | "view-applications"
  | "create-role"
  | "view-application-roles"
  | "create-app-user"
  | "assign-application-to-app-user"
  | "assign-role-to-app-user"
  | "connect-applications-for-app-user"
  | "view-app-users"
  | "create-internal-user"
  | "assign-application-to-internal-user"
  | "assign-role-to-internal-user"
  | "connect-applications-for-internal-user"
  | "view-internal-users";

export interface NavItem {
  id: NavItemId;
  label: string;
}

// Add future sidebar entries here; HomeShell renders whatever is listed.
export const NAV_ITEMS: NavItem[] = [
  { id: "create-application", label: "Crear aplicación" },
  { id: "view-applications", label: "Ver aplicaciones" },
  { id: "create-role", label: "Crear rol de aplicación" },
  { id: "view-application-roles", label: "Ver roles de aplicaciones" },
  { id: "create-app-user", label: "Crear usuario de aplicación" },
  {
    id: "assign-application-to-app-user",
    label: "Asignar aplicación a usuario de aplicación",
  },
  {
    id: "assign-role-to-app-user",
    label: "Asignar rol a usuarios de aplicación",
  },
  {
    id: "connect-applications-for-app-user",
    label: "Relacionar aplicaciones para usuarios de aplicacion",
  },
  { id: "view-app-users", label: "Ver usuarios de aplicación" },
  { id: "create-internal-user", label: "Crear usuario interno" },
  {
    id: "assign-application-to-internal-user",
    label: "Asignar aplicación a usuario interno",
  },
  {
    id: "assign-role-to-internal-user",
    label: "Asignar rol a usuario interno",
  },
  {
    id: "connect-applications-for-internal-user",
    label: "Relacionar aplicaciones para usuarios internos",
  },
  { id: "view-internal-users", label: "Ver usuarios internos" },
];
