import Page from './Page';
import User from './User';

export default interface PageListResponse {
	limit: number,
	offset: number,
	totalCount: number,
	pages: Page[];
};