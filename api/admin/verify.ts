import { handleVerify } from '../_auth';

export default async function handler(req: any, res: any) {
  return handleVerify(req, res);
}
