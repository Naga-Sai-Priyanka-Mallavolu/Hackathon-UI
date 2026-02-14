import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Github,
  BookOpen,
  Terminal,
  Layout,
  Code,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Zap,
} from "lucide-react";

const backendUrl = "http://127.0.0.1:8000";

const COLORS = ["#FF8C00", "#FFB347", "#FFA500", "#FFD700", "#f59e0b"];

function App() {
  const [gitUrl, setGitUrl] = useState("");
  const [localPath, setLocalPath] = useState("");
  const [gitLoading, setGitLoading] = useState(false);
  const [pathLoading, setPathLoading] = useState(false);
  const [content, setContent] = useState("");
  const [activePage, setActivePage] = useState("README.md");
  const [docsReady, setDocsReady] = useState(false);

  const generateFromGit = async () => {
    if (!gitUrl || pathLoading) return;
    setGitLoading(true);
    try {
      const formData = new FormData();
      formData.append("git_url", gitUrl);
      await axios.post(`${backendUrl}/generate-from-git`, formData);
      setDocsReady(true);
      loadPage("README.md");
    } catch (error: any) {
      console.error("Documentation generation error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to generate documentation: ${errorMessage}`);
    } finally {
      setGitLoading(false);
    }
  };

  const generateFromPath = async () => {
    if (!localPath || gitLoading) return;
    setPathLoading(true);
    try {
      const formData = new FormData();
      formData.append("folder_path", localPath);
      await axios.post(`${backendUrl}/generate-from-path`, formData);
      setDocsReady(true);
      loadPage("README.md");
    } catch (error: any) {
      console.error("Path generation error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to generate from path: ${errorMessage}`);
    } finally {
      setPathLoading(false);
    }
  };

  const loadPage = async (page: string) => {
    setActivePage(page);
    try {
      const response = await axios.get(`${backendUrl}/docs-static/${page}`);
      setContent(response.data);
    } catch (error) {
      console.error(error);
      setContent("# Error\nFailed to load documentation page.");
    }
  };

  const pages = [
    { id: "README.md", label: "Getting Started", icon: <BookOpen size={18} /> },
    { id: "API_REFERENCE.md", label: "API Reference", icon: <Terminal size={18} /> },
    { id: "ARCHITECTURE.md", label: "Architecture", icon: <Layout size={18} /> },
    { id: "EXAMPLES.md", label: "Usage Examples", icon: <Code size={18} /> },
    { id: "diagrams/architecture.mermaid", label: "Visual Flow", icon: <ChevronRight size={18} /> },
  ];

  const ChartRenderer = ({ type, data }: { type: string; data: any }) => {
    if (!data) return null;

    if (type === "file_dist" || type === "project_breadth") {
      return (
        <div className="chart-card" style={{ marginTop: "2rem", marginBottom: "2.5rem" }}>
          <h3>{type === "file_dist" ? "File Type Distribution" : "Project Breadth"}</h3>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {data.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (type === "api_methods" || type === "endpoint_specs") {
      return (
        <div className="chart-card" style={{ marginTop: "2rem", marginBottom: "2.5rem" }}>
          <h3>{type === "api_methods" ? "API Methods Breakdown" : "Endpoint Parameters Complexity"}</h3>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (type === "structural") {
      return (
        <div className="chart-card" style={{ marginTop: "2rem", marginBottom: "2.5rem" }}>
          <h3>Project Structural Analysis</h3>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--primary-light)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (type === "quality") {
      const evaluationData = Object.entries(data || {}).map(([key, value]) => ({
        subject: key.replace(/_/g, " "),
        A: value as number,
        fullMark: 10,
      }));

      return (
        <div className="chart-card" style={{ marginTop: "2rem", marginBottom: "2.5rem" }}>
          <h3>Documentation Quality Score</h3>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={evaluationData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="Score" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    return null;
  };

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const content = String(children).replace(/\n$/, "");

      if (!inline && match && match[1] === "chart") {
        try {
          const chartConfig = JSON.parse(content);
          return <ChartRenderer type={chartConfig.type} data={chartConfig.data} />;
        } catch (e) {
          console.error("Failed to parse chart config:", e);
          return <code>{content}</code>;
        }
      }

      return !inline && match ? (
        <pre className={className} {...props}>
          <code>{children}</code>
        </pre>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {!docsReady ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="landing-page"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              padding: "2rem"
            }}
          >
            <div className="card" style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}>
              <div style={{ display: "inline-flex", padding: "1rem", background: "var(--primary-light)", borderRadius: "1rem", marginBottom: "1.5rem" }}>
                <Sparkles size={32} color="var(--primary)" />
              </div>
              <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", fontWeight: 800 }}>Technical Documentation Generator</h1>

              <div style={{ display: "flex", flexDirection: "column", gap: "2rem", textAlign: "left" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--primary)", marginBottom: "0.5rem", display: "block" }}>
                    From GitHub
                  </label>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="https://github.com/username/repo"
                      value={gitUrl}
                      onChange={(e) => setGitUrl(e.target.value)}
                      disabled={gitLoading || pathLoading}
                    />
                    <button
                      className="btn-primary"
                      onClick={generateFromGit}
                      disabled={gitLoading || pathLoading || !gitUrl}
                      style={{ opacity: pathLoading ? 0.5 : 1 }}
                    >
                      {gitLoading ? <Zap size={18} className="animate-spin" /> : <Github size={18} />}
                      Generate
                    </button>
                  </div>
                </div>

                <div style={{ position: "relative", textAlign: "center" }}>
                  <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1rem 0" }} />
                  <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "white", padding: "0 1rem", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>OR</span>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--primary)", marginBottom: "0.5rem", display: "block" }}>
                    Local Folder Path
                  </label>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="/Users/username/project-folder"
                      value={localPath}
                      onChange={(e) => setLocalPath(e.target.value)}
                      disabled={gitLoading || pathLoading}
                    />
                    <button
                      className="btn-primary"
                      onClick={generateFromPath}
                      disabled={gitLoading || pathLoading || !localPath}
                      style={{ opacity: gitLoading ? 0.5 : 1 }}
                    >
                      {pathLoading ? <Zap size={18} className="animate-spin" /> : <Terminal size={18} />}
                      Generate
                    </button>
                  </div>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Enter the absolute path to your local project directory.
                  </p>
                </div>
              </div>

              {(gitLoading || pathLoading) && (
                <div style={{ marginTop: "2rem", color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Zap size={20} />
                  </motion.div>
                  {gitLoading ? "Cloning and analyzing repository..." : "Analyzing local codebase..."}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="docs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", minHeight: "100vh" }}
          >
            <div className="sidebar">
              <div className="sidebar-header">
                <div style={{ padding: "0.5rem", background: "var(--primary)", borderRadius: "0.5rem" }}>
                  <Sparkles size={20} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>Documentation Generator</span>
                <button
                  onClick={() => setDocsReady(false)}
                  style={{ marginLeft: "auto", padding: "0.5rem", border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  <ArrowLeft size={18} />
                </button>
              </div>
              <div className="sidebar-content">
                {pages.map(page => (
                  <div
                    key={page.id}
                    className={`nav-item ${activePage === page.id ? "active" : ""}`}
                    onClick={() => (page as any).onClick ? (page as any).onClick() : loadPage(page.id)}
                  >
                    {page.icon}
                    {page.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, background: "#f9fafb", minHeight: "100vh", overflowY: "auto" }}>
              <motion.div
                key={activePage}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="markdown-content"
              >
                <ReactMarkdown components={MarkdownComponents}>{content}</ReactMarkdown>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .stat-icon {
          width: 40px;
          height: 40px;
          background: var(--primary-light);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text);
        }
        .stat-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        
        .chart-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .chart-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}

export default App;
