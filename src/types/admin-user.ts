import { AdminRole } from "@/lib/admin/permissions";

export interface AdminUserPublic {
  id: string;
  username: string;
  display_name: string;
  roles: AdminRole[];
  active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}
