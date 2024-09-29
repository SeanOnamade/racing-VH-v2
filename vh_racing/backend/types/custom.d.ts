// vh_racing/backend/types/custom.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}
