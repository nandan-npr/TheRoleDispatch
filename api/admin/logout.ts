import { handleLogout } from '../_auth';

export default async function handler(req: any, res: any) {
  return handleLogout(req, res);
}
