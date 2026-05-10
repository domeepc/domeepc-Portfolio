export const profile = {
  name: 'Domagoj Milardović',
  handle: 'domeepc',
  title: 'Computer Engineering Student & Developer',
  bio: 'Computer Engineer student at the University of Split. I build web apps, embedded systems, and algorithms — and make videos about gaming and coding.',
  location: 'Kaštela, Split-Dalmatia, Croatia',
  avatarUrl: 'https://avatars.githubusercontent.com/u/132380559?v=4',
  githubUrl: 'https://github.com/domeepc',
  linkedinUrl: 'https://www.linkedin.com/in/domagoj-milardović-0a3b39263/',
};

export type Repo = {
  name: string;
  description: string;
  language: string;
  languageColor: string;
  url: string;
  homepage?: string;
  updatedAt: string;
};

export const repos: Repo[] = [
  {
    name: 'activitysearch',
    description: 'A web platform to discover and search for activities. Built with TypeScript, live at activitysearch.eu.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    url: 'https://github.com/domeepc/activitysearch',
    homepage: 'https://activitysearch.eu',
    updatedAt: '2026-04-30',
  },
  {
    name: 'i_life',
    description: 'A website bringing the most common services into one place. Still in active development.',
    language: 'JavaScript',
    languageColor: '#f7df1e',
    url: 'https://github.com/domeepc/i_life',
    updatedAt: '2025-06-15',
  },
  {
    name: 'Changing-gear-alg',
    description: 'An algorithm implementation for automatic gear-changing logic, written in C++.',
    language: 'C++',
    languageColor: '#f34b7d',
    url: 'https://github.com/domeepc/Changing-gear-alg',
    updatedAt: '2025-11-07',
  },
];

export type Skill = {
  name: string;
  level: 'Expert' | 'Proficient' | 'Learning';
  category: 'Language' | 'Framework' | 'Tool';
};

export const skills: Skill[] = [
  { name: 'TypeScript', level: 'Proficient', category: 'Language' },
  { name: 'JavaScript', level: 'Proficient', category: 'Language' },
  { name: 'C', level: 'Proficient', category: 'Language' },
  { name: 'C++', level: 'Proficient', category: 'Language' },
  { name: 'C#', level: 'Learning', category: 'Language' },
  { name: 'React', level: 'Proficient', category: 'Framework' },
  { name: 'Astro', level: 'Learning', category: 'Framework' },
  { name: 'Node.js', level: 'Proficient', category: 'Framework' },
  { name: '.NET', level: 'Learning', category: 'Framework' },
  { name: 'Git', level: 'Proficient', category: 'Tool' },
  { name: 'GitHub', level: 'Proficient', category: 'Tool' },
  { name: 'Linux', level: 'Learning', category: 'Tool' },
];

export type TimelineEntry = {
  year: string;
  title: string;
  institution: string;
  description: string;
  type: 'education' | 'work' | 'project';
  current?: boolean;
  website?: string;
};

export const timeline: TimelineEntry[] = [
  {
    year: '2023',
    title: 'Started Programming Journey',
    institution: 'Self-taught',
    description:
      'Began learning programming with C and C++, progressing to web technologies and full-stack development.',
    type: 'education',
  },
  {
    year: '2023 – 2028',
    title: 'Bachelor of Computer Engineering',
    institution: 'University of Split',
    description:
      'Studying Computer Engineering at the Faculty of Electrical Engineering, Mechanical Engineering and Naval Architecture (FESB). Focus on software development, algorithms, embedded systems, and computer architecture.',
    type: 'education',
    current: true,
  },
  {
    year: '2025 - Present',
    title: 'Embedded Systems: FESB Racing',
    institution: 'Group or Society',
    description:
      'Developed software for the FESB Racing team, a group of students from the University of Split. Made programs in C and C++ for our electrical formula.',
    type: 'project',
    current: true,
  },
  {
    year: '2025 – Present',
    title: 'activitysearch.eu — Lead Developer',
    institution: 'Personal Project',
    description:
      'Designed and built a full-stack TypeScript web platform for discovering activities. Deployed and maintained at activitysearch.eu.',
    type: 'project',
    current: true,
  },
  {
    year: '2026 - Present',
    title: 'Intern Java Developer',
    institution: 'Abysalto',
    description:
      'Working as an intern at Abysalto, a Croatian IT company focused on digital transformation and software development.',
    type: 'work',
    current: true,
    website: 'https://abysalto.eu',
   
  },
];
