export const CV_TEXT_LIMIT = 500;
export const JOB_TEXT_LIMITS = {description:5000,requirements:5000,benefits:3000} as const;
export const stripBullet = (text: string) => text.replace(/^\s*(?:[-*•]+|\d+[.)])\s*/, "");
