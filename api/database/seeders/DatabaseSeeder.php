<?php

namespace Database\Seeders;

use App\Models\AboutSection;
use App\Models\Experience;
use App\Models\HeroSection;
use App\Models\Project;
use App\Models\Service;
use App\Models\SiteSetting;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\SeoSetting;
use App\Models\SocialLink;
use App\Models\ThemeSetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin user ────────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'mo7ammed.engineer@gmail.com')],
            [
                'name' => 'Mohammed Waleed',
                'password' => env('ADMIN_PASSWORD', 'Waleed@Portfolio2026'),
            ],
        );

        // ── Hero ──────────────────────────────────────────────────────────────
        HeroSection::updateOrCreate(['id' => 1], [
            'label' => 'Full Stack Developer',
            'ghost_line' => "Hey, I'm",
            'name_line' => 'Waleed.',
            'paragraph1' => 'I build *scalable* web applications and *RESTful* APIs that blend solid architecture, clean code, and modern technology into products that are reliable and *smooth* to use. My work covers the full stack — from *database* design to polished user interfaces.',
            'paragraph2' => 'I mainly work with React, Next.js, Node.js, Express, PHP, TypeScript, MySQL, and MongoDB, combining frontend and backend development with *AI-powered* workflows to ship faster and with *cleaner* code.',
            'paragraph3' => "So far, I've delivered multiple client applications *end-to-end* — from an educational platform with barcode attendance and real-time chat to a *commerce* platform with inventory, QR tracking, and analytics dashboards. I'm currently studying while continuing *freelance* full stack development.",
            'cta_text' => 'Explore ↓',
            'visible' => true,
            'sort_order' => 0,
        ]);

        // ── About ─────────────────────────────────────────────────────────────
        AboutSection::updateOrCreate(['id' => 1], [
            'label' => 'About Me',
            'heading_line1' => 'Crafting',
            'heading_line2' => 'the',
            'heading_line3' => 'invisible.',
            'bio' => [
                "I'm a *full stack developer* from *Egypt* with *6 years* of programming experience and *4 years* of independent freelance development. I design, develop, test, debug, and deploy *scalable* web applications and RESTful APIs — covering frontend and backend development, database integration, and software architecture.",
                "Skilled in modern web technologies and *Git/GitHub*, I combine strong *problem-solving* and analytical skills with the ability to learn new technologies quickly. I use *AI-powered development tools* to improve workflows, code quality, productivity, and delivery speed — building *maintainable, production-ready* solutions.",
                "As a freelance *team lead*, I coordinate designers and developers, run *agile* task distribution and code reviews, manage client communication, and own the end-to-end software development lifecycle — from system architecture to *cloud deployment*.",
                "I'm currently studying at the *Al-Wadi Higher Institute* for Management, Finance and Information Systems in El Obour, Egypt.",
            ],
            'resume_url' => null,
            'image_url' => null,
            'visible' => true,
        ]);

        // ── Skills (CV structure: Frontend / Backend / Database / DevOps) ────
        $categories = [
            ['name' => 'frontend', 'label' => 'Tech I Work With', 'skills' => [
                ['name' => 'React', 'icon' => 'react'],
                ['name' => 'Next.js', 'icon' => 'nextjs'],
                ['name' => 'JavaScript (ES6+)', 'icon' => 'javascript'],
                ['name' => 'TypeScript', 'icon' => 'typescript'],
                ['name' => 'HTML5', 'icon' => 'html5'],
                ['name' => 'CSS3', 'icon' => 'css3'],
                ['name' => 'Tailwind CSS', 'icon' => 'tailwind'],
            ]],
            ['name' => 'backend', 'label' => 'Backend', 'skills' => [
                ['name' => 'REST / GraphQL APIs', 'icon' => 'api'],
                ['name' => 'Node.js / Express', 'icon' => 'nodejs'],
                ['name' => 'PHP', 'icon' => 'php'],
                ['name' => 'Laravel', 'icon' => 'laravel'],
            ]],
            ['name' => 'database', 'label' => 'Database', 'skills' => [
                ['name' => 'MySQL', 'icon' => 'mysql'],
                ['name' => 'MongoDB', 'icon' => 'mongodb'],
            ]],
            ['name' => 'devops', 'label' => 'DevOps', 'skills' => [
                ['name' => 'CI/CD', 'icon' => 'cicd'],
                ['name' => 'Git / GitHub', 'icon' => 'github'],
            ]],
        ];

        foreach ($categories as $index => $cat) {
            $category = SkillCategory::updateOrCreate(
                ['name' => $cat['name']],
                ['label' => $cat['label'], 'sort_order' => $index],
            );

            foreach ($cat['skills'] as $i => $skill) {
                Skill::updateOrCreate(
                    ['skill_category_id' => $category->id, 'name' => $skill['name']],
                    ['icon' => $skill['icon'], 'sort_order' => $i, 'visible' => true],
                );
            }
        }

        // ── Experience (from CV) ───────────────────────────────────────────────
        Experience::updateOrCreate(['id' => 1], [
            'role' => 'Team Lead & Full Stack Developer',
            'company' => 'Self-Employed',
            'location' => 'Egypt',
            'description' => 'Led freelance full-stack development projects by coordinating with cross-functional teams, including designers and developers, to deliver high-quality, scalable web applications. Managed agile task distribution, code reviews, client communication, and end-to-end SDLC.',
            'start_date' => '03/2024',
            'end_date' => '09/2024',
            'is_current' => false,
            'sort_order' => 0,
            'visible' => true,
        ]);

        Experience::updateOrCreate(['id' => 2], [
            'role' => 'Full Stack Developer',
            'company' => 'Self-Employed (Freelance)',
            'location' => 'Egypt',
            'description' => "Developed and delivered multiple web applications for clients. Managed end-to-end project development from planning to deployment, working with different technologies based on project requirements and communicating closely with clients.",
            'start_date' => '2021',
            'end_date' => null,
            'is_current' => true,
            'sort_order' => 1,
            'visible' => true,
        ]);

        // ── Services (Work section cards) ─────────────────────────────────────
        $services = [
            [
                'num' => '01',
                'label' => 'Full Stack Development',
                'title' => 'Web Applications',
                'description' => 'Scalable, production-ready web applications with clean system architecture — from database design to polished, responsive interfaces built with React and Next.js.',
                'icon' => 'web',
                'href' => '/projects?cat=website',
            ],
            [
                'num' => '02',
                'label' => 'APIs & Integrations',
                'title' => 'Backend Engineering',
                'description' => 'REST and GraphQL APIs, authentication, third-party integrations, and business logic engineered with Node.js, Express, PHP, and TypeScript.',
                'icon' => 'api',
                'href' => '/projects?cat=api',
            ],
            [
                'num' => '03',
                'label' => 'Commerce & Platforms',
                'title' => 'Large-Scale Platforms',
                'description' => 'Inventory management, warehouse operations, QR tracking, and analytics dashboards — large-scale commerce platforms built end-to-end.',
                'icon' => 'commerce',
                'href' => '/projects?cat=platform',
            ],
        ];

        foreach ($services as $i => $svc) {
            Service::updateOrCreate(
                ['num' => $svc['num']],
                [...$svc, 'sort_order' => $i, 'visible' => true],
            );
        }

        // ── Projects (from CV) ────────────────────────────────────────────────
        Project::updateOrCreate(['id' => 1], [
            'title' => 'Educational Platform',
            'slug' => 'educational-platform',
            'description' => "A complete educational platform for the subject of chemistry. Developed a comprehensive system featuring barcode-based attendance verification at classroom entry, an automated parent notification system for attendance confirmation, real-time internal chat, secure video and file upload management, and advanced content access control with time-based video restriction. Designed to enhance student engagement, streamline classroom management, and improve communication between instructors, students, and parents through scalable, high-performance system architecture.",
            'category' => 'Website',
            'tech' => 'React · Node.js · Express · MongoDB',
            'client' => 'Chemistry Education',
            'month' => 'March',
            'year' => '2026',
            'services' => 'Attendance Verification, Parent Notifications, Real-Time Chat, Video Management, Access Control',
            'project_date' => '2026-03-01',
            'featured' => true,
            'visible' => true,
            'sort_order' => 0,
        ]);

        Project::updateOrCreate(['id' => 2], [
            'title' => 'Commerce Platform',
            'slug' => 'commerce-platform',
            'description' => 'Smart commerce, inventory & QR tracking platform. Built a large-scale commerce platform with inventory management, warehouse operations, QR tracking, and analytics dashboards using Next.js, Tailwind CSS, TypeScript, Node.js, Express, and GraphQL.',
            'category' => 'Commerce',
            'tech' => 'Next.js · Tailwind CSS · TypeScript · Node.js · Express · GraphQL',
            'client' => 'Commerce & Logistics',
            'month' => 'August',
            'year' => '2025',
            'services' => 'Inventory Management, Warehouse Operations, QR Tracking, Analytics Dashboards',
            'project_date' => '2025-08-01',
            'featured' => true,
            'visible' => true,
            'sort_order' => 1,
        ]);

        // ── Social links (from CV) ────────────────────────────────────────────
        $socials = [
            ['platform' => 'linkedin', 'label' => 'LinkedIn', 'url' => 'https://www.linkedin.com/in/mohammed-waleed-83098b370', 'sort_order' => 0],
            ['platform' => 'github', 'label' => 'GitHub', 'url' => null, 'sort_order' => 1],
            ['platform' => 'instagram', 'label' => 'Instagram', 'url' => null, 'sort_order' => 2],
            ['platform' => 'twitter', 'label' => 'X', 'url' => null, 'sort_order' => 3],
            ['platform' => 'youtube', 'label' => 'YouTube', 'url' => null, 'sort_order' => 4],
            ['platform' => 'behance', 'label' => 'Behance', 'url' => null, 'sort_order' => 5],
            ['platform' => 'dribbble', 'label' => 'Dribbble', 'url' => null, 'sort_order' => 6],
            ['platform' => 'whatsapp', 'label' => 'WhatsApp', 'url' => 'https://wa.me/201038191703', 'sort_order' => 7],
        ];

        foreach ($socials as $social) {
            SocialLink::updateOrCreate(
                ['platform' => $social['platform']],
                ['label' => $social['label'], 'url' => $social['url'], 'visible' => true, 'sort_order' => $social['sort_order']],
            );
        }

        // ── Site settings ─────────────────────────────────────────────────────
        $siteSettings = [
            'coming_soon' => false,
            'site_identity' => [
                'name' => 'Mohammed Waleed',
                'title' => 'Full Stack Developer',
                'email' => 'mo7ammed.engineer@gmail.com',
                'location' => 'Egypt',
                'copyright_name' => 'Mohammed Waleed',
            ],
            'footer' => [
                'tagline' => 'Full Stack Developer',
                'email' => 'mo7ammed.engineer@gmail.com',
            ],
            'nav' => [
                'cta_text' => 'Start Now',
            ],
            'whatsapp_number' => '201038191703',
            'work_section' => ['label' => 'Selected Work', 'heading' => 'Projects.'],
            'contact_section' => ['label' => 'Get In Touch'],
            'contact_heading' => ['line1' => "Let's build", 'line2' => 'something', 'line3' => 'cool.'],
            'contact_popup' => [
                'whatsapp_greeting' => 'Hi Mohammed! My name is',
                'subtitle' => 'Got a project in mind? Drop your details and I will get back to you.',
            ],
        ];

        foreach ($siteSettings as $key => $value) {
            SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        // ── SEO settings ──────────────────────────────────────────────────────
        SeoSetting::updateOrCreate(['key' => 'meta'], [
            'value' => [
                'site_name' => 'Mohammed Waleed',
                'title' => 'Mohammed Waleed — Full Stack Developer',
                'template' => '%s — Mohammed Waleed | Full Stack Developer',
                'description' => 'Results-driven Full Stack Developer with 6 years of programming experience and 4 years of independent freelance development. Scalable web applications, RESTful APIs, React, Next.js, Node.js, PHP, MySQL, and MongoDB.',
                'keywords' => [
                    'Full Stack Developer', 'Web Developer Egypt', 'React Developer',
                    'Next.js Developer', 'Node.js Developer', 'PHP Developer',
                    'REST API Developer', 'MySQL', 'MongoDB', 'Freelance Developer',
                    'TypeScript', 'GraphQL',
                ],
                'og_image' => '/og-image.png',
            ],
        ]);

        // ── Theme settings (new palette) ─────────────────────────────────────
        ThemeSetting::updateOrCreate(['key' => 'palette'], [
            'value' => [
                'background' => '#09090F',
                'surface' => '#15121F',
                'surface_light' => '#211A30',
                'primary' => '#8B5CF6',
                'secondary' => '#A78BFA',
                'accent' => '#E83252',
                'text' => '#F5F3FF',
                'muted' => '#A5A1B2',
            ],
        ]);
    }
}
