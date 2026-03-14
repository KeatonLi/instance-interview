import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import type { ResumeData } from '@/types/resume';

interface ResumeFormProps {
  data: ResumeData;
  setData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ data, setData }) => {
  const updatePersonalInfo = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Work Experience functions
  const addWorkExperience = () => {
    setData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, {
        id: generateId(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        achievements: ['']
      }]
    }));
  };

  const updateWorkExperience = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeWorkExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(item => item.id !== id)
    }));
  };

  // Education functions
  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: generateId(),
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
        description: ''
      }]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(item => item.id !== id)
    }));
  };

  // Project functions
  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: generateId(),
        name: '',
        role: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        technologies: [''],
        link: ''
      }]
    }));
  };

  const updateProject = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeProject = (id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(item => item.id !== id)
    }));
  };

  // Skill functions
  const addSkill = () => {
    setData(prev => ({
      ...prev,
      skills: [...prev.skills, {
        id: generateId(),
        category: '',
        items: ['']
      }]
    }));
  };

  const updateSkill = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeSkill = (id: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(item => item.id !== id)
    }));
  };

  // Award functions
  const addAward = () => {
    setData(prev => ({
      ...prev,
      awards: [...prev.awards, {
        id: generateId(),
        title: '',
        organization: '',
        date: '',
        description: ''
      }]
    }));
  };

  const updateAward = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      awards: prev.awards.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeAward = (id: string) => {
    setData(prev => ({
      ...prev,
      awards: prev.awards.filter(item => item.id !== id)
    }));
  };

  // Language functions
  const addLanguage = () => {
    setData(prev => ({
      ...prev,
      languages: [...prev.languages, {
        id: generateId(),
        name: '',
        level: ''
      }]
    }));
  };

  const updateLanguage = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      languages: prev.languages.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeLanguage = (id: string) => {
    setData(prev => ({
      ...prev,
      languages: prev.languages.filter(item => item.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">个人信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名 *</Label>
              <Input
                id="name"
                value={data.personalInfo.name}
                onChange={(e) => updatePersonalInfo('name', e.target.value)}
                placeholder="张三"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">职位标题</Label>
              <Input
                id="title"
                value={data.personalInfo.title}
                onChange={(e) => updatePersonalInfo('title', e.target.value)}
                placeholder="前端开发工程师"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
                placeholder="example@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">电话</Label>
              <Input
                id="phone"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                placeholder="138-xxxx-xxxx"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">所在地</Label>
            <Input
              id="location"
              value={data.personalInfo.location}
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
              placeholder="北京市"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={data.personalInfo.linkedin}
                onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                placeholder="linkedin.com/in/yourname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={data.personalInfo.github}
                onChange={(e) => updatePersonalInfo('github', e.target.value)}
                placeholder="github.com/yourname"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">个人网站</Label>
            <Input
              id="website"
              value={data.personalInfo.website}
              onChange={(e) => updatePersonalInfo('website', e.target.value)}
              placeholder="yourname.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">个人简介</Label>
            <Textarea
              id="summary"
              value={data.personalInfo.summary}
              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
              placeholder="简要介绍你的专业背景、核心技能和职业目标..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="experience" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experience">工作经验</TabsTrigger>
          <TabsTrigger value="education">教育背景</TabsTrigger>
          <TabsTrigger value="projects">项目经历</TabsTrigger>
          <TabsTrigger value="skills">技能专长</TabsTrigger>
        </TabsList>

        <TabsContent value="experience">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">工作经验</CardTitle>
              <Button size="sm" onClick={addWorkExperience}>
                <Plus size={16} className="mr-1" />
                添加经历
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.workExperience.map((exp) => (
                <div key={exp.id} className="border rounded-lg p-4 space-y-3 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeWorkExperience(exp.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>公司名称</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                        placeholder="ABC 公司"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>职位</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => updateWorkExperience(exp.id, 'position', e.target.value)}
                        placeholder="高级工程师"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>开始日期</Label>
                      <Input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>结束日期</Label>
                      <Input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                      />
                      <label className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => updateWorkExperience(exp.id, 'current', e.target.checked)}
                        />
                        <span className="text-sm">目前在职</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>工作描述</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                      placeholder="描述你的主要职责和工作内容..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>主要成就</Label>
                    {exp.achievements.map((achievement, idx) => (
                      <Input
                        key={idx}
                        value={achievement}
                        onChange={(e) => {
                          const newAchievements = [...exp.achievements];
                          newAchievements[idx] = e.target.value;
                          updateWorkExperience(exp.id, 'achievements', newAchievements);
                        }}
                        placeholder="例如：带领团队完成项目，提升效率30%"
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newAchievements = [...exp.achievements, ''];
                        updateWorkExperience(exp.id, 'achievements', newAchievements);
                      }}
                    >
                      <Plus size={14} className="mr-1" />
                      添加成就
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">教育背景</CardTitle>
              <Button size="sm" onClick={addEducation}>
                <Plus size={16} className="mr-1" />
                添加教育经历
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="border rounded-lg p-4 space-y-3 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeEducation(edu.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>学校名称</Label>
                      <Input
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                        placeholder="北京大学"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>学位</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="本科 / 硕士"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>专业</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                        placeholder="计算机科学与技术"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GPA</Label>
                      <Input
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        placeholder="3.8/4.0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>开始日期</Label>
                      <Input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>毕业日期</Label>
                      <Input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>备注</Label>
                    <Textarea
                      value={edu.description}
                      onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                      placeholder="相关课程、荣誉等..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">项目经历</CardTitle>
              <Button size="sm" onClick={addProject}>
                <Plus size={16} className="mr-1" />
                添加项目
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 space-y-3 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeProject(project.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>项目名称</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        placeholder="电商平台重构"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>你的角色</Label>
                      <Input
                        value={project.role}
                        onChange={(e) => updateProject(project.id, 'role', e.target.value)}
                        placeholder="前端负责人"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>开始日期</Label>
                      <Input
                        type="month"
                        value={project.startDate}
                        onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>结束日期</Label>
                      <Input
                        type="month"
                        value={project.endDate}
                        onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                        disabled={project.current}
                      />
                      <label className="flex items-center gap-2 mt-1">
                        <input
                          type="checkbox"
                          checked={project.current}
                          onChange={(e) => updateProject(project.id, 'current', e.target.checked)}
                        />
                        <span className="text-sm">进行中</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>项目描述</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                      placeholder="描述项目背景、目标和你负责的工作..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>使用技术</Label>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <Input
                          key={idx}
                          value={tech}
                          onChange={(e) => {
                            const newTechs = [...project.technologies];
                            newTechs[idx] = e.target.value;
                            updateProject(project.id, 'technologies', newTechs);
                          }}
                          placeholder="React"
                          className="w-24"
                        />
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newTechs = [...project.technologies, ''];
                          updateProject(project.id, 'technologies', newTechs);
                        }}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>项目链接</Label>
                    <Input
                      value={project.link}
                      onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                      placeholder="github.com/yourname/project"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">技能专长</CardTitle>
              <Button size="sm" onClick={addSkill}>
                <Plus size={16} className="mr-1" />
                添加技能分类
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.skills.map((skillGroup) => (
                <div key={skillGroup.id} className="border rounded-lg p-4 space-y-3 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeSkill(skillGroup.id)}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                  <div className="space-y-2">
                    <Label>技能分类</Label>
                    <Input
                      value={skillGroup.category}
                      onChange={(e) => updateSkill(skillGroup.id, 'category', e.target.value)}
                      placeholder="编程语言 / 框架 / 工具"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>技能项</Label>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((skill, idx) => (
                        <Input
                          key={idx}
                          value={skill}
                          onChange={(e) => {
                            const newItems = [...skillGroup.items];
                            newItems[idx] = e.target.value;
                            updateSkill(skillGroup.id, 'items', newItems);
                          }}
                          placeholder="JavaScript"
                          className="w-28"
                        />
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newItems = [...skillGroup.items, ''];
                          updateSkill(skillGroup.id, 'items', newItems);
                        }}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Awards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">荣誉奖项</CardTitle>
          <Button size="sm" onClick={addAward}>
            <Plus size={16} className="mr-1" />
            添加奖项
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.awards.map((award) => (
            <div key={award.id} className="border rounded-lg p-4 space-y-3 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeAward(award.id)}
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>奖项名称</Label>
                  <Input
                    value={award.title}
                    onChange={(e) => updateAward(award.id, 'title', e.target.value)}
                    placeholder="优秀员工奖"
                  />
                </div>
                <div className="space-y-2">
                  <Label>颁发机构</Label>
                  <Input
                    value={award.organization}
                    onChange={(e) => updateAward(award.id, 'organization', e.target.value)}
                    placeholder="ABC 公司"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>获奖日期</Label>
                <Input
                  type="month"
                  value={award.date}
                  onChange={(e) => updateAward(award.id, 'date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={award.description}
                  onChange={(e) => updateAward(award.id, 'description', e.target.value)}
                  placeholder="简要描述这个奖项..."
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">语言能力</CardTitle>
          <Button size="sm" onClick={addLanguage}>
            <Plus size={16} className="mr-1" />
            添加语言
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.languages.map((lang) => (
            <div key={lang.id} className="border rounded-lg p-4 space-y-3 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeLanguage(lang.id)}
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>语言</Label>
                  <Input
                    value={lang.name}
                    onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                    placeholder="英语"
                  />
                </div>
                <div className="space-y-2">
                  <Label>熟练程度</Label>
                  <Input
                    value={lang.level}
                    onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)}
                    placeholder="母语 / 流利 / 中等"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeForm;
