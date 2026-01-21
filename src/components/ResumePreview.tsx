import type { ResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Linkedin, Github, Globe, Calendar, Award, Languages, Briefcase, GraduationCap, FolderOpen, Star } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' });
  };

  return (
    <div className="bg-white min-h-[1123px] w-[794px] mx-auto shadow-2xl box-border overflow-hidden">
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-10 pt-10 pb-8">
        <div className="flex gap-6">
          {/* Photo Placeholder */}
          <div className="w-28 h-28 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-white/30">
            <span className="text-white/50 text-xs text-center px-2">照片</span>
          </div>

          {/* Name and Title */}
          <div className="flex-1">
            {personalInfo.name && (
              <h1 className="text-4xl font-bold mb-2 tracking-tight">{personalInfo.name}</h1>
            )}
            {personalInfo.title && (
              <p className="text-lg text-blue-200 font-medium">{personalInfo.title}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-blue-300" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-blue-300" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-blue-300" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin size={14} className="text-blue-300" />
              <span className="text-blue-200">{personalInfo.linkedin}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-2">
              <Github size={14} className="text-blue-300" />
              <span className="text-blue-200">{personalInfo.github}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-blue-300" />
              <span className="text-blue-200">{personalInfo.website}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-10 py-8 space-y-6">
        {/* Summary */}
        {personalInfo.summary && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star size={16} className="text-blue-600" />
              个人简介
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm">{personalInfo.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600" />
              工作经验
            </h2>
            <div className="space-y-5">
              {workExperience.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-blue-100">
                  <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5" />
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-gray-800">{exp.position}</h3>
                      <p className="text-blue-600 font-semibold text-sm">{exp.company}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      <Calendar size={11} />
                      <span>
                        {formatDate(exp.startDate)} - {exp.current ? '至今' : formatDate(exp.endDate)}
                      </span>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 text-sm mt-2 leading-relaxed">{exp.description}</p>
                  )}
                  {exp.achievements.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {exp.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-gray-700 text-sm flex items-start leading-relaxed">
                          <span className="text-blue-500 mr-2 mt-0.5">▪</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FolderOpen size={16} className="text-blue-600" />
              项目经历
            </h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="relative pl-4 border-l-2 border-blue-100">
                  <div className="absolute w-2 h-2 bg-blue-400 rounded-full -left-[5px] top-1.5" />
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-gray-800">{project.name}</h3>
                      {project.role && <p className="text-blue-600 text-sm">{project.role}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      <Calendar size={11} />
                      <span>
                        {formatDate(project.startDate)} - {project.current ? '至今' : formatDate(project.endDate)}
                      </span>
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-gray-700 text-sm mt-2 leading-relaxed">{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.technologies.map((tech, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-100">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.link && (
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                      <Globe size={11} />
                      {project.link}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap size={16} className="text-blue-600" />
              教育背景
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-4 border-l-2 border-blue-100">
                  <div className="absolute w-2 h-2 bg-blue-300 rounded-full -left-[5px] top-1.5" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{edu.school}</h3>
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">{edu.degree}</span>
                        {edu.field && <span className="text-gray-500"> · {edu.field}</span>}
                      </p>
                      {edu.gpa && (
                        <p className="text-xs text-gray-500 mt-1">GPA: {edu.gpa}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      <Calendar size={11} />
                      <span>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                    </div>
                  </div>
                  {edu.description && (
                    <p className="text-gray-700 text-sm mt-2 leading-relaxed">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Star size={16} className="text-blue-600" />
              专业技能
            </h2>
            <div className="space-y-3">
              {skills.map((skillGroup) => (
                <div key={skillGroup.id}>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{skillGroup.category}</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillGroup.items.map((skill, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-sm font-medium border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award size={16} className="text-blue-600" />
              荣誉奖项
            </h2>
            <div className="space-y-3">
              {awards.map((award) => (
                <div key={award.id} className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-transparent p-3 rounded-lg border border-amber-100">
                  <Award size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-gray-800">{award.title}</span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border">{award.date}</span>
                    </div>
                    <span className="text-sm text-gray-600">{award.organization}</span>
                    {award.description && (
                      <p className="text-sm text-gray-700 mt-1.5">{award.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Languages size={16} className="text-blue-600" />
              语言能力
            </h2>
            <div className="flex flex-wrap gap-3">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <Languages size={14} className="text-blue-500" />
                  <span className="text-gray-800 font-medium">{lang.name}</span>
                  <span className="text-gray-500 text-sm">· {lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
