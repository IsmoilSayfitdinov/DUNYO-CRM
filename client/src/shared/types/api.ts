/** Backend'ning sahifalangan (paginated) javob qobig'i */
export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/** Ko'p endpointlarда uchraydigan limit/offset query parametrlari */
export interface PageParams {
  limit?: number;
  offset?: number;
}
