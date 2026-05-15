import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import type { ResumeData } from '@/types/resume';

interface ResumeFormProps {
  data: ResumeData;
  setData: React.Dispatch<React.SetStateAction<ResumeData>>;
  onOptimize?: () => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ data, setData, onOptimize }) => {
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
    <div className="space-y-3">
      {/* ── 个人信息 ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="border-l-[3px] border-blue-500 pl-3 py-3 pr-4 bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-700">个人信息</h3>
        </div>
        <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">姓名 *</Label>
            <Input
              value={data.personalInfo.name}
              onChange={(e) => updatePersonalInfo('name', e.target.value)}
              placeholder="张三"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">职位</Label>
            <Input
              value={data.personalInfo.title}
              onChange={(e) => updatePersonalInfo('title', e.target.value)}
              placeholder="前端工程师"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">邮箱</Label>
            <Input
              type="email"
              value={data.personalInfo.email}
              onChange={(e) => updatePersonalInfo('email', e.target.value)}
              placeholder="example@mail.com"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">电话</Label>
            <Input
              value={data.personalInfo.phone}
              onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              placeholder="138-xxxx-xxxx"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">所在地</Label>
            <Input
              value={data.personalInfo.location}
              onChange={(e) => updatePersonalInfo('location', e.target.value)}
              placeholder="北京市"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">GitHub</Label>
            <Input
              value={data.personalInfo.github}
              onChange={(e) => updatePersonalInfo('github', e.target.value)}
              placeholder="github.com/you"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">LinkedIn</Label>
            <Input
              value={data.personalInfo.linkedin}
              onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
              placeholder="linkedin.com/in/you"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">网站</Label>
            <Input
              value={data.personalInfo.website}
              onChange={(e) => updatePersonalInfo('website', e.target.value)}
              placeholder="yoursite.com"
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <Label className="text-xs text-slate-500">个人简介</Label>
          <Textarea
            value={data.personalInfo.summary}
            onChange={(e) => updatePersonalInfo('summary', e.target.value)}
            placeholder="简要介绍你的专业背景、核心技能和职业目标..."
            rows={2}
            className="text-sm"
          />
        </div>
      </div>
      </div>

      {/* ── 工作/教育/项目/技能 ── */}
      <Tabs defaultValue="experience" className="w-full">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="border-l-[3px] border-indigo-500 pl-3 py-2.5 pr-4 bg-slate-50/50">
          <TabsList className="grid w-full grid-cols-4 h-8 bg-transparent gap-1">
          <TabsTrigger value="experience" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 text-slate-500">工作经验</TabsTrigger>
          <TabsTrigger value="education" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 text-slate-500">教育背景</TabsTrigger>
          <TabsTrigger value="projects" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 text-slate-500">项目经历</TabsTrigger>
          <TabsTrigger value="skills" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 text-slate-500">技能专长</TabsTrigger>
        </TabsList>
        </div>

        <div className="p-4">
        <TabsContent value="experience" className="mt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">工作经验</span>
              <Button size="sm" variant="outline" onClick={addWorkExperience} className="h-7 text-xs">
                <Plus size={12} className="mr-1" /> 添加
              </Button>
            </div>
            {data.workExperience.map((exp) => (
              <div key={exp.id} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">公司</Label>
                      <Input value={exp.company} onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)} placeholder="ABC 公司" className="h-7 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">职位</Label>
                      <Input value={exp.position} onChange={(e) => updateWorkExperience(exp.id, 'position', e.target.value)} placeholder="高级工程师" className="h-7 text-xs" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-5">
                    {onOptimize && exp.description && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={onOptimize} title="AI 优化">
                        <Sparkles size={12} />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeWorkExperience(exp.id)}>
                      <Trash2 size={12} className="text-red-400" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">开始</Label>
                    <Input type="month" value={exp.startDate} onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)} className="h-7 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">结束</Label>
                    <Input type="month" value={exp.endDate} onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)} disabled={exp.current} className="h-7 text-xs" />
                  </div>
                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      <input type="checkbox" checked={exp.current} onChange={(e) => updateWorkExperience(exp.id, 'current', e.target.checked)} className="w-3 h-3" /> 在职
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">工作描述</Label>
                  <Textarea value={exp.description} onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)} placeholder="描述职责和成就..." rows={2} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">成就</Label>
                  <div className="space-y-1">
                    {exp.achievements.map((achievement, idx) => (
                      <Input key={idx} value={achievement} onChange={(e) => { const newAchievements = [...exp.achievements]; newAchievements[idx] = e.target.value; updateWorkExperience(exp.id, 'achievements', newAchievements); }} placeholder="带领团队完成 XX 项目" className="h-6 text-xs" />
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { const newAchievements = [...exp.achievements, '']; updateWorkExperience(exp.id, 'achievements', newAchievements); }} className="h-6 text-xs mt-1">
                    <Plus size={10} className="mr-1" /> 添加
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="education" className="mt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">教育背景</span>
              <Button size="sm" variant="outline" onClick={addEducation} className="h-7 text-xs">
                <Plus size={12} className="mr-1" /> 添加
              </Button>
            </div>
            {data.education.map((edu) => (
              <div key={edu.id} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">学校</Label>
                      <Input value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} placeholder="北京大学" className="h-7 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">学位</Label>
                      <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="本科/硕士" className="h-7 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">专业</Label>
                      <Input value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} placeholder="计算机科学" className="h-7 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">GPA</Label>
                      <Input value={edu.gpa} onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)} placeholder="3.8/4.0" className="h-7 text-xs" />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 mt-5" onClick={() => removeEducation(edu.id)}>
                    <Trash2 size={12} className="text-red-400" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">开始</Label>
                    <Input type="month" value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} className="h-7 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">结束</Label>
                    <Input type="month" value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} className="h-7 text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">备注</Label>
                  <Textarea value={edu.description} onChange={(e) => updateEducation(edu.id, 'description', e.target.value)} placeholder="相关课程、荣誉等..." rows={1} className="text-xs" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">项目经历</span>
              <Button size="sm" variant="outline" onClick={addProject} className="h-7 text-xs">
                <Plus size={12} className="mr-1" /> 添加
              </Button>
            </div>
            {data.projects.map((project) => (
              <div key={project.id} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">项目名</Label>
                      <Input value={project.name} onChange={(e) => updateProject(project.id, 'name', e.target.value)} placeholder="电商平台" className="h-7 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">角色</Label>
                      <Input value={project.role} onChange={(e) => updateProject(project.id, 'role', e.target.value)} placeholder="前端负责人" className="h-7 text-xs" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-5">
                    {onOptimize && project.description && (
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={onOptimize} title="AI 优化">
                        <Sparkles size={12} />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeProject(project.id)}>
                      <Trash2 size={12} className="text-red-400" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">开始</Label>
                    <Input type="month" value={project.startDate} onChange={(e) => updateProject(project.id, 'startDate', e.target.value)} className="h-7 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">结束</Label>
                    <Input type="month" value={project.endDate} onChange={(e) => updateProject(project.id, 'endDate', e.target.value)} disabled={project.current} className="h-7 text-xs" />
                  </div>
                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      <input type="checkbox" checked={project.current} onChange={(e) => updateProject(project.id, 'current', e.target.checked)} className="w-3 h-3" /> 进行中
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">描述</Label>
                  <Textarea value={project.description} onChange={(e) => updateProject(project.id, 'description', e.target.value)} placeholder="项目背景、目标、负责工作..." rows={2} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">技术栈</Label>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, idx) => (
                      <Input key={idx} value={tech} onChange={(e) => { const newTechs = [...project.technologies]; newTechs[idx] = e.target.value; updateProject(project.id, 'technologies', newTechs); }} placeholder="React" className="w-20 h-6 text-xs" />
                    ))}
                    <Button variant="outline" size="sm" onClick={() => { const newTechs = [...project.technologies, '']; updateProject(project.id, 'technologies', newTechs); }} className="h-6 w-6 p-0">
                      <Plus size={10} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">链接</Label>
                  <Input value={project.link} onChange={(e) => updateProject(project.id, 'link', e.target.value)} placeholder="github.com/yourname/project" className="h-7 text-xs" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">技能专长</span>
              <Button size="sm" variant="outline" onClick={addSkill} className="h-7 text-xs">
                <Plus size={12} className="mr-1" /> 添加
              </Button>
            </div>
            {data.skills.map((skillGroup) => (
              <div key={skillGroup.id} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs text-slate-500">分类</Label>
                    <Input value={skillGroup.category} onChange={(e) => updateSkill(skillGroup.id, 'category', e.target.value)} placeholder="编程语言/框架/工具" className="h-7 text-xs" />
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 mt-5" onClick={() => removeSkill(skillGroup.id)}>
                    <Trash2 size={12} className="text-red-400" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">技能</Label>
                  <div className="flex flex-wrap gap-1">
                    {skillGroup.items.map((skill, idx) => (
                      <Input key={idx} value={skill} onChange={(e) => { const newItems = [...skillGroup.items]; newItems[idx] = e.target.value; updateSkill(skillGroup.id, 'items', newItems); }} placeholder="JavaScript" className="w-24 h-6 text-xs" />
                    ))}
                    <Button variant="outline" size="sm" onClick={() => { const newItems = [...skillGroup.items, '']; updateSkill(skillGroup.id, 'items', newItems); }} className="h-6 w-6 p-0">
                      <Plus size={10} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        </div>
      </div>
      </Tabs>

      {/* ── 荣誉奖项 ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="border-l-[3px] border-amber-500 pl-3 py-2.5 pr-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">荣誉奖项</span>
          <Button size="sm" variant="outline" onClick={addAward} className="h-7 text-xs">
            <Plus size={12} className="mr-1" /> 添加
          </Button>
          </div>
        </div>
        <div className="p-4">
        <div className="space-y-3">
          {data.awards.map((award) => (
            <div key={award.id} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">奖项</Label>
                    <Input value={award.title} onChange={(e) => updateAward(award.id, 'title', e.target.value)} placeholder="优秀员工奖" className="h-7 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">机构</Label>
                    <Input value={award.organization} onChange={(e) => updateAward(award.id, 'organization', e.target.value)} placeholder="ABC 公司" className="h-7 text-xs" />
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 mt-4" onClick={() => removeAward(award.id)}>
                  <Trash2 size={12} className="text-red-400" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">日期</Label>
                  <Input type="month" value={award.date} onChange={(e) => updateAward(award.id, 'date', e.target.value)} className="h-7 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">描述</Label>
                  <Input value={award.description} onChange={(e) => updateAward(award.id, 'description', e.target.value)} placeholder="简要描述..." className="h-7 text-xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* ── 语言能力 ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="border-l-[3px] border-emerald-500 pl-3 py-2.5 pr-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">语言能力</span>
          <Button size="sm" variant="outline" onClick={addLanguage} className="h-7 text-xs">
            <Plus size={12} className="mr-1" /> 添加
          </Button>
          </div>
        </div>
        <div className="p-4">
        <div className="space-y-3">
          {data.languages.map((lang) => (
            <div key={lang.id} className="border border-slate-200 rounded-lg p-3 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">语言</Label>
                    <Input value={lang.name} onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)} placeholder="英语" className="h-7 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500">熟练度</Label>
                    <Input value={lang.level} onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)} placeholder="流利/中等" className="h-7 text-xs" />
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 mt-4" onClick={() => removeLanguage(lang.id)}>
                  <Trash2 size={12} className="text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeForm;
