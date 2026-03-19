import type { ResumeData } from '@/types/resume';

export const sampleResumeData: ResumeData = {
  personalInfo: {
    name: '张明远',
    title: '全栈开发工程师',
    email: 'zhangmingyuan@email.com',
    phone: '138-1234-5678',
    location: '上海市浦东新区',
    linkedin: 'linkedin.com/in/zhangmingyuan',
    github: 'github.com/zhangmingyuan',
    website: 'zhangmingyuan.dev',
    summary: '拥有5年软件开发经验的全栈工程师，专注于现代Web技术栈。擅长React、Node.js和云原生开发，在多个大型项目中担任技术负责人。热爱开源社区，积极参与技术分享和代码审查。',
  },
  education: [
    {
      id: '1',
      school: '上海交通大学',
      degree: '硕士',
      field: '计算机科学与技术',
      startDate: '2016-09',
      endDate: '2019-06',
      gpa: '3.9/4.0',
      description: '专注于分布式系统和云计算研究，发表SCI论文2篇',
    },
    {
      id: '2',
      school: '浙江大学',
      degree: '本科',
      field: '软件工程',
      startDate: '2012-09',
      endDate: '2016-06',
      gpa: '3.7/4.0',
      description: '获国家奖学金，ACM程序设计竞赛省级一等奖',
    },
  ],
  workExperience: [
    {
      id: '1',
      company: '字节跳动',
      position: '高级前端工程师',
      startDate: '2021-03',
      endDate: '',
      current: true,
      description: '负责抖音电商后台管理系统的前端架构设计和开发工作',
      achievements: [
        '主导微前端架构改造，将单体应用拆分为5个独立模块，构建时间减少70%',
        '设计并实现组件库，被10+团队复用，提升开发效率40%',
        '优化首屏加载性能，LCP从3.2s降低至1.5s',
      ],
    },
    {
      id: '2',
      company: '阿里巴巴',
      position: '前端开发工程师',
      startDate: '2019-07',
      endDate: '2021-02',
      current: false,
      description: '参与淘宝商家后台系统的开发和维护',
      achievements: [
        '负责订单管理模块重构，代码可维护性提升50%',
        '实现自动化测试覆盖率从30%提升至85%',
        '指导3名初级工程师，参与技术面试和团队建设',
      ],
    },
  ],
  projects: [
    {
      id: '1',
      name: '智能代码审查平台',
      role: '项目负责人',
      startDate: '2023-01',
      endDate: '2023-08',
      current: false,
      description: '基于AI的代码审查工具，集成多种代码质量检测规则，支持自动化CR流程',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      link: 'github.com/zhangmingyuan/code-review-platform',
    },
  ],
  skills: [
    {
      id: '1',
      category: '编程语言',
      items: ['JavaScript', 'TypeScript', 'Python', 'Go', 'SQL'],
    },
    {
      id: '2',
      category: '前端框架',
      items: ['React', 'Vue', 'Next.js', 'Webpack', 'Vite'],
    },
    {
      id: '3',
      category: '后端技术',
      items: ['Node.js', 'Express', 'Django', 'GraphQL', 'Redis'],
    },
    {
      id: '4',
      category: '云与DevOps',
      items: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    },
  ],
  awards: [
    {
      id: '1',
      title: '年度最佳员工',
      organization: '字节跳动',
      date: '2023-12',
      description: '因在技术架构改进和团队建设方面的突出贡献获奖',
    },
    {
      id: '2',
      title: '技术创新奖',
      organization: '阿里巴巴',
      date: '2020-09',
      description: '开发的前端性能监控工具被全集团推广使用',
    },
  ],
  languages: [
    { id: '1', name: '中文', level: '母语' },
    { id: '2', name: '英语', level: '流利' },
    { id: '3', name: '日语', level: '基础' },
  ],
};
