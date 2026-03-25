# analizodatos.com — Landing Page Personal

## Vision
Landing page personal de Manuel Argüelles — Analytics & AI Engineer con base en Lima, Perú.
Página profesional que sirve como presentación, portfolio, oferta de servicios y CV online.

## Stack
- HTML5 + CSS3 vanilla + JavaScript vanilla
- Sin frameworks ni build tools (Namecheap shared hosting)
- Tailwind CSS via CDN
- Deploy: SCP a 67.223.118.87:21098 → /home/marguelles/public_html/

## Paleta de Colores — Deep Ocean (B)
- Background: #0A0E1A
- Primary: #00D4FF (cian eléctrico)
- Secondary: #6C63FF (índigo)
- Text: #FFFFFF
- Text muted: rgba(255,255,255,0.65)
- Cards: rgba(255,255,255,0.04) con border rgba(255,255,255,0.08)

## Secciones
1. Nav — sticky, blur backdrop
2. Hero — nombre, título, foto, CTA (Ver proyectos + Descargar CV)
3. About — bio breve, números (años exp, proyectos, tecnologías)
4. Skills — grid de tecnologías con íconos/tags
5. Projects — cards con proyectos destacados + link a GitHub
6. Services — cards de servicios de consultoría
7. Contact — email, LinkedIn, GitHub + formulario simple (mailto)
8. Footer

## Datos de Manuel
- Nombre: Manuel Argüelles Guerra
- Título: Analytics & AI Engineer
- Ubicación: Lima, Perú
- Email: marguelles@analizodatos.com
- LinkedIn: https://pe.linkedin.com/in/manuelarguellesguerra
- GitHub: https://github.com/manuelarguelles
- Foto: assets/manuel-photo.jpg

## Proyectos a mostrar
1. apex-dq-agent — Data Quality Agent (Azure AI Foundry + GPT-4o + Databricks)
2. Archflow — Editor visual de arquitecturas de datos (React + React Flow)
3. apex-pipeline-doctor — SRE Agent para pipelines Databricks
4. RAG Portfolio — 10 proyectos RAG con PostgreSQL + pgvector
5. apex-pedido-sugerido — Sales bot con AI (Telegram + Databricks)
6. DataEngineer English — App de práctica de inglés técnico

## Servicios
- Data Engineering (pipelines ETL, Spark, Databricks, dbt)
- Analytics & BI (Power BI, dashboards, modelos de datos)
- Cloud & On-Premise (Azure, AWS, arquitectura de datos)
- AI Agents (GPT-4o, LLMs, agentes autónomos, RAG)
- CRM & ERP (implementación, migración, integraciones)
- Aplicaciones Web (Next.js, React, Node.js)
- Aplicaciones Móviles (React Native, Flutter)
- Modelos Predictivos (ML, scikit-learn, MLflow)

## Skills técnicos
Databricks, PySpark, Delta Lake, Unity Catalog, dbt, Azure (ADF, AI Foundry, OpenAI),
Python, SQL, PostgreSQL, MongoDB, Docker, GitHub Actions, Terraform,
GPT-4o, AI Agents, RAG, LangChain, Power BI, Next.js, React, Node.js,
React Native, MLflow, Kedro, Medallion Architecture

## Constraints
- Archivo único index.html (o pocos archivos) — hosting shared sin Node.js
- Diseño dark, moderno, NO genérico
- Animaciones sutiles (scroll reveal, hover effects)
- Mobile responsive
- Performance: imágenes optimizadas, CSS/JS inline o en 1-2 archivos max
- CV: enlace a assets/cv-manuel-arguelles.pdf (se generará después)
