import type { ResumeData } from '@/types/resume';
import { themes, defaultTheme, type LayoutType, classicTheme, minimalistTheme, gradientTheme, timelineTheme, sidebarTheme } from '@/styles/resumeThemes';
import '@/styles/resume.css';

interface ResumePreviewProps {
  data: ResumeData;
  themeId?: number;
  scale?: number;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, themeId = 0, scale = 1 }) => {
  const theme = themes[themeId] || defaultTheme;
  const layout = theme.layout as LayoutType;

  // 通用工具函数
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (layout) {
      case 'classic':
        return <ClassicLayout data={data} theme={theme} formatDate={formatDate} />;
      case 'minimalist':
        return <MinimalistLayout data={data} theme={theme} formatDate={formatDate} />;
      case 'gradient':
        return <GradientLayout data={data} theme={theme} formatDate={formatDate} />;
      case 'timeline':
        return <TimelineLayout data={data} theme={theme} formatDate={formatDate} />;
      case 'sidebar':
        return <SidebarLayout data={data} theme={theme} formatDate={formatDate} />;
      default:
        return <ClassicLayout data={data} theme={theme} formatDate={formatDate} />;
    }
  };

  // 如果有缩放，使用外层容器来应用变换
  if (scale !== 1) {
    return (
      <div
        className="flex items-start justify-center"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          className="origin-top"
          style={{
            transform: `scale(${scale})`,
            width: '540px',
            height: '766px',
            flexShrink: 0,
          }}
        >
          {renderContent()}
        </div>
      </div>
    );
  }

  return renderContent();
};

