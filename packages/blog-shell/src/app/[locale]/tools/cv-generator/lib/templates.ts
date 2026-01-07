/**
 * CV Templates - Pre-built markdown structures
 */

export interface CVTemplate {
    id: string;
    name: string;
    description: string;
    icon: string; // emoji
    markdown: string;
}

export const cvTemplates: CVTemplate[] = [
    {
        id: 'professional',
        name: 'Professional',
        description: 'Corporate/Business format',
        icon: '💼',
        markdown: `# John Smith
**Senior Project Manager**

john.smith@email.com | +1 (555) 123-4567 | New York, NY
[LinkedIn](https://linkedin.com/in/johnsmith) | [Portfolio](https://johnsmith.com)

***

## Summary

Results-driven professional with 8+ years of experience in project management and team leadership. Proven track record of delivering complex projects on time and under budget. Expert in agile methodologies and cross-functional team collaboration.

***

## Experience

### Senior Project Manager @ Tech Solutions Inc
*New York, NY | Jan 2020 - Present*

Led digital transformation initiatives for Fortune 500 clients

- Managed portfolio of 15+ concurrent projects valued at $10M+
- Reduced project delivery time by 25% through process optimization
- Built and mentored team of 12 project coordinators

### Project Manager @ Digital Agency Co
*Boston, MA | Mar 2016 - Dec 2019*

Oversaw client projects from inception to delivery

- Successfully delivered 50+ web and mobile projects
- Achieved 98% client satisfaction rating
- Implemented agile practices across the organization

***

## Education

### MBA in Management @ Harvard Business School
*Boston, MA | 2014 - 2016*

GPA: 3.8/4.0

### Bachelor of Science in Business Administration
*University of Michigan | 2010 - 2014*
***
## Skills

**Project Management:** Agile, Scrum, Waterfall, PMP
**Tools:** Jira, Asana, MS Project, Confluence
**Leadership:** Team Building, Stakeholder Management, Strategic Planning
`,
    },
    {
        id: 'academic',
        name: 'Academic',
        description: 'Research/PhD format',
        icon: '🎓',
        markdown: `# Dr. Sarah Chen
**PhD Candidate, Computational Biology**

Biology Research Building 511 · Boston University
sarah.chen@bu.edu | [Google Scholar](https://scholar.google.com) | [ResearchGate](https://researchgate.net)

*Updated: January 2024*

***

## Education

### Boston University, Boston, MA
*Ph.D. Candidate in Computational Biology* | Expected 2025
*M.A. in Biology* | 2022

### Williams College, Williamstown, MA
*B.A. with Honors in Biology & Environmental Science* | 2019

## Research Interests

Computational genomics, machine learning applications in biology, protein structure prediction, and bioinformatics pipeline development.

***

## Publications

### Peer-Reviewed Articles

- **Chen, S.**, Smith, J., & Johnson, M. (2024). "Deep Learning Approaches for Protein Folding." *Nature Computational Biology*, 15(2), 123-145.
- **Chen, S.** & Williams, R. (2023). "A Novel Algorithm for Sequence Alignment." *Bioinformatics*, 39(4), 567-580.

### Conference Proceedings

- **Chen, S.** (2023). "Advances in Computational Genomics." Presented at International Conference on Bioinformatics, San Francisco, CA.

***

## Teaching Experience

### Teaching Fellow, Boston University
*Introduction to Computational Biology (BIO 301)* | Fall 2023
*Bioinformatics Lab (BIO 405)* | Spring 2023

***

## Awards & Honors

- NSF Graduate Research Fellowship (2022)
- Dean's List, Williams College (2016-2019)
- Phi Beta Kappa

***

## Technical Skills

**Languages:** Python, R, Julia, SQL
**Tools:** TensorFlow, PyTorch, BLAST, Galaxy
**Platforms:** AWS, Google Cloud, HPC Clusters
`,
    },
    {
        id: 'developer',
        name: 'Developer',
        description: 'Software Engineer format',
        icon: '👨‍💻',
        markdown: `# Alex Rodriguez
**Full Stack Developer**

alex.dev@email.com | +1 (555) 987-6543 | San Francisco, CA
[GitHub](https://github.com/alexdev) | [LinkedIn](https://linkedin.com/in/alexdev) | [Portfolio](https://alexdev.io)

***

## Summary

Passionate full-stack developer with 5+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud technologies. Open source contributor and tech community speaker.

***

## Experience

### Senior Software Engineer @ StartupXYZ
*San Francisco, CA | Mar 2022 - Present*

Building next-generation SaaS platform

- Architected microservices infrastructure handling 1M+ daily requests
- Led migration from monolith to microservices, reducing deployment time by 80%
- Implemented CI/CD pipelines with 99.9% deployment success rate
- Mentored 4 junior developers through code reviews and pair programming

### Software Engineer @ TechCorp
*Seattle, WA | Jun 2019 - Feb 2022*

Developed customer-facing web applications

- Built React dashboard used by 50K+ daily active users
- Optimized database queries reducing page load time by 60%
- Integrated third-party APIs (Stripe, Twilio, AWS)

***

## Projects

### [Open Source Toolkit](https://github.com/alexdev/toolkit)
*TypeScript, React, Node.js*

Popular developer toolkit with 2K+ GitHub stars

- Built modular component library used by 500+ developers
- Maintained comprehensive documentation and examples

### [DevMetrics](https://devmetrics.io)
*Next.js, PostgreSQL, GraphQL*

Analytics platform for development teams

- Real-time metrics dashboard for code quality
- Integration with GitHub, GitLab, and Bitbucket

***

## Skills

**Frontend:** React, Next.js, TypeScript, Vue.js, Tailwind CSS
**Backend:** Node.js, Python, Go, PostgreSQL, MongoDB
**Cloud:** AWS, GCP, Docker, Kubernetes, Terraform
**Tools:** Git, GitHub Actions, Jest, Cypress

***

## Certifications

- AWS Solutions Architect Associate (2023)
- Google Cloud Professional Developer (2022)

***

## Education

### B.S. Computer Science @ UC Berkeley
*2015 - 2019*
`,
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Designer/Artist format',
        icon: '🎨',
        markdown: `# Emma Wilson
**UI/UX Designer & Creative Director**

hello@emmawilson.design | Los Angeles, CA
[Dribbble](https://dribbble.com/emmawilson) | [Behance](https://behance.net/emmawilson) | [Instagram](https://instagram.com/emmawilson.design)

***

## About Me

Award-winning designer with 7+ years of experience crafting beautiful, user-centered digital experiences. I believe great design is invisible—it just works. Currently leading the design team at a fast-growing startup, previously at Apple and Airbnb.

***

## Experience

### Creative Director @ DesignStudio
*Los Angeles, CA | 2021 - Present*

Leading design vision for digital products

- Direct creative strategy for clients including Nike, Spotify, and Netflix
- Manage team of 8 designers and 3 motion artists
- Increased client retention by 40% through design excellence

***

### Senior Product Designer @ Airbnb
*San Francisco, CA | 2018 - 2021*

Designed experiences for millions of travelers

- Redesigned booking flow increasing conversions by 25%
- Created design system used across 200+ screens
- Led accessibility initiative making products WCAG 2.1 compliant

***

### Product Designer @ Apple
*Cupertino, CA | 2016 - 2018*

Worked on iOS and macOS Human Interface Guidelines

***

## Portfolio Highlights

### Spotify Redesign Concept
*UI/UX Design, Prototyping*

Conceptual redesign of Spotify's mobile experience with focus on social features and music discovery.

### Nike Training App
*Product Design, Motion Design*

End-to-end design for workout tracking app with 5M+ downloads.

***

### Airbnb Experiences
*UX Research, UI Design*

Led design for new Experiences feature from ideation to launch.
***
## Skills & Tools

**Design:** Figma, Sketch, Adobe Creative Suite, Framer
**Prototyping:** Principle, After Effects, ProtoPie
**Research:** User Testing, A/B Testing, Analytics

***

## Awards

- Webby Award for Best Mobile UI (2023)
- Apple Design Award Finalist (2018)
- Dribbble Top 50 Designers (2020)

***

## Education

### BFA Graphic Design @ Rhode Island School of Design
*2012 - 2016*
`,
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple/Clean format',
        icon: '✨',
        markdown: `# James Park
**Marketing Manager**

james.park@email.com | San Diego, CA | [LinkedIn](https://linkedin.com/in/jamespark)

***

## Experience

### Marketing Manager @ GrowthCo
*2021 - Present*

- Lead marketing team of 5 specialists
- Increased organic traffic by 150% YoY
- Managed $500K annual marketing budget

### Marketing Specialist @ StartupABC
*2018 - 2021*

- Executed multi-channel marketing campaigns
- Grew social media following from 5K to 50K
- Produced content generating 2M+ impressions

***

## Education

### BA Marketing @ UCLA
*2014 - 2018*

## Skills

Digital Marketing, SEO/SEM, Google Analytics, HubSpot, Content Strategy, Social Media
`,
    },
];

export const getTemplateById = (id: string): CVTemplate | undefined => {
    return cvTemplates.find(t => t.id === id);
};
