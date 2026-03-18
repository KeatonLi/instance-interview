import type { ResumeData } from '@/types/resume';
import type { ThemeConfig } from './themeTypes';

interface TemplateProps {
  data: ResumeData;
  theme: ThemeConfig;
}

// 现代简约模板 - 居中头部，无边框设计
export const MinimalistTemplate: React.FC<TemplateProps> = ({ data, theme }) => {
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div
      className="w-[540px] min-h-[766px] bg-white mx-auto rounded-xl shadow-xl overflow-hidden"
      style={{ fontFamily: 'Inter, Noto Sans SC, sans-serif' }}
    >
      {/* Header - 居中设计 */}
      <div
        className="px-8 py-8 text-center"
        style={{
          background: theme.colors.header,
        }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: 'rgba(0,0,0,0.05)',
            border: `2px solid ${theme.colors.photoBorder}`,
          }}
        >
          <span style={{ color: theme.colors.photoText, fontSize: '10px' }}>Photo</span>
        </div>
        <h1
          className="font-bold"
          style={{
            fontSize: '26px',
            color: theme.colors.headerText,
            letterSpacing: '0.05em',
          }}
        >
          {personalInfo.name || 'Your Name'}
        </h1>
        <p
          className="font-medium mt-2"
          style={{
            fontSize: '14px',
            color: theme.colors.headerSubtitle,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {personalInfo.title || 'Professional Title'}
        </p>
        <div
          className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4"
          style={{
            fontSize: '10px',
            color: theme.colors.headerContact,
          }}
        >
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.email && personalInfo.phone && <span style={{ color: theme.colors.headerContactSep }}>|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {(personalInfo.email || personalInfo.phone) && personalInfo.location && <span style={{ color: theme.colors.headerContactSep }}>|</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {(personalInfo.github || personalInfo.linkedin || personalInfo.website) && (
          <div
            className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2"
            style={{
              fontSize: '10px',
              color: theme.colors.headerSubtitle,
            }}
          >
            {personalInfo.github && <span>{personalInfo.github}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.website && <span>{personalInfo.website}</span>}
          </div>
        )}
      </div>

      {/* Content - 无边框设计 */}
      <div className="px-8 py-6">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-6">
            <h2
              className="font-bold mb-3"
              style={{
                fontSize: '14px',
                color: theme.colors.title,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              About Me
            </h2>
            <p
              className="leading-relaxed"
              style={{
                fontSize: '10px',
                color: theme.colors.text,
                lineHeight: '1.8',
              }}
            >
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {workExperience.length > 0 && (
          <div className="mb-6">
            <h2
              className="font-bold mb-4"
              style={{
                fontSize: '14px',
                color: theme.colors.title,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Experience
            </h2>
            {workExperience.map((exp) => (
              <div key={exp.id} className="mb-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3
                      className="font-bold"
                      style={{
                        fontSize: '11px',
                        color: theme.colors.title,
                      }}
                    >
                      {exp.position}
                    </h3>
                    <p
                      className="font-medium"
                      style={{
                        fontSize: '10px',
                        color: theme.colors.subtitle,
                      }}
                    >
                      {exp.company}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      color: theme.colors.date,
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p
                    className="leading-relaxed"
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
                          •
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
          <div className="mb-6">
            <h2
              className="font-bold mb-4"
              style={{
                fontSize: '14px',
                color: theme.colors.title,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Projects
            </h2>
            {projects.map((p) => (
              <div key={p.id} className="mb-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3
                      className="font-bold"
                      style={{
                        fontSize: '11px',
                        color: theme.colors.title,
                      }}
                    >
                      {p.name}
                    </h3>
                    {p.role && (
                      <p
                        className="font-medium"
                        style={{
                          fontSize: '10px',
                          color: theme.colors.subtitle,
                        }}
                      >
                        {p.role}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      color: theme.colors.date,
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(p.startDate)} — {p.current ? 'Present' : formatDate(p.endDate)}
                  </span>
                </div>
                {p.description && (
                  <p
                    className="leading-relaxed"
                    style={{
                      fontSize: '9px',
                      color: theme.colors.text,
                    }}
                  >
                    {p.description}
                  </p>
                )}
                {p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {p.technologies.map((t, i) => (
                      <span
                        key={i}
                        className="font-medium"
                        style={{
                          fontSize: '8px',
                          color: theme.colors.techTag,
                        }}
                      >
                        #{t}
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
          <div className="mb-6">
            <h2
              className="font-bold mb-4"
              style={{
                fontSize: '14px',
                color: theme.colors.title,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Education
            </h2>
            {education.map((e) => (
              <div key={e.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className="font-bold"
                      style={{
                        fontSize: '11px',
                        color: theme.colors.title,
                      }}
                    >
                      {e.school}
                    </h3>
                    <p
                      style={{
                        fontSize: '10px',
                        color: theme.colors.subtitle,
                      }}
                    >
                      {e.degree}
                      {e.field ? ` • ${e.field}` : ''}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      color: theme.colors.date,
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(e.startDate)} — {formatDate(e.endDate)}
                  </span>
                </div>
                {e.gpa && (
                  <p
                    className="mt-1"
                    style={{
                      fontSize: '9px',
                      color: theme.colors.text,
                    }}
                  >
                    GPA: {e.gpa}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2
              className="font-bold mb-4"
              style={{
                fontSize: '14px',
                color: theme.colors.title,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Skills
            </h2>
            <div className="space-y-3">
              {skills.map((s) => (
                <div key={s.id} className="flex items-start gap-3">
                  <span
                    className="font-bold flex-shrink-0"
                    style={{
                      fontSize: '10px',
                      color: theme.colors.categoryTitle,
                      minWidth: '60px',
                    }}
                  >
                    {s.category}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {s.items.map((item, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '9px',
                          color: theme.colors.title,
                        }}
                      >
                        {item}
                        {i < s.items.length - 1 && (
                          <span style={{ color: theme.colors.date }}> / </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards & Languages */}
        <div className="grid grid-cols-2 gap-6">
          {awards.length > 0 && (
            <div>
              <h2
                className="font-bold mb-3"
                style={{
                  fontSize: '12px',
                  color: theme.colors.title,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Awards
              </h2>
              {awards.map((a) => (
                <div key={a.id} className="mb-2">
                  <span
                    className="font-bold"
                    style={{
                      fontSize: '9px',
                      color: theme.colors.title,
                    }}
                  >
                    {a.title}
                  </span>
                  <p
                    style={{
                      fontSize: '8px',
                      color: theme.colors.subtitle,
                    }}
                  >
                    {a.organization} • {a.date}
                  </p>
                </div>
              ))}
            </div>
          )}

          {languages.length > 0 && (
            <div>
              <h2
                className="font-bold mb-3"
                style={{
                  fontSize: '12px',
                  color: theme.colors.title,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Languages
              </h2>
              {languages.filter((l) => l.name && l.level).map((l) => (
                <div key={l.id} className="flex justify-between mb-1">
                  <span
                    style={{
                      fontSize: '9px',
                      color: theme.colors.title,
                    }}
                  >
                    {l.name}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      color: theme.colors.subtitle,
                    }}
                  >
                    {l.level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
