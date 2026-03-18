import type { ResumeData } from '@/types/resume';
import type { ThemeConfig } from './themeTypes';

interface TemplateProps {
  data: ResumeData;
  theme: ThemeConfig;
}

// 左侧边栏模板 - 深色侧边栏布局
export const SidebarTemplate: React.FC<TemplateProps> = ({ data, theme }) => {
  const { personalInfo, education, workExperience, projects, skills, awards, languages } = data;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div
      className="w-[540px] min-h-[766px] bg-white mx-auto rounded-xl shadow-xl overflow-hidden flex"
      style={{ fontFamily: 'Noto Sans SC, sans-serif' }}
    >
      {/* 左侧边栏 */}
      <div
        className="w-[160px] flex-shrink-0 p-5"
        style={{
          background: theme.colors.sidebarBg || '#1e293b',
        }}
      >
        {/* 头像 */}
        <div
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: `2px solid ${theme.colors.photoBorder}`,
          }}
        >
          <span style={{ color: theme.colors.photoText, fontSize: '9px' }}>Photo</span>
        </div>

        {/* 姓名 */}
        <h1
          className="text-center font-bold mb-1"
          style={{
            fontSize: '16px',
            color: theme.colors.headerText,
          }}
        >
          {personalInfo.name || 'Your Name'}
        </h1>
        <p
          className="text-center font-medium mb-4"
          style={{
            fontSize: '9px',
            color: theme.colors.headerSubtitle,
          }}
        >
          {personalInfo.title || 'Title'}
        </p>

        {/* 联系方式 */}
        <div className="space-y-2 mb-6">
          {personalInfo.email && (
            <div className="text-center">
              <p
                style={{
                  fontSize: '7px',
                  color: theme.colors.headerContact,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Email
              </p>
              <p
                style={{
                  fontSize: '8px',
                  color: theme.colors.headerText,
                }}
              >
                {personalInfo.email}
              </p>
            </div>
          )}
          {personalInfo.phone && (
            <div className="text-center">
              <p
                style={{
                  fontSize: '7px',
                  color: theme.colors.headerContact,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Phone
              </p>
              <p
                style={{
                  fontSize: '8px',
                  color: theme.colors.headerText,
                }}
              >
                {personalInfo.phone}
              </p>
            </div>
          )}
          {personalInfo.location && (
            <div className="text-center">
              <p
                style={{
                  fontSize: '7px',
                  color: theme.colors.headerContact,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Location
              </p>
              <p
                style={{
                  fontSize: '8px',
                  color: theme.colors.headerText,
                }}
              >
                {personalInfo.location}
              </p>
            </div>
          )}
          {personalInfo.github && (
            <div className="text-center">
              <p
                style={{
                  fontSize: '7px',
                  color: theme.colors.headerContact,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                GitHub
              </p>
              <p
                style={{
                  fontSize: '8px',
                  color: theme.colors.headerSubtitle,
                }}
              >
                {personalInfo.github}
              </p>
            </div>
          )}
        </div>

        {/* 技能 */}
        {skills.length > 0 && (
          <div className="mb-5">
            <h3
              className="text-center font-bold mb-3"
              style={{
                fontSize: '10px',
                color: theme.colors.headerText,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Skills
            </h3>
            <div className="space-y-2">
              {skills.slice(0, 4).map((s) => (
                <div key={s.id}>
                  <p
                    className="font-medium mb-1"
                    style={{
                      fontSize: '8px',
                      color: theme.colors.headerSubtitle,
                    }}
                  >
                    {s.category}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {s.items.slice(0, 4).map((item, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[6px]"
                        style={{
                          color: theme.colors.sidebarBg || '#1e293b',
                          background: 'rgba(255,255,255,0.9)',
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

        {/* 语言 */}
        {languages.length > 0 && (
          <div>
            <h3
              className="text-center font-bold mb-2"
              style={{
                fontSize: '10px',
                color: theme.colors.headerText,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Languages
            </h3>
            {languages.filter((l) => l.name && l.level).map((l) => (
              <div
                key={l.id}
                className="flex justify-between mb-1"
                style={{
                  fontSize: '8px',
                }}
              >
                <span style={{ color: theme.colors.headerText }}>{l.name}</span>
                <span style={{ color: theme.colors.headerSubtitle }}>{l.level}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 右侧内容 */}
      <div className="flex-1 p-5">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-5">
            <h2
              className="font-bold mb-2"
              style={{
                fontSize: '14px',
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
          <div className="mb-5">
            <h2
              className="font-bold mb-3"
              style={{
                fontSize: '14px',
                color: theme.colors.title,
              }}
            >
              Experience
            </h2>
            {workExperience.map((exp) => (
              <div key={exp.id} className="mb-4">
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
                    style={{
                      fontSize: '8px',
                      color: theme.colors.date,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDate(exp.startDate)} - {exp.current ? 'Now' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p
                    className="mt-1 leading-relaxed"
                    style={{
                      fontSize: '8px',
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
                        className="pl-2 relative"
                        style={{
                          fontSize: '8px',
                          color: theme.colors.text,
                        }}
                      >
                        <span
                          className="absolute left-0"
                          style={{ color: theme.colors.accent }}
                        >
                          •
                        </span>
                        {a.length > 50 ? a.substring(0, 50) + '...' : a}
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
              className="font-bold mb-3"
              style={{
                fontSize: '14px',
                color: theme.colors.title,
              }}
            >
              Projects
            </h2>
            {projects.map((p) => (
              <div key={p.id} className="mb-3">
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
                      fontSize: '8px',
                      color: theme.colors.date,
                    }}
                  >
                    {formatDate(p.startDate)} - {p.current ? 'Now' : formatDate(p.endDate)}
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
                    className="mt-1 leading-relaxed"
                    style={{
                      fontSize: '8px',
                      color: theme.colors.text,
                    }}
                  >
                    {p.description.length > 80 ? p.description.substring(0, 80) + '...' : p.description}
                  </p>
                )}
                {p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.technologies.slice(0, 4).map((t, i) => (
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
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-5">
            <h2
              className="font-bold mb-3"
              style={{
                fontSize: '14px',
                color: theme.colors.title,
              }}
            >
              Education
            </h2>
            {education.map((e) => (
              <div key={e.id} className="mb-3">
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
                      style={{
                        fontSize: '9px',
                        color: theme.colors.subtitle,
                      }}
                    >
                      {e.degree}
                      {e.field ? ` - ${e.field}` : ''}
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

        {/* Awards */}
        {awards.length > 0 && (
          <div>
            <h2
              className="font-bold mb-3"
              style={{
                fontSize: '14px',
                color: theme.colors.title,
              }}
            >
              Awards
            </h2>
            {awards.map((a) => (
              <div key={a.id} className="mb-2 flex justify-between items-center">
                <div>
                  <span
                    className="font-bold"
                    style={{
                      fontSize: '9px',
                      color: theme.colors.title,
                    }}
                  >
                    {a.title}
                  </span>
                  <span
                    style={{
                      fontSize: '8px',
                      color: theme.colors.subtitle,
                      marginLeft: '4px',
                    }}
                  >
                    @ {a.organization}
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
      </div>
    </div>
  );
};
