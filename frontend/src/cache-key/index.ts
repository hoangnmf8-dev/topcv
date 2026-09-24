export const provinceKey = ["provinces"]; 
export const jobCategoryKey = ["job-category"];
export const topJob = ["top-job"];
export const jobPostListSortKey = (sort: string, page: number) => ["job-post", sort, page];
export const getCompaniesKey = (page: number, limit: number) => [page, limit]; 
export const getDetailCompanyKey = (code: string) => [code]; 