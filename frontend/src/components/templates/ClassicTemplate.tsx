import type { ResumeData } from '@/types/resume';
import type { ThemeConfig } from './themeTypes';

interface TemplateProps {
  data: ResumeData;
  theme: ThemeConfig;
}

// 经典商务模板 - 标准顶部标题布局
export const ClassicTemplate: React.FC<TemplateProps> = ({ data, theme }) => {
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div
      className="w-[540px] min-h-[766px] bg-white mx-auto rounded-xl shadow-xl overflow-hidden"
      style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
    >
      {/* Header - 经典顶部标题 */}
      <div
        className="px-8 py-6"
        style={{
          background: theme.colors.header,
        }}
      >
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <span style={{ color: theme.colors.photoText, fontSize: '11px' }}>Photo</span>
          </div>
          <div className="flex-1">
            <h1
              className="font-bold tracking-wide"
              style={{
                fontSize: '24px',
                color: theme.colors.headerText,
              }}
            >
              {personalInfo.name || 'Your Name'}
            </h1>
            <p
              className="font-medium mt-1"
              style={{
                fontSize: '12px',
                color: theme.colors.headerSubtitle,
              }}
            >
              {personalInfo.title || 'Professional Title'}
            </p>
          </div>
        </div>
        <div
          className="flex flex-wrap gap-x-4 gap-y-1 mt-5"
          style={{
            fontSize: '9px',
            color: theme.colors.headerContact,
          }}
        >
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.email && personalInfo.phone && <span style={{ color: theme.colors.headerContactSep }}>•</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {(personalInfo.email || personalInfo.phone) && personalInfo.location && <span style={{ color: theme.colors.headerContactSep }}>•</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {(personalInfo.email || personalInfo.phone || personalInfo.location) && personalInfo.github && <span style={{ color: theme.colors.headerContactSep }}>•</span>}
          {personalInfo.github && <span style={{ color: theme.colors.headerSubtitle }}>{personalInfo.github}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-5">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-5">
            <h2
              className="font-bold pb-2 mb-3"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
                borderBottom: `2px solid ${theme.colors.accent}`,
              }}
            >
              About Me
            </h2>
            <p
              className="leading-relaxed"
              style={{
                fontSize: '9px',
                color: theme.colors.text,
              }}
            >
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {workExperience.length > 0 && (
          <div className="mb-5">
            <h2
              className="font-bold pb-2 mb-3"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
                borderBottom: `2px solid ${theme.colors.accent}`,
              }}
            >
              Experience
            </h2>
            {workExperience.map((exp) => (
              <div
                key={exp.id}
                className="mb-4 pl-4"
                style={{ borderLeft: `2px solid ${theme.colors.border}` }}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3
                      className="font-bold"
                      style={{
                        fontSize: '10px',
                        color: theme.colors.title,
                      }}
                    >
                      {exp.position}
                    </h3>
                    <p
                      className="font-medium"
                      style={{
                        fontSize: '9px',
                        color: theme.colors.subtitle,
                      }}
                    >
                      {exp.company}
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded"
                    style={{
                      fontSize: '8px',
                      color: theme.colors.date,
                      background: '#f8fafc',
                    }}
                  >
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p
                    className="mt-2 leading-relaxed"
                    style={{
                      fontSize: '9px',
                      color: theme.colors.text,
                    }}
                  >
                    {exp.description}
                  </p>
                )}
                {exp.achievements.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.achievements.map((a, i) => (
                      <li
                        key={i}
                        className="pl-3 relative"
                        style={{
                          fontSize: '9px',
                          color: theme.colors.text,
                        }}
                      >
                        <span
                          className="absolute left-0"
                          style={{ color: theme.colors.accent }}
                        >
                          ▸
                        </span>
                        {a}
                      </li>
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
            <h2
              className="font-bold pb-2 mb-3"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
                borderBottom: `2px solid ${theme.colors.accent}`,
              }}
            >
              Projects
            </h2>
            {projects.map((p) => (
              <div
                key={p.id}
                className="mb-4 pl-4"
                style={{ borderLeft: `2px solid ${theme.colors.border}` }}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3
                      className="font-bold"
                      style={{
                        fontSize: '10px',
                        color: theme.colors.title,
                      }}
                    >
                      {p.name}
                    </h3>
                    {p.role && (
                      <p
                        className="font-medium"
                        style={{
                          fontSize: '9px',
                          color: theme.colors.subtitle,
                        }}
                      >
                        {p.role}
                      </p>
                    )}
                  </div>
                  <span
                    className="px-2 py-0.5 rounded"
                    style={{
                      fontSize: '8px',
                      color: theme.colors.date,
                      background: '#f8fafc',
                    }}
                  >
                    {formatDate(p.startDate)} - {p.current ? 'Present' : formatDate(p.endDate)}
                  </span>
                </div>
                {p.description && (
                  <p
                    className="mt-2 leading-relaxed"
                    style={{
                      fontSize: '9px',
                      color: theme.colors.text,
                    }}
                  >
                    {p.description}
                  </p>
                )}
                {p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.technologies.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{
                          fontSize: '7px',
                          color: theme.colors.techTag,
                          background: '#eef2ff',
                        }}
                      >
                        {t}
                      </span>
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
            <h2
              className="font-bold pb-2 mb-3"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
                borderBottom: `2px solid ${theme.colors.accent}`,
              }}
            >
              Education
            </h2>
            {education.map((e) => (
              <div
                key={e.id}
                className="mb-3 pl-4"
                style={{ borderLeft: `2px solid ${theme.colors.border}` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className="font-bold"
                      style={{
                        fontSize: '10px',
                        color: theme.colors.title,
                      }}
                    >
                      {e.school}
                    </h3>
                    <p
                      className="font-medium"
                      style={{
                        fontSize: '9px',
                        color: theme.colors.subtitle,
                      }}
                    >
                      {e.degree}
                      {e.field ? ` • ${e.field}` : ''}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '8px',
                      color: theme.colors.date,
                    }}
                  >
                    {formatDate(e.startDate)} - {formatDate(e.endDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-5">
            <h2
              className="font-bold pb-2 mb-3"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
                borderBottom: `2px solid ${theme.colors.accent}`,
              }}
            >
              Skills
            </h2>
            <div className="space-y-2">
              {skills.map((s) => (
                <div key={s.id} className="flex items-start gap-2">
                  <span
                    className="font-bold flex-shrink-0"
                    style={{
                      fontSize: '9px',
                      color: theme.colors.categoryTitle,
                      minWidth: '80px',
                    }}
                  >
                    {s.category}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {s.items.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded"
                        style={{
                          fontSize: '8px',
                          color: theme.colors.title,
                          background: '#f8fafc',
                          border: `1px solid ${theme.colors.skillBorder}`,
                        }}
                      >
                        {item}
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
          <div className="mb-5">
            <h2
              className="font-bold pb-2 mb-3"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
                borderBottom: `2px solid ${theme.colors.accent}`,
              }}
            >
              Awards
            </h2>
            {awards.map((a) => (
              <div
                key={a.id}
                className="mb-2 flex justify-between items-center pl-4"
                style={{ borderLeft: `2px solid ${theme.colors.border}` }}
              >
                <div>
                  <span
                    className="font-bold"
                    style={{
                      fontSize: '10px',
                      color: theme.colors.title,
                    }}
                  >
                    {a.title}
                  </span>
                  <span
                    className="ml-2"
                    style={{
                      fontSize: '9px',
                      color: theme.colors.subtitle,
                    }}
                  >
                    • {a.organization}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '8px',
                    color: theme.colors.date,
                  }}
                >
                  {a.date}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="mb-5">
            <h2
              className="font-bold pb-2 mb-3"
              style={{
                fontSize: '13px',
                color: theme.colors.title,
                borderBottom: `2px solid ${theme.colors.accent}`,
              }}
            >
              Languages
            </h2>
            <div className="flex flex-wrap gap-3 pl-4">
              {languages.filter((l) => l.name && l.level).map((l) => (
                <span
                  key={l.id}
                  className="px-3 py-1 rounded-lg flex items-center gap-2"
                  style={{
                    fontSize: '8px',
                    color: theme.colors.title,
                    background: '#f8fafc',
                    border: `1px solid ${theme.colors.skillBorder}`,
                  }}
                >
                  <span className="font-bold">{l.name}</span>
                  <span style={{ color: theme.colors.text }}>-</span>
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
