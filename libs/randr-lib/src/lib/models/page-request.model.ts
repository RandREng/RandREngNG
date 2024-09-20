import { Sort } from './sort.model';

export interface PageRequest {
  page: number;
  size: number;
  sort?: Sort;
}
