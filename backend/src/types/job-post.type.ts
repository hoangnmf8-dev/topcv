export interface JobPostListQuery {
  sort?: "newest" | "salary" | "hot";
  page?: number;
  limit?: number;
  saturdaySchedule?: "work" | "off" | "alternating" | "flexible" | "unspecified";
  jobCategory?: string[];
  jobTitle?: string[];
  experienceMin?: number;
  employmentType?: string;
  location?: string;
};
