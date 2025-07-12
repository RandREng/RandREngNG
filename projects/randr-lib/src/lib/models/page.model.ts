export interface Page<t> {
  currentPage: number;
  pageCount: number;
  pageSize: number;
  rowCount: number;
  results: t[];
}
