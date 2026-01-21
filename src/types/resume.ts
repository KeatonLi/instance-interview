export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Project {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies: string[];
  link: string;
}

export interface Skill {
  id: string;
  category: string;
  items: string[];
}

export interface Award {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: Skill[];
  awards: Award[];
  languages: Language[];
}

export const defaultResumeData: ResumeData = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: ''
  },
  education: [],
  workExperience: [],
  projects: [],
  skills: [],
  awards: [],
  languages: []
};
