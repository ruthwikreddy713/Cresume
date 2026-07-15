// The shipped master is deliberately ordinary LaTeX. Only the opt-in selection
// wrappers are comments, so compiling it outside CResume continues to work.
export const SAMPLE_TEX = String.raw`\documentclass[letterpaper,11pt]{article}
\usepackage[margin=0.5in]{geometry}
\usepackage{enumitem}
\usepackage{hyperref}
\pagestyle{empty}

\begin{document}
\begin{center}
    {\Huge \textbf{Kadari Ruthwik Reddy}} \\ \vspace{2pt}
    \small
    \href{mailto:ruthwikred7@gmail.com}{ruthwikred7@gmail.com} $|$
    +91 9059199427 $|$
    \href{https://linkedin.com/in/ruthwikreddy713/}{linkedin.com/in/ruthwikreddy713}
\end{center}
\vspace{-30pt}

% <section name="Education">
\section*{EDUCATION}
\vspace{-5pt}\hrule \vspace{5pt}
\noindent
\begin{tabular*}{\textwidth}{@{}l@{\extracolsep{\fill}}r@{}}
  \textbf{International Institute of Information Technology, Hyderabad (IIITH)} & Hyderabad, India \\
  \textit{Bachelor of Technology, Computer Science and Engineering; CGPA: 8.62/10} & \textit{Aug 2019 -- Jul 2023} \\
\end{tabular*}
\vspace{-20pt}
% </section>

% <section name="Experience">
\section*{EXPERIENCE}
\vspace{-0.5em}\hrule\vspace{0.5em}
% <block id="oracle" title="Senior Application Software Engineer — Oracle">
\noindent
\begin{tabular*}{\textwidth}{@{}l@{\extracolsep{\fill}}r@{}}
  \textbf{Senior Application Software Engineer (IC3)} $|$ \textit{Oracle} & Hyderabad, India \\
  \textbf{Tech:} \textit{Java, ADF, OracleSQL, KnockoutJS, Microservices} & \textit{Jun 2023 -- Present} \\
\end{tabular*}
\begin{itemize}[leftmargin=0.15in, label={$\bullet$}, itemsep=2pt, parsep=0pt, topsep=4pt]
% <bullet id="oracle_nudge" skills="Java, OracleSQL, Microservices, SQL">
\item \textbf{Nudge Plan Configuration:} Co-designed and implemented an automation framework across Oracle Fusion modules for SMS, Email, and Journey Orchestration. Owned \textbf{rule evaluation}, \textbf{metadata management}, and \textbf{population filtering}; reduced average query latency from \textbf{3s to under 300ms} by eliminating legacy \textbf{4-way joins} on \textbf{2M+ row tables}.
% </bullet>
% <bullet id="oracle_redwood" skills="Java, KnockoutJS, REST, Microservices">
\item \textbf{Redwood UI Modernization:} Built end-to-end Redwood experiences across HCM and SCM, developing both frontend components (\textbf{KnockoutJS}) and backend \textbf{Java REST APIs} to replace legacy ADF flows with a decoupled frontend-backend architecture.
% </bullet>
% <bullet id="oracle_timezone" skills="Java, Microservices">
\item \textbf{Global Timezone Synchronization:} Led the rollout of tenant-configurable timezone support in Oracle Journeys, enabling accurate date-based assignments across global regions. Extended the solution to downstream tasks and notifications to ensure consistent scheduling behavior.
% </bullet>
\end{itemize}
\vspace{0pt}
% </block>

% <block id="product_labs" title="Developer — Product Labs @ IIITH">
\noindent
\begin{tabular*}{\textwidth}{@{}l@{\extracolsep{\fill}}r@{}}
  \textbf{Developer} $|$ \textit{Product Labs @ IIITH} & Hyderabad, India \\
  \textbf{Tech:} \textit{Node.js, React, FFmpeg, AWS (EC2, S3)} & \textit{Jan 2021 -- Aug 2021} \\
\end{tabular*}
\begin{itemize}[leftmargin=0.15in, label={$\bullet$}, itemsep=0pt, parsep=0pt, topsep=4pt]
% <bullet id="labs_video" skills="Node.js, JavaScript, REST">
\item \textbf{Automated Video Generation:} Architected a \textbf{Node.js} framework to transform PPTs into full lecture videos by extracting slide notes, generating audio via TTS APIs, and batching audio segments to a lip-sync API to animate a user-uploaded photo/video.
% </bullet>
% <bullet id="labs_pipeline" skills="FFmpeg, AWS, Node.js, JavaScript">
\item \textbf{Parallel Rendering Pipeline:} Utilized \textbf{FFmpeg} to programmatically overlay the lip-synced avatar onto corresponding slides and stitch the final video; distributed this rendering workload across concurrent \textbf{AWS EC2} workers, reducing generation latency by \textbf{90\%} and storing outputs in \textbf{AWS S3}.
% </bullet>
\end{itemize}
\vspace{-15pt}
% </block>
% </section>

% <section name="Projects">
\section*{PROJECTS}
\vspace{-5pt}\hrule \vspace{5pt}
% <block id="mapreduce" title="Distributed MapReduce Engine">
\noindent
\begin{tabular*}{\textwidth}{@{}l@{\extracolsep{\fill}}r@{}}
  \textbf{Distributed Mapreduce Engine $|$ Fault-Tolerant Data Processing} & \textit{Personal Project} \\
  \textbf{Tech:} \textit{Go, gRPC, Protocol Buffers, Distributed Systems, Concurrency} & \\
\end{tabular*}
\begin{itemize}[leftmargin=0.15in, label={$\bullet$}, itemsep=0pt, parsep=0pt, topsep=4pt]
% <bullet id="mapreduce_engine" skills="Go, gRPC, Distributed Systems, Concurrency">
\item Built a fault-tolerant \textbf{Map-Reduce} engine in \textbf{Go} coordinating parallel map and shuffle phases via \textbf{gRPC}, leveraging \textbf{Goroutines} to manage dynamic worker pools with 500ms heartbeats and 5-second timeouts for automatic task reassignment.
% </bullet>
\end{itemize}
\vspace{0pt}
% </block>

% <block id="lsm_tree" title="Embedded LSM-Tree Storage Engine">
\noindent
\begin{tabular*}{\textwidth}{@{}l@{\extracolsep{\fill}}r@{}}
  \textbf{Embedded LSM-Tree Storage Engine $|$ Custom Key-Value Store} & \textit{Personal Project} \\
  \textbf{Tech:} \textit{C++, Redis (RESP), Bloom Filters, Multi-threading, Systems Programming} & \\
\end{tabular*}
\begin{itemize}[leftmargin=0.15in, label={$\bullet$}, itemsep=0pt, parsep=0pt, topsep=4pt]
% <bullet id="lsm_engine" skills="C++, Redis, Multi-threading, Systems Programming">
\item Engineered a \textbf{C++} LSM-Tree engine benchmarked at 150k+ writes/sec via multi-threaded compaction and WAL, exposing it as a \textbf{Redis}-compatible server using a custom \textbf{RESP} parser and \textbf{Bloom Filters} to eliminate 95\% of redundant disk seeks.
% </bullet>
\end{itemize}
% </block>
\vspace{-15pt}
% </section>

% <section name="Skills & Achievements">
\section*{SKILLS \& ACHIEVEMENTS}
\vspace{-5pt}\hrule \vspace{5pt}
\textbf{Languages/Tech:} Java, Python, C++, Go, SQL, JavaScript, Node.js, React, OracleSQL, PostgreSQL, Redis, Kafka, AWS, Docker, Git, FFmpeg \\
\textbf{Achievements:} AIR 562 (99.959 percentile) in JEE Main among 1.2M+ candidates; AIR 2186 in JEE Advanced among 161K+ candidates. Teaching Assistant for Data Structures \& Algorithms (300+ students). \\
\vspace{-25pt}
% </section>

% <section name="Publications">
\section*{PUBLICATIONS}
\vspace{-0.5em}\hrule\vspace{0.5em}
\begin{itemize}[leftmargin=0.15in, label={$\bullet$}, itemsep=2pt, parsep=0pt, topsep=0pt]
  \item \textbf{Do Clickbait Articles and Non-Clickbait Articles have the Same Price?} (Poster Presentation), NSE CBS 4, IIM Ahmedabad.
  \item \textbf{Meaning or Sound: Which Matters More?} (Poster Presentation), ACCS9, IIT Delhi.
\end{itemize}
\vspace{-15pt}
% </section>
\end{document}`
