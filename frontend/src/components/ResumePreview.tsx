import type { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  data: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white min-h-[1123px] w-[794px] mx-auto shadow-2xl box-border overflow-hidden font-['Noto_Sans_SC',_sans-serif]">
      {/* Header - 深色背景 */}
      <div className="bg-[#1e293b] px-10 pt-10 pb-8 -mx-4 -mt-4">
        <div className="flex">
          {/* 照片区域 */}
          <div className="w-[60px] h-[60px] border border-[#475569] mr-4 flex-shrink-0 flex items-center justify-center">
            <span className="text-[#94a3b8] text-[10px] text-center">Photo</span>
          </div>

          {/* 姓名和职位 */}
          <div className="flex-1">
            {personalInfo.name && (
              <h1 className="text-[20px] font-bold text-white mb-1">{personalInfo.name}</h1>
            )}
            {personalInfo.title && (
              <p className="text-[11px] text-[#93c5fd]">{personalInfo.title}</p>
            )}
          </div>
        </div>

        {/* 联系信息 */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-[8px] text-[#cbd5e1]">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.email && personalInfo.phone && <span className="text-[#64748b]">|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {(personalInfo.email || personalInfo.phone) && personalInfo.location && <span className="text-[#64748b]">|</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {(personalInfo.email || personalInfo.phone || personalInfo.location) && personalInfo.github && <span className="text-[#64748b]">|</span>}
          {personalInfo.github && <span>{personalInfo.github}</span>}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-10 py-6 space-y-5">
        {/* 个人简介 */}
        {personalInfo.summary && (
          <div>
            <h2 className="text-[12px] font-bold text-[#1e293b] border-b border-[#334155] pb-1 mb-3">Summary</h2>
            <p className="text-[9px] text-[#374151] leading-relaxed">{personalInfo.summary}</p>
          </div>
        )}

        {/* 工作经验 */}
        {workExperience.length > 0 && (
          <div>
            <h2 className="text-[12px] font-bold text-[#1e293b] border-b border-[#334155] pb-1 mb-3">Experience</h2>
            <div className="space-y-3">
              {workExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-[10px] font-bold text-[#1e2937]">{exp.position}</h3>
                      <p className="text-[9px] text-[#2563eb]">{exp.company}</p>
                    </div>
                    <span className="text-[8px] text-[#6b7280]">
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-[9px] text-[#374151] mt-1 leading-normal">{exp.description}</p>
                  )}
                  {exp.achievements.length > 0 && (
                    <ul className="mt-1">
                      {exp.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-[9px] text-[#374151] pl-2">- {achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 项目经历 */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-[12px] font-bold text-[#1e293b] border-b border-[#334155] pb-1 mb-3">Projects</h2>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-[10px] font-bold text-[#1e2937]">{project.name}</h3>
                      {project.role && <p className="text-[9px] text-[#2563eb]">{project.role}</p>}
                    </div>
                    <span className="text-[8px] text-[#6b7280]">
                      {formatDate(project.startDate)} - {project.current ? 'Present' : formatDate(project.endDate)}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-[9px] text-[#374151] mt-1 leading-normal">{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className="text-[7px] text-[#1e40af]">[{tech}]</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 教育背景 */}
        {education.length > 0 && (
          <div>
            <h2 className="text-[12px] font-bold text-[#1e293b] border-b border-[#334155] pb-1 mb-3">Education</h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[10px] font-bold text-[#1e2937]">{edu.school}</h3>
                      <p className="text-[9px] text-[#2563eb]">{edu.degree}{edu.field ? ` | ${edu.field}` : ''}</p>
                    </div>
                    <span className="text-[8px] text-[#6b7280]">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 专业技能 */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-[12px] font-bold text-[#1e293b] border-b border-[#334155] pb-1 mb-3">Skills</h2>
            <div className="space-y-2">
              {skills.map((skillGroup) => (
                <div key={skillGroup.id}>
                  <span className="text-[9px] font-bold text-[#4b5563]">{skillGroup.category}:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {skillGroup.items.map((skill, idx) => (
                      <span key={idx} className="text-[8px] text-[#334155] border border-[#cbd5e1] px-1.5 py-0.5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 荣誉奖项 */}
        {awards.length > 0 && (
          <div>
            <h2 className="text-[12px] font-bold text-[#1e293b] border-b border-[#334155] pb-1 mb-3">Awards</h2>
            <div className="space-y-2">
              {awards.map((award) => (
                <div key={award.id}>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-[#1e2937]">{award.title}</span>
                    <span className="text-[8px] text-[#6b7280]">{award.date}</span>
                  </div>
                  <span className="text-[9px] text-[#2563eb]">{award.organization}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 语言能力 */}
        {languages.length > 0 && (
          <div>
            <h2 className="text-[12px] font-bold text-[#1e293b] border-b border-[#334155] pb-1 mb-3">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {languages.filter(l => l.name && l.level).map((lang) => (
                <span key={lang.id} className="text-[8px] text-[#334155] border border-[#cbd5e1] px-2 py-1">
                  {lang.name} - {lang.level}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
