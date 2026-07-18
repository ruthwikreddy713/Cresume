// Shipped open-source template. Personal master.tex is stored locally in IndexedDB and gitignored.
export const SAMPLE_TEX = String.raw`\documentclass[letterpaper,11pt]{article}
\usepackage[margin=0.5in]{geometry}
\usepackage{enumitem}
\usepackage{hyperref}
\pagestyle{empty}

\begin{document}
\begin{center}
    {\Huge \textbf{Alex Taylor}} \\ \vspace{2pt}
    \small
    \href{mailto:alex.taylor@example.com}{alex.taylor@example.com} $|$
    +1 (555) 019-2834 $|$
    \href{https://linkedin.com/in/alextaylor/}{linkedin.com/in/alextaylor}
\end{center}
\vspace{-30pt}

% <section name="Education">
\section*{EDUCATION}
\vspace{-5pt}\hrule \vspace{5pt}
\noindent
\begin{tabular*}{\textwidth}{@{}l@{\extracolsep{\fill}}r@{}}
  \textbf{State University} & San Francisco, CA \\
  \textit{Bachelor of Science in Computer Science; GPA: 3.8/4.0} & \textit{Aug 2019 -- May 2023} \\
\end{tabular*}
\vspace{-20pt}
% </section>

% <section name="Experience">
\section*{EXPERIENCE}
\vspace{-0.5em}\hrule\vspace{0.5em}
% <block id="tech_corp" title="Senior Software Engineer — TechCorp">
\noindent
\begin{tabular*}{\textwidth}{@{}l@{\extracolsep{\fill}}r@{}}
  \textbf{Senior Software Engineer} $|$ \textit{TechCorp} & San Francisco, CA \\
  \textbf{Tech:} \textit{Java, Spring Boot, Microservices, PostgreSQL, Kafka} & \textit{Jun 2023 -- Present} \\
\end{tabular*}
\begin{itemize}[leftmargin=0.15in, label={$\bullet$}, itemsep=2pt, parsep=0pt, topsep=4pt]
% <bullet id="techcorp_pipeline" skills="Java, Spring Boot, Microservices, Kafka">
\item \textbf{High-Throughput Pipeline:} Engineered distributed event pipeline handling 2M+ daily events using \textbf{Java} and \textbf{Apache Kafka}, reducing query latency by 45\%.
% </bullet>
% <bullet id="techcorp_db" skills="PostgreSQL, SQL">
\item \textbf{Database Optimization:} Optimized \textbf{PostgreSQL} queries and indexing strategies, eliminating legacy joins and improving p99 response time from 1.2s to 120ms.
% </bullet>
\end{itemize}
\vspace{0pt}
% </block>

% <block id="cloud_labs" title="Software Developer — CloudLabs">
\noindent
\begin{tabular*}{\textwidth}{@{}l@{\extracolsep{\fill}}r@{}}
  \textbf{Software Developer} $|$ \textit{CloudLabs} & San Jose, CA \\
  \textbf{Tech:} \textit{Node.js, React, AWS, Docker, REST} & \textit{Jan 2022 -- May 2023} \\
\end{tabular*}
\begin{itemize}[leftmargin=0.15in, label={$\bullet$}, itemsep=0pt, parsep=0pt, topsep=4pt]
% <bullet id="cloud_api" skills="Node.js, REST, React">
\item \textbf{Microservice API:} Built decoupled \textbf{Node.js} REST APIs and \textbf{React} dashboard UI for enterprise asset management.
% </bullet>
% <bullet id="cloud_infra" skills="AWS, Docker">
\item \textbf{Cloud Infrastructure:} Automated containerized deployments using \textbf{Docker} on \textbf{AWS EC2}, lowering cloud infrastructure costs by 30\%.
% </bullet>
\end{itemize}
\vspace{-15pt}
% </block>
% </section>

% <section name="Projects">
\section*{PROJECTS}
\vspace{-5pt}\hrule \vspace{5pt}
% <block id="kv_store" title="Distributed Key-Value Engine">
\noindent
\begin{tabular*}{\textwidth}{@{}l@{\extracolsep{\fill}}r@{}}
  \textbf{Distributed Key-Value Engine $|$ High-Performance Storage} & \textit{Personal Project} \\
  \textbf{Tech:} \textit{Go, gRPC, Redis, Concurrency} & \\
\end{tabular*}
\begin{itemize}[leftmargin=0.15in, label={$\bullet$}, itemsep=0pt, parsep=0pt, topsep=4pt]
% <bullet id="kv_engine" skills="Go, gRPC, Redis, Concurrency">
\item Developed a fault-tolerant in-memory \textbf{Go} storage engine with \textbf{gRPC} replication and custom WAL persistence, benchmarked at 100k+ writes/sec.
% </bullet>
\end{itemize}
\vspace{0pt}
% </block>
\vspace{-15pt}
% </section>

% <section name="Skills">
\section*{SKILLS \& TECHNOLOGIES}
\vspace{-5pt}\hrule \vspace{5pt}
\textbf{Languages \& Frameworks:} Java, Python, Go, C++, JavaScript, TypeScript, Node.js, React, Spring Boot \\
\textbf{Infrastructure \& Tools:} AWS, Docker, Kubernetes, PostgreSQL, Redis, Kafka, Git, Linux \\
\vspace{-25pt}
% </section>
\end{document}`