// ============ 模板1: 经典商务（传统双栏布局）============
const ClassicLayout: React.FC<{ data: ResumeData; theme: typeof classicTheme; formatDate: (s: string) => string }> = ({ data, theme, formatDate }) => {
  const c = theme.colors;
  const f = theme.fonts;

  return (
    <div className="w-[540px] min-h-[766px] bg-white mx-auto rounded-xl shadow-xl overflow-hidden font-sans">
      {/* 头部 */}
      <div style={{ background: c.header }} className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white/60 text-[10px]">Photo</span>
          </div>
          <div className="flex-1">
            <h1 className={`${f.size.name} ${f.name} text-white tracking-wide`}>{data.personalInfo.name || 'Your Name'}</h1>
            <p className={`${f.size.title} text-[${c.headerSubtitle}] mt-0.5`}>{data.personalInfo.title || 'Professional Title'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-4 text-[9px] text-white/70">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.email && data.personalInfo.phone && <span>•</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {(data.personalInfo.email || data.personalInfo.phone) && data.personalInfo.location && <span>•</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {(data.personalInfo.email || data.personalInfo.phone || data.personalInfo.location) && data.personalInfo.github && <span>•</span>}
          {data.personalInfo.github && <span className="text-blue-300">{data.personalInfo.github}</span>}
        </div>
      </div>

      {/* 内容 */}
      <div className="px-6 py-4">
        {data.personalInfo.summary && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b-2 border-[${c.accent}] pb-1 mb-2`}>About Me</h2>
            <p className={`${f.size.body} text-[${c.text}] leading-relaxed`}>{data.personalInfo.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b-2 border-[${c.accent}] pb-1 mb-2`}>Experience</h2>
            {data.workExperience.map(exp => (
              <div key={exp.id} className="mb-3 pl-3 border-l-2 border-[${c.border}]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{exp.position}</h3>
                    <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{exp.company}</p>
                  </div>
                  <span className={`${f.size.date} text-[${c.date}] bg-[${c.skillBg}] px-1.5 py-0.5 rounded`}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && <p className={`${f.size.body} text-[${c.text}] mt-1.5 leading-relaxed`}>{exp.description}</p>}
                {exp.achievements.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {exp.achievements.map((a, i) => (
                      <li key={i} className={`${f.size.body} text-[${c.textLight}] pl-2 relative`}>▸ {a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b-2 border-[${c.accent}] pb-1 mb-2`}>Projects</h2>
            {data.projects.map(p => (
              <div key={p.id} className="mb-3 pl-3 border-l-2 border-[${c.border}]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{p.name}</h3>
                    {p.role && <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{p.role}</p>}
                  </div>
                  <span className={`${f.size.date} text-[${c.date}] bg-[${c.skillBg}] px-1.5 py-0.5 rounded`}>
                    {formatDate(p.startDate)} - {p.current ? 'Present' : formatDate(p.endDate)}
                  </span>
                </div>
                {p.description && <p className={`${f.size.body} text-[${c.text}] mt-1.5 leading-relaxed`}>{p.description}</p>}
                {p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.technologies.map((t, i) => (
                      <span key={i} className={`${f.size.date} text-[${c.techTag}] bg-[${c.techTagBg}] px-1.5 py-0.5 rounded-full`}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b-2 border-[${c.accent}] pb-1 mb-2`}>Education</h2>
            {data.education.map(e => (
              <div key={e.id} className="mb-2 pl-3 border-l-2 border-[${c.border}]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{e.school}</h3>
                    <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{e.degree}{e.field ? ` • ${e.field}` : ''}</p>
                  </div>
                  <span className={`${f.size.date} text-[${c.date}]`}>{formatDate(e.startDate)} - {formatDate(e.endDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b-2 border-[${c.accent}] pb-1 mb-2`}>Skills</h2>
            <div className="space-y-1">
              {data.skills.map(s => (
                <div key={s.id} className="flex items-start gap-2">
                  <span className={`${f.size.itemSub} ${f.name} text-[${c.categoryTitle}] min-w-[60px]`}>{s.category}:</span>
                  <div className="flex flex-wrap gap-1">
                    {s.items.map((item, i) => (
                      <span key={i} className={`${f.size.date} text-[${c.title}] bg-[${c.skillBg}] border border-[${c.skillBorder}] px-1.5 py-0.5 rounded`}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.awards.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b-2 border-[${c.accent}] pb-1 mb-2`}>Awards</h2>
            {data.awards.map(a => (
              <div key={a.id} className="mb-1.5 flex justify-between items-center pl-3 border-l-2 border-[${c.border}]">
                <span className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{a.title}</span>
                <span className={`${f.size.date} text-[${c.date}]`}>{a.date}</span>
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b-2 border-[${c.accent}] pb-1 mb-2`}>Languages</h2>
            <div className="flex flex-wrap gap-2 pl-3">
              {data.languages.filter(l => l.name && l.level).map(l => (
                <span key={l.id} className={`${f.size.body} text-[${c.title}] bg-[${c.skillBg}] border border-[${c.skillBorder}] px-2 py-0.5 rounded-lg`}>
                  {l.name} - {l.level}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ 模板2: 现代简约（居中对齐）============
const MinimalistLayout: React.FC<{ data: ResumeData; theme: typeof minimalistTheme; formatDate: (s: string) => string }> = ({ data, theme, formatDate }) => {
  const c = theme.colors;
  const f = theme.fonts;

  return (
    <div className="w-[540px] min-h-[766px] bg-white mx-auto rounded-xl shadow-xl overflow-hidden font-sans">
      {/* 居中头部 */}
      <div className="px-6 py-6 text-center border-b border-[${c.border}]">
        <h1 className={`${f.size.name} ${f.name} text-[${c.headerText}] tracking-wider`}>{data.personalInfo.name || 'Your Name'}</h1>
        <p className={`${f.size.title} text-[${c.headerSubtitle}] mt-1`}>{data.personalInfo.title || 'Professional Title'}</p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-3 text-[9px] text-[${c.headerContact}]">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.email && data.personalInfo.phone && <span className="text-[${c.headerContactSep}]">/</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <><span className="text-[${c.headerContactSep}]">/</span><span>{data.personalInfo.location}</span></>}
          {data.personalInfo.github && <><span className="text-[${c.headerContactSep}]">/</span><span className="text-[${c.subtitle}]">{data.personalInfo.github}</span></>}
        </div>
      </div>

      {/* 内容 */}
      <div className="px-6 py-4">
        {data.personalInfo.summary && (
          <div className="mb-4 text-center">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] uppercase tracking-widest mb-2`}>About Me</h2>
            <p className={`${f.size.body} text-[${c.text}] leading-relaxed max-w-md mx-auto`}>{data.personalInfo.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] uppercase tracking-widest mb-3`}>Experience</h2>
            {data.workExperience.map(exp => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{exp.position}</h3>
                    <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{exp.company}</p>
                  </div>
                  <span className={`${f.size.date} text-[${c.date}]`}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && <p className={`${f.size.body} text-[${c.text}] mt-1 leading-relaxed`}>{exp.description}</p>}
                {exp.achievements.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {exp.achievements.map((a, i) => (
                      <li key={i} className={`${f.size.body} text-[${c.textLight}]`}>• {a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] uppercase tracking-widest mb-3`}>Projects</h2>
            {data.projects.map(p => (
              <div key={p.id} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{p.name}</h3>
                    {p.role && <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{p.role}</p>}
                  </div>
                  <span className={`${f.size.date} text-[${c.date}]`}>
                    {formatDate(p.startDate)} - {p.current ? 'Present' : formatDate(p.endDate)}
                  </span>
                </div>
                {p.description && <p className={`${f.size.body} text-[${c.text}] mt-1 leading-relaxed`}>{p.description}</p>}
                {p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.technologies.map((t, i) => (
                      <span key={i} className={`${f.size.date} text-[${c.techTag}]`}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] uppercase tracking-widest mb-3`}>Education</h2>
            {data.education.map(e => (
              <div key={e.id} className="mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{e.school}</h3>
                    <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{e.degree}{e.field ? ` • ${e.field}` : ''}</p>
                  </div>
                  <span className={`${f.size.date} text-[${c.date}]`}>{formatDate(e.startDate)} - {formatDate(e.endDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] uppercase tracking-widest mb-3`}>Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map(s => (
                <div key={s.id} className="flex flex-wrap gap-1">
                  <span className={`${f.size.itemSub} ${f.name} text-[${c.categoryTitle}]`}>{s.category}:</span>
                  {s.items.map((item, i) => (
                    <span key={i} className={`${f.size.date} text-[${c.title}]`}>{item}{i < s.items.length - 1 ? ',' : ''}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.awards.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] uppercase tracking-widest mb-3`}>Awards</h2>
            {data.awards.map(a => (
              <div key={a.id} className="mb-1.5 flex justify-between">
                <span className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{a.title}</span>
                <span className={`${f.size.date} text-[${c.date}]`}>{a.date}</span>
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] uppercase tracking-widest mb-3`}>Languages</h2>
            <div className="flex flex-wrap gap-3">
              {data.languages.filter(l => l.name && l.level).map(l => (
                <span key={l.id} className={`${f.size.body} text-[${c.title}]`}>
                  <span className="font-semibold">{l.name}</span> - {l.level}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ 模板3: 现代渐变（顶部大头部）============
const GradientLayout: React.FC<{ data: ResumeData; theme: typeof gradientTheme; formatDate: (s: string) => string }> = ({ data, theme, formatDate }) => {
  const c = theme.colors;
  const f = theme.fonts;

  return (
    <div className="w-[540px] min-h-[766px] bg-white mx-auto rounded-xl shadow-xl overflow-hidden font-sans">
      {/* 大头部 */}
      <div className="relative">
        <div style={{ background: c.header }} className="px-6 py-8">
          <h1 className={`${f.size.name} ${f.name} text-white text-2xl tracking-wider`}>{data.personalInfo.name || 'Your Name'}</h1>
          <p className={`${f.size.title} text-white/80 mt-1`}>{data.personalInfo.title || 'Professional Title'}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-[9px] text-white/70">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
            {data.personalInfo.github && <span className="text-blue-200">{data.personalInfo.github}</span>}
          </div>
        </div>
        {/* 装饰条 */}
        <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
      </div>

      {/* 内容 */}
      <div className="px-6 py-4">
        {data.personalInfo.summary && (
          <div className="mb-4 bg-[${c.accentLight}] rounded-lg p-3">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] mb-1`}>About Me</h2>
            <p className={`${f.size.body} text-[${c.text}] leading-relaxed`}>{data.personalInfo.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] mb-3 flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-[${c.accent}]"></span>
              Experience
            </h2>
            {data.workExperience.map(exp => (
              <div key={exp.id} className="mb-3 p-3 bg-[${c.borderLight}] rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{exp.position}</h3>
                    <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{exp.company}</p>
                  </div>
                  <span className={`${f.size.date} text-[${c.date}] bg-white px-2 py-0.5 rounded`}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && <p className={`${f.size.body} text-[${c.text}] mt-2`}>{exp.description}</p>}
                {exp.achievements.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {exp.achievements.map((a, i) => (
                      <li key={i} className={`${f.size.body} text-[${c.textLight}] pl-2`}>• {a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] mb-3 flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-[${c.accent}]"></span>
              Projects
            </h2>
            {data.projects.map(p => (
              <div key={p.id} className="mb-3 p-3 bg-[${c.borderLight}] rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{p.name}</h3>
                    {p.role && <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{p.role}</p>}
                  </div>
                  <span className={`${f.size.date} text-[${c.date}] bg-white px-2 py-0.5 rounded`}>
                    {formatDate(p.startDate)} - {p.current ? 'Present' : formatDate(p.endDate)}
                  </span>
                </div>
                {p.description && <p className={`${f.size.body} text-[${c.text}] mt-2`}>{p.description}</p>}
                {p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.technologies.map((t, i) => (
                      <span key={i} className={`${f.size.date} text-[${c.techTag}] bg-white px-2 py-0.5 rounded-full`}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] mb-3 flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-[${c.accent}]"></span>
              Education
            </h2>
            {data.education.map(e => (
              <div key={e.id} className="mb-2 p-3 bg-[${c.borderLight}] rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{e.school}</h3>
                    <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{e.degree}{e.field ? ` • ${e.field}` : ''}</p>
                  </div>
                  <span className={`${f.size.date} text-[${c.date}]`}>{formatDate(e.startDate)} - {formatDate(e.endDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] mb-3 flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-[${c.accent}]"></span>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map(s => (
                <div key={s.id} className="flex flex-wrap gap-1 p-2 bg-[${c.borderLight}] rounded-lg">
                  <span className={`${f.size.itemSub} ${f.name} text-[${c.categoryTitle}]`}>{s.category}:</span>
                  {s.items.map((item, i) => (
                    <span key={i} className={`${f.size.date} text-[${c.techTag}] bg-white px-1.5 py-0.5 rounded`}>{item}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.awards.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] mb-3 flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-[${c.accent}]"></span>
              Awards
            </h2>
            {data.awards.map(a => (
              <div key={a.id} className="mb-1.5 flex justify-between items-center p-2 bg-[${c.borderLight}] rounded-lg">
                <span className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{a.title}</span>
                <span className={`${f.size.date} text-[${c.date}]`}>{a.date}</span>
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] mb-3 flex items-center gap-2`}>
              <span className="w-2 h-2 rounded-full bg-[${c.accent}]"></span>
              Languages
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.languages.filter(l => l.name && l.level).map(l => (
                <span key={l.id} className={`${f.size.body} text-[${c.title}] bg-[${c.accentLight}] px-3 py-1 rounded-full`}>
                  {l.name} - {l.level}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ 模板4: 时间线布局（深色主题）============
const TimelineLayout: React.FC<{ data: ResumeData; theme: typeof timelineTheme; formatDate: (s: string) => string }> = ({ data, theme, formatDate }) => {
  const c = theme.colors;
  const f = theme.fonts;

  return (
    <div className="w-[540px] min-h-[766px] mx-auto rounded-xl shadow-xl overflow-hidden font-sans" style={{ background: '#0f172a' }}>
      {/* 头部 */}
      <div className="px-6 py-5" style={{ background: c.header }}>
        <h1 className={`${f.size.name} ${f.name} text-white text-xl`}>{data.personalInfo.name || 'Your Name'}</h1>
        <p className={`${f.size.title} text-[${c.headerSubtitle}] mt-0.5`}>{data.personalInfo.title || 'Professional Title'}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-3 text-[9px] text-white/60">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {data.personalInfo.github && <span className="text-cyan-400">{data.personalInfo.github}</span>}
        </div>
      </div>

      {/* 内容 */}
      <div className="px-6 py-4">
        {data.personalInfo.summary && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-white mb-2`}>About Me</h2>
            <p className={`${f.size.body} text-white/70 leading-relaxed`}>{data.personalInfo.summary}</p>
          </div>
        )}

        {data.workExperience.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-white mb-3`}>Experience</h2>
            {data.workExperience.map(exp => (
              <div key={exp.id} className="mb-3 pl-4 border-l-2 border-cyan-500 relative">
                <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-cyan-500"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-white`}>{exp.position}</h3>
                    <p className={`${f.size.itemSub} text-cyan-400`}>{exp.company}</p>
                  </div>
                  <span className={`${f.size.date} text-white/50`}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && <p className={`${f.size.body} text-white/70 mt-1`}>{exp.description}</p>}
                {exp.achievements.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {exp.achievements.map((a, i) => (
                      <li key={i} className={`${f.size.body} text-white/60`}>• {a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-white mb-3`}>Projects</h2>
            {data.projects.map(p => (
              <div key={p.id} className="mb-3 pl-4 border-l-2 border-purple-500 relative">
                <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-purple-500"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-white`}>{p.name}</h3>
                    {p.role && <p className={`${f.size.itemSub} text-purple-400`}>{p.role}</p>}
                  </div>
                  <span className={`${f.size.date} text-white/50`}>
                    {formatDate(p.startDate)} - {p.current ? 'Present' : formatDate(p.endDate)}
                  </span>
                </div>
                {p.description && <p className={`${f.size.body} text-white/70 mt-1`}>{p.description}</p>}
                {p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.technologies.map((t, i) => (
                      <span key={i} className={`${f.size.date} text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded`}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-white mb-3`}>Education</h2>
            {data.education.map(e => (
              <div key={e.id} className="mb-2 pl-4 border-l-2 border-green-500 relative">
                <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-green-500"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`${f.size.itemTitle} ${f.name} text-white`}>{e.school}</h3>
                    <p className={`${f.size.itemSub} text-green-400`}>{e.degree}{e.field ? ` • ${e.field}` : ''}</p>
                  </div>
                  <span className={`${f.size.date} text-white/50`}>{formatDate(e.startDate)} - {formatDate(e.endDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-white mb-3`}>Skills</h2>
            <div className="space-y-1.5">
              {data.skills.map(s => (
                <div key={s.id} className="flex items-start gap-2">
                  <span className={`${f.size.itemSub} ${f.name} text-white/80 min-w-[60px]`}>{s.category}:</span>
                  <div className="flex flex-wrap gap-1">
                    {s.items.map((item, i) => (
                      <span key={i} className={`${f.size.date} text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded`}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.awards.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-white mb-3`}>Awards</h2>
            {data.awards.map(a => (
              <div key={a.id} className="mb-1.5 flex justify-between pl-4 border-l-2 border-yellow-500">
                <span className={`${f.size.itemTitle} ${f.name} text-white`}>{a.title}</span>
                <span className={`${f.size.date} text-white/50`}>{a.date}</span>
              </div>
            ))}
          </div>
        )}

        {data.languages.length > 0 && (
          <div className="mb-4">
            <h2 className={`${f.size.sectionTitle} ${f.name} text-white mb-3`}>Languages</h2>
            <div className="flex flex-wrap gap-2">
              {data.languages.filter(l => l.name && l.level).map(l => (
                <span key={l.id} className={`${f.size.body} text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700`}>
                  {l.name} - {l.level}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ 模板5: 双栏侧边栏（橙色主题）============
const SidebarLayout: React.FC<{ data: ResumeData; theme: typeof sidebarTheme; formatDate: (s: string) => string }> = ({ data, theme, formatDate }) => {
  const c = theme.colors;
  const f = theme.fonts;

  return (
    <div className="w-[540px] min-h-[766px] bg-white mx-auto rounded-xl shadow-xl overflow-hidden font-sans">
      <div className="flex">
        {/* 左侧侧边栏 */}
        <div style={{ background: c.sidebar }} className="w-36 flex-shrink-0 p-4">
          {/* 头像 */}
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
            <span className="text-white/60 text-xs">Photo</span>
          </div>

          {/* 联系方式 */}
          <div className="text-white/80 space-y-2 text-[9px]">
            {data.personalInfo.email && (
              <div className="text-center">
                <div className="text-white/50 text-[8px] mb-0.5">Email</div>
                <div className="truncate">{data.personalInfo.email}</div>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="text-center">
                <div className="text-white/50 text-[8px] mb-0.5">Phone</div>
                <div>{data.personalInfo.phone}</div>
              </div>
            )}
            {data.personalInfo.location && (
              <div className="text-center">
                <div className="text-white/50 text-[8px] mb-0.5">Location</div>
                <div>{data.personalInfo.location}</div>
              </div>
            )}
            {data.personalInfo.github && (
              <div className="text-center">
                <div className="text-white/50 text-[8px] mb-0.5">GitHub</div>
                <div className="text-orange-200 truncate">{data.personalInfo.github}</div>
              </div>
            )}
          </div>

          {/* 技能 */}
          {data.skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[10px] font-semibold text-white/90 text-center mb-2">Skills</h3>
              <div className="space-y-2">
                {data.skills.map(s => (
                  <div key={s.id}>
                    <div className="text-[8px] text-white/60 mb-1">{s.category}</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {s.items.map((item, i) => (
                        <span key={i} className="text-[7px] text-white bg-white/20 px-1.5 py-0.5 rounded">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 语言 */}
          {data.languages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[10px] font-semibold text-white/90 text-center mb-2">Languages</h3>
              <div className="space-y-1 text-[8px] text-center text-white/70">
                {data.languages.filter(l => l.name && l.level).map(l => (
                  <div key={l.id}>{l.name}: {l.level}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 p-4">
          {/* 头部 */}
          <div className="mb-4 pb-3 border-b-2 border-orange-500">
            <h1 className={`${f.size.name} ${f.name} text-[${c.title}] text-xl`}>{data.personalInfo.name || 'Your Name'}</h1>
            <p className={`${f.size.title} text-[${c.subtitle}] mt-0.5`}>{data.personalInfo.title || 'Professional Title'}</p>
          </div>

          {/* Summary */}
          {data.personalInfo.summary && (
            <div className="mb-4">
              <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b border-orange-200 pb-1 mb-2`}>About Me</h2>
              <p className={`${f.size.body} text-[${c.text}] leading-relaxed`}>{data.personalInfo.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.workExperience.length > 0 && (
            <div className="mb-4">
              <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b border-orange-200 pb-1 mb-2`}>Experience</h2>
              {data.workExperience.map(exp => (
                <div key={exp.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{exp.position}</h3>
                      <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{exp.company}</p>
                    </div>
                    <span className={`${f.size.date} text-[${c.date}] bg-orange-50 px-1.5 py-0.5 rounded`}>
                      {formatDate(exp.startDate)} - {exp.current ? 'Now' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && <p className={`${f.size.body} text-[${c.text}] mt-1`}>{exp.description}</p>}
                  {exp.achievements.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {exp.achievements.map((a, i) => (
                        <li key={i} className={`${f.size.body} text-[${c.textLight}] pl-2`}>• {a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {data.projects.length > 0 && (
            <div className="mb-4">
              <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b border-orange-200 pb-1 mb-2`}>Projects</h2>
              {data.projects.map(p => (
                <div key={p.id} className="mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{p.name}</h3>
                      {p.role && <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{p.role}</p>}
                    </div>
                    <span className={`${f.size.date} text-[${c.date}] bg-orange-50 px-1.5 py-0.5 rounded`}>
                      {formatDate(p.startDate)} - {p.current ? 'Now' : formatDate(p.endDate)}
                    </span>
                  </div>
                  {p.description && <p className={`${f.size.body} text-[${c.text}] mt-1`}>{p.description}</p>}
                  {p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.technologies.map((t, i) => (
                        <span key={i} className={`${f.size.date} text-white bg-orange-500 px-1.5 py-0.5 rounded-full text-[7px]`}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div className="mb-4">
              <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b border-orange-200 pb-1 mb-2`}>Education</h2>
              {data.education.map(e => (
                <div key={e.id} className="mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{e.school}</h3>
                      <p className={`${f.size.itemSub} text-[${c.subtitle}]`}>{e.degree}{e.field ? ` • ${e.field}` : ''}</p>
                    </div>
                    <span className={`${f.size.date} text-[${c.date}]`}>{formatDate(e.startDate)} - {formatDate(e.endDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Awards */}
          {data.awards.length > 0 && (
            <div className="mb-4">
              <h2 className={`${f.size.sectionTitle} ${f.name} text-[${c.title}] border-b border-orange-200 pb-1 mb-2`}>Awards</h2>
              {data.awards.map(a => (
                <div key={a.id} className="mb-1.5 flex justify-between">
                  <span className={`${f.size.itemTitle} ${f.name} text-[${c.title}]`}>{a.title}</span>
                  <span className={`${f.size.date} text-[${c.date}]`}>{a.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
