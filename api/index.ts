import { createServer } from "../server";

const app = createServer();

export default function handler(req: any, res: any) {
  return app(req, res);
}
