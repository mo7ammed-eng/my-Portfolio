/**
 * SeoContent — Hidden semantic HTML for search engines & AI crawlers.
 * 
 * This component renders keyword-rich, structured text that search engines
 * and AI bots can crawl, even when the visual content is animated/JS-driven.
 * It's visually hidden but fully accessible to screen readers and crawlers.
 */
export default function SeoContent() {
  return (
    <div
      className="sr-only"
      aria-hidden="false"
      itemScope
      itemType="https://schema.org/Person"
    >
      <h1 itemProp="name">Mohammed Waleed — Full Stack Developer</h1>
      
      <p itemProp="description">
        Full Stack Developer with 6 years of programming experience and 4 years of freelance delivery.
        I build scalable web applications and RESTful APIs that blend solid architecture, clean code,
        and modern technology into products that are reliable and smooth to use. React, Next.js, Node.js,
        Express, PHP, TypeScript, MySQL, MongoDB. End-to-end development from database design to polished interfaces.
        Freelance full stack developer in Egypt available for projects worldwide.
      </p>

      <p itemProp="jobTitle">Full Stack Developer</p>

      <section aria-label="Services">
        <h2>Services — Hire Mohammed Waleed</h2>
        
        <article>
          <h3>Web Application Development</h3>
          <p>
            Scalable, production-ready web applications with clean system architecture — from database design
            to polished, responsive interfaces built with React, Next.js, TypeScript, and Tailwind CSS.
            Freelance full stack web development for startups, businesses, and international clients.
          </p>
        </article>

        <article>
          <h3>Backend Engineering</h3>
          <p>
            REST and GraphQL APIs, authentication, third-party integrations, and business logic engineered
            with Node.js, Express, PHP, Laravel, and TypeScript. Clean code, scalable architecture, and
            production-grade API design.
          </p>
        </article>

        <article>
          <h3>Large-Scale Platforms</h3>
          <p>
            Inventory management, warehouse operations, QR and barcode tracking, and analytics dashboards —
            large-scale commerce and educational platforms built end-to-end with modern full stack technology.
          </p>
        </article>
      </section>

      <section aria-label="Portfolio Statistics">
        <h2>Portfolio Statistics</h2>
        <ul>
          <li>6 years of programming experience</li>
          <li>4 years of freelance full stack development</li>
          <li>2 large-scale platforms delivered end-to-end</li>
          <li>Team Lead & Full Stack Developer — March 2024 to September 2024</li>
        </ul>
      </section>

      <section aria-label="Technical Skills">
        <h2>Technical Skills</h2>
        <p itemProp="knowsAbout">
          React, Next.js, JavaScript (ES6+), TypeScript, HTML5, CSS3, Tailwind CSS,
          Node.js, Express.js, PHP, Laravel, REST APIs, GraphQL APIs,
          MySQL, MongoDB, Git, GitHub, CI/CD, Postman, database design, clean code,
          AI-powered development workflows
        </p>
      </section>

      <section aria-label="About Mohammed Waleed — Full Stack Developer">
        <h2>Mohammed Waleed — Full Stack Developer</h2>
        <p>
          Mohammed Waleed is a full stack developer from Egypt with six years of programming experience
          and four years of professional freelance delivery. He builds scalable web applications and RESTful
          APIs across the full stack, combining frontend and backend development with modern tools and
          AI-powered workflows. His work includes an educational platform with barcode attendance,
          automated parent notifications, real-time chat, and controlled video access, plus a commerce
          platform with inventory, warehouse management, QR tracking, and analytics dashboards.
        </p>
        <p>
          He served as Team Lead & Full Stack Developer for a freelance team, coordinating designers and
          developers, running code reviews, and managing client communication across the full software
          development lifecycle. He is currently studying while continuing freelance full stack development.
        </p>
        
        <h3>Skills and Expertise:</h3>
        <ul>
          <li>Full Stack Web Development</li>
          <li>Frontend Development</li>
          <li>Backend Development</li>
          <li>REST API Development</li>
          <li>GraphQL API Development</li>
          <li>Database Design</li>
          <li>E-Commerce Platforms</li>
          <li>Educational Platforms</li>
          <li>Inventory &amp; Warehouse Systems</li>
          <li>QR &amp; Barcode Tracking</li>
          <li>Analytics Dashboards</li>
          <li>Authentication &amp; Access Control</li>
          <li>Real-Time Messaging</li>
          <li>Responsive Web Design</li>
          <li>Clean Architecture</li>
          <li>TypeScript Development</li>
          <li>React &amp; Next.js Development</li>
          <li>Node.js &amp; Express Backend</li>
          <li>PHP Development</li>
          <li>CI/CD Workflows</li>
        </ul>
        
        <p>
          Mohammed Waleed continues to build modern digital products focused on reliability, performance,
          clean architecture, and smooth user experience. His goal is to turn complex requirements into
          scalable software that businesses can depend on.
        </p>
      </section>

      <section aria-label="Contact">
        <h2>Hire Mohammed Waleed — Contact Information</h2>
        <p>
          <span itemProp="email">mo7ammed.engineer@gmail.com</span> |
          <span itemProp="telephone">+20 103 819 1703</span> |
          Egypt — available for freelance projects worldwide
        </p>
        <p>
          <a itemProp="sameAs" href="https://www.linkedin.com/in/mohammed-waleed-83098b370">LinkedIn Profile</a>
        </p>
      </section>
    </div>
  );
}
