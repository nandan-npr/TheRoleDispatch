import { handleLogin } from '../_auth';

export default async function handler(req: any, res: any) {
  return handleLogin(req, res);
}
