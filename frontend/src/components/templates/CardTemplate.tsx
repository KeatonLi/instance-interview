import type { ResumeData } from '@/types/resume';
import type { ThemeConfig } from './themeTypes';

interface TemplateProps {
  data: ResumeData;
  theme: ThemeConfig;
}

// 模块卡片模板 - 卡片式布局
export const CardTemplate: React.FC<TemplateProps> = ({ data, theme }) => {
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div
      className="w-[540px] min-h-[766px] bg-gray-50 mx-auto rounded-xl shadow-xl overflow-hidden"
      style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
    >
      {/* Header */}
      <div
        className="px-6 py-5"
        style={{
          background: theme.colors.header,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <span style={{ color: theme.colors.photoText, fontSize: '9px' }}>Photo</span>
          </div>
          <div className="flex-1">
            <h1
              className="font-bold"
              style={{
                fontSize: '22px',
                color: theme.colors.headerText,
              }}
            >
              {personalInfo.name || 'Your Name'}
            </h1>
            <p
              className="font-medium mt-0.5"
              style={{
                fontSize: '11px',
                color: theme.colors.headerSubtitle,
              }}
            >
              {personalInfo.title || 'Professional Title'}
            </p>
          </div>
        </div>
        <div
          className="flex flex-wrap gap-x-3 gap-y-1 mt-4"
          style={{
            fontSize: '8px',
            color: theme.colors.headerContact,
          }}
        >
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.github && <span style={{ color: theme.colors.headerSubtitle }}>{personalInfo.github}</span>}
        </div>
      </div>

      {/* Content - 卡片式设计 */}
      <div className="p-4 space-y-3">
        {/* Summary */}
        {personalInfo.summary && (
          <div
            className="rounded-lg p-4"
            style={{
              background: theme.colors.cardBg || '#ffffff',
              border: `1px solid ${theme.colors.cardBorder || '#e2e8f0'}`,
            }}
          >
            <h2
              className="font-bold mb-2"
              style={{
                fontSize: '12px',
                color: theme.colors.title,
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
          <div
            className="rounded-lg p-4"
            style={{
              background: theme.colors.cardBg || '#ffffff',
              border: `1px solid ${theme.colors.cardBorder || '#e2e8f0'}`,
            }}
          >
            <h2
              className="font-bold mb-3"
              style={{
                fontSize: '12px',
                color: theme.colors.title,
              }}
            >
              Experience
            </h2>
            <div className="space-y-3">
              {workExperience.map((exp) => (
                <div key={exp.id}>
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
                        style={{
                          fontSize: '9px',
                          color: theme.colors.subtitle,
                        }}
                      >
                        {exp.company}
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[7px]"
                      style={{
                        color: theme.colors.date,
                        background: '#f1f5f9',
                      }}
                    >
                      {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <p
                      className="mt-1 text-[8px]"
                      style={{
                        color: theme.colors.text,
                      }}
                    >
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {exp.achievements.slice(0, 2).map((a, i) => (
                        <li
                          key={i}
                          className="pl-2 relative text-[8px]"
                          style={{ color: theme.colors.text }}
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
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div
            className="rounded-lg p-4"
            style={{
              background: theme.colors.cardBg || '#ffffff',
              border: `1px solid ${theme.colors.cardBorder || '#e2e8f0'}`,
            }}
          >
            <h2
              className="font-bold mb-3"
              style={{
                fontSize: '12px',
                color: theme.colors.title,
              }}
            >
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className="font-bold"
                      style={{
                        fontSize: '10px',
                        color: theme.colors.title,
                      }}
                    >
                      {p.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '7px',
                        color: theme.colors.date,
                      }}
                    >
                      {formatDate(p.startDate)} - {p.current ? 'Present' : formatDate(p.endDate)}
                    </span>
                  </div>
                  {p.role && (
                    <p
                      style={{
                        fontSize: '8px',
                        color: theme.colors.subtitle,
                      }}
                    >
                      {p.role}
                    </p>
                  )}
                  {p.description && (
                    <p
                      className="mt-1 text-[8px]"
                      style={{
                        color: theme.colors.text,
                      }}
                    >
                      {p.description}
                    </p>
                  )}
                  {p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[6px]"
                          style={{
                            color: theme.colors.techTag,
                            background: '#f1f5f9',
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
          </div>
        )}

        {/* Education & Skills 2列 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Education */}
          {education.length > 0 && (
            <div
              className="rounded-lg p-3"
              style={{
                background: theme.colors.cardBg || '#ffffff',
                border: `1px solid ${theme.colors.cardBorder || '#e2e8f0'}`,
              }}
            >
              <h2
                className="font-bold mb-2"
                style={{
                  fontSize: '11px',
                  color: theme.colors.title,
                }}
              >
                Education
              </h2>
              <div className="space-y-2">
                {education.map((e) => (
                  <div key={e.id}>
                    <h3
                      className="font-bold"
                      style={{
                        fontSize: '9px',
                        color: theme.colors.title,
                      }}
                    >
                      {e.school}
                    </h3>
                    <p
                      style={{
                        fontSize: '8px',
                        color: theme.colors.subtitle,
                      }}
                    >
                      {e.degree}
                      {e.field ? ` - ${e.field}` : ''}
                    </p>
                    <span
                      style={{
                        fontSize: '7px',
                        color: theme.colors.date,
                      }}
                    >
                      {formatDate(e.startDate)} - {formatDate(e.endDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div
              className="rounded-lg p-3"
              style={{
                background: theme.colors.cardBg || '#ffffff',
                border: `1px solid ${theme.colors.cardBorder || '#e2e8f0'}`,
              }}
            >
              <h2
                className="font-bold mb-2"
                style={{
                  fontSize: '11px',
                  color: theme.colors.title,
                }}
              >
                Skills
              </h2>
              <div className="space-y-1.5">
                {skills.map((s) => (
                  <div key={s.id}>
                    <span
                      className="font-bold"
                      style={{
                        fontSize: '8px',
                        color: theme.colors.categoryTitle,
                      }}
                    >
                      {s.category}:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {s.items.map((item, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[6px]"
                          style={{
                            color: theme.colors.title,
                            background: '#f1f5f9',
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
        </div>

        {/* Awards & Languages 2列 */}
        <div className="grid grid-cols-2 gap-3">
          {/* Awards */}
          {awards.length > 0 && (
            <div
              className="rounded-lg p-3"
              style={{
                background: theme.colors.cardBg || '#ffffff',
                border: `1px solid ${theme.colors.cardBorder || '#e2e8f0'}`,
              }}
            >
              <h2
                className="font-bold mb-2"
                style={{
                  fontSize: '11px',
                  color: theme.colors.title,
                }}
              >
                Awards
              </h2>
              <div className="space-y-1">
                {awards.map((a) => (
                  <div key={a.id}>
                    <span
                      className="font-bold"
                      style={{
                        fontSize: '8px',
                        color: theme.colors.title,
                      }}
                    >
                      {a.title}
                    </span>
                    <p
                      style={{
                        fontSize: '7px',
                        color: theme.colors.subtitle,
                      }}
                    >
                      {a.organization} • {a.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div
              className="rounded-lg p-3"
              style={{
                background: theme.colors.cardBg || '#ffffff',
                border: `1px solid ${theme.colors.cardBorder || '#e2e8f0'}`,
              }}
            >
              <h2
                className="font-bold mb-2"
                style={{
                  fontSize: '11px',
                  color: theme.colors.title,
                }}
              >
                Languages
              </h2>
              <div className="space-y-1">
                {languages.filter((l) => l.name && l.level).map((l) => (
                  <div key={l.id} className="flex justify-between">
                    <span
                      style={{
                        fontSize: '8px',
                        color: theme.colors.title,
                      }}
                    >
                      {l.name}
                    </span>
                    <span
                      style={{
                        fontSize: '8px',
                        color: theme.colors.subtitle,
                      }}
                    >
                      {l.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
