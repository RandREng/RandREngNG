import { Payload } from './payload.model';

export class SyncTask<T extends Payload> {
  constructor(public url: string, public body: T, public params?: string) {}
}
