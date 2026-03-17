import type { ResumeData } from '@/types/resume';
import { themes, defaultTheme } from '@/styles/resumeThemes';
import '@/styles/resume.css';

interface ResumePreviewProps {
  data: ResumeData;
  themeId?: number;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, themeId = 0 }) => {
  const theme = themes[themeId] || defaultTheme;
  const colors = theme.colors;
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  // 构建主题样式
  const themeStyles: React.CSSProperties = {
    '--resume-header': colors.header,
    '--resume-header-text': colors.headerText,
    '--resume-header-subtitle': colors.headerSubtitle,
    '--resume-header-contact': colors.headerContact,
    '--resume-header-sep': colors.headerContactSep,
    '--resume-border': colors.border,
    '--resume-text': colors.text,
    '--resume-title': colors.title,
    '--resume-subtitle': colors.subtitle,
    '--resume-date': colors.date,
    '--resume-category-title': colors.categoryTitle,
    '--resume-skill-border': colors.skillBorder,
    '--resume-tech-tag': colors.techTag,
    '--resume-photo-border': colors.photoBorder,
    '--resume-photo-text': colors.photoText,
    '--resume-accent': colors.accent,
  } as React.CSSProperties;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div
      className="w-[var(--resume-page-width)] min-h-[var(--resume-page-min-height)] bg-white mx-auto rounded-xl shadow-xl font-['Noto_Sans_SC',sans-serif] text-[10px] overflow-hidden"
      style={themeStyles}
    >
      {/* Header */}
      <div className="bg-[var(--resume-header)] px-8 py-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--resume-photo-text)] text-xs">Photo</span>
          </div>
          <div className="flex-1">
            <h1 className="text-[var(--resume-name)] font-bold text-[var(--resume-header-text)] tracking-wide">{personalInfo.name || 'Your Name'}</h1>
            <p className="text-[var(--resume-title-fz)] text-[var(--resume-header-subtitle)] mt-1 font-medium">{personalInfo.title || 'Professional Title'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-5 text-[var(--resume-contact)] text-[var(--resume-header-contact)]">
          {personalInfo.email && <span className="hover:text-white transition-colors">{personalInfo.email}</span>}
          {personalInfo.email && personalInfo.phone && <span className="text-[var(--resume-header-sep)]">•</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {(personalInfo.email || personalInfo.phone) && personalInfo.location && <span className="text-[var(--resume-header-sep)]">•</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {(personalInfo.email || personalInfo.phone || personalInfo.location) && personalInfo.github && <span className="text-[var(--resume-header-sep)]">•</span>}
          {personalInfo.github && <span className="text-[var(--resume-header-subtitle)]">{personalInfo.github}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-5">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-5">
            <h2 className="text-[var(--resume-sec-title)] font-bold text-[var(--resume-title)] border-b-2 border-[var(--resume-accent)] pb-2 mb-3">About Me</h2>
            <p className="text-[var(--resume-summary)] text-[var(--resume-text)] leading-relaxed">{personalInfo.summary}</p>
          </div>
        )}

        {/* Experience */}
        {workExperience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[var(--resume-sec-title)] font-bold text-[var(--resume-title)] border-b-2 border-[var(--resume-accent)] pb-2 mb-3">Experience</h2>
            {workExperience.map((exp) => (
              <div key={exp.id} className="mb-4 pl-4 border-l-2 border-[var(--resume-border-dark)]">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-[var(--resume-item-title)] font-bold text-[var(--resume-title)]">{exp.position}</h3>
                    <p className="text-[var(--resume-item-sub)] text-[var(--resume-subtitle)] font-medium">{exp.company}</p>
                  </div>
                  <span className="text-[var(--resume-item-date)] text-[var(--resume-date)] bg-[var(--resume-skill-bg)] px-2 py-0.5 rounded">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && <p className="text-[var(--resume-item-desc)] text-[var(--resume-text)] mt-2 leading-relaxed">{exp.description}</p>}
                {exp.achievements.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.achievements.map((a, i) => (
                      <li key={i} className="text-[var(--resume-item-desc)] text-[var(--resume-text-light)] pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-[var(--resume-accent)]">{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[var(--resume-sec-title)] font-bold text-[var(--resume-title)] border-b-2 border-[var(--resume-accent)] pb-2 mb-3">Projects</h2>
            {projects.map((p) => (
              <div key={p.id} className="mb-4 pl-4 border-l-2 border-[var(--resume-border-dark)]">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-[var(--resume-item-title)] font-bold text-[var(--resume-title)]">{p.name}</h3>
                    {p.role && <p className="text-[var(--resume-item-sub)] text-[var(--resume-subtitle)] font-medium">{p.role}</p>}
                  </div>
                  <span className="text-[var(--resume-item-date)] text-[var(--resume-date)] bg-[var(--resume-skill-bg)] px-2 py-0.5 rounded">
                    {formatDate(p.startDate)} - {p.current ? 'Present' : formatDate(p.endDate)}
                  </span>
                </div>
                {p.description && <p className="text-[var(--resume-item-desc)] text-[var(--resume-text)] mt-2 leading-relaxed">{p.description}</p>}
                {p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.technologies.map((t, i) => (
                      <span key={i} className="text-[var(--resume-tech-tag-fz)] text-[var(--resume-tech-tag)] bg-[var(--resume-tech-tag-bg)] px-2 py-0.5 rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[var(--resume-sec-title)] font-bold text-[var(--resume-title)] border-b-2 border-[var(--resume-accent)] pb-2 mb-3">Education</h2>
            {education.map((e) => (
              <div key={e.id} className="mb-3 pl-4 border-l-2 border-[var(--resume-border-dark)]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[var(--resume-item-title)] font-bold text-[var(--resume-title)]">{e.school}</h3>
                    <p className="text-[var(--resume-item-sub)] text-[var(--resume-subtitle)] font-medium">{e.degree}{e.field ? ` • ${e.field}` : ''}</p>
                  </div>
                  <span className="text-[var(--resume-item-date)] text-[var(--resume-date)]">{formatDate(e.startDate)} - {formatDate(e.endDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[var(--resume-sec-title)] font-bold text-[var(--resume-title)] border-b-2 border-[var(--resume-accent)] pb-2 mb-3">Skills</h2>
            <div className="space-y-2">
              {skills.map((s) => (
                <div key={s.id} className="flex items-start gap-2">
                  <span className="text-[var(--resume-skill-cat)] font-bold text-[var(--resume-category-title)] min-w-[80px]">{s.category}:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {s.items.map((item, i) => (
                      <span key={i} className="text-[var(--resume-skill-item)] text-[var(--resume-title)] bg-[var(--resume-skill-bg)] border border-[var(--resume-skill-border)] px-2 py-0.5 rounded">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[var(--resume-sec-title)] font-bold text-[var(--resume-title)] border-b-2 border-[var(--resume-accent)] pb-2 mb-3">Awards</h2>
            {awards.map((a) => (
              <div key={a.id} className="mb-2 flex justify-between items-center pl-4 border-l-2 border-[var(--resume-border-dark)]">
                <div>
                  <span className="text-[var(--resume-item-title)] font-bold text-[var(--resume-title)]">{a.title}</span>
                  <span className="text-[var(--resume-item-sub)] text-[var(--resume-subtitle)] ml-2">• {a.organization}</span>
                </div>
                <span className="text-[var(--resume-item-date)] text-[var(--resume-date)]">{a.date}</span>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="mb-5">
            <h2 className="text-[var(--resume-sec-title)] font-bold text-[var(--resume-title)] border-b-2 border-[var(--resume-accent)] pb-2 mb-3">Languages</h2>
            <div className="flex flex-wrap gap-3 pl-4">
              {languages.filter(l => l.name && l.level).map((l) => (
                <span key={l.id} className="text-[var(--resume-skill-item)] text-[var(--resume-title)] bg-[var(--resume-skill-bg)] border border-[var(--resume-skill-border)] px-3 py-1 rounded-lg flex items-center gap-2">
                  <span className="font-bold">{l.name}</span>
                  <span className="text-[var(--resume-text-light)]">-</span>
                  <span>{l.level}</span>
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
