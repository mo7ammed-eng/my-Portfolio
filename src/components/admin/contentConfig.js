export const CONTENT_TYPES = {
  hero: {
    label: 'Hero',
    single: true,
    titleField: 'name_line',
    fields: [
      { key: 'label', label: 'Eyebrow Label', type: 'text', required: true },
      { key: 'ghost_line', label: 'Ghost Line', type: 'text', required: true },
      { key: 'name_line', label: 'Headline', type: 'text', required: true },
      { key: 'paragraph1', label: 'Paragraph 1', type: 'textarea' },
      { key: 'paragraph2', label: 'Paragraph 2', type: 'textarea' },
      { key: 'paragraph3', label: 'Paragraph 3', type: 'textarea' },
      { key: 'cta_text', label: 'CTA Text', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
      { key: 'visible', label: 'Visible', type: 'checkbox' },
    ],
  },
  about: {
    label: 'About',
    single: true,
    titleField: 'label',
    fields: [
      { key: 'label', label: 'Eyebrow Label', type: 'text', required: true },
      { key: 'heading_line1', label: 'Heading Line 1', type: 'text', required: true },
      { key: 'heading_line2', label: 'Heading Line 2', type: 'text', required: true },
      { key: 'heading_line3', label: 'Heading Line 3', type: 'text', required: true },
      { key: 'bio', label: 'Bio Paragraphs (one per line)', type: 'lines' },
      { key: 'resume_url', label: 'Resume URL', type: 'text' },
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'visible', label: 'Visible', type: 'checkbox' },
    ],
  },
  skills: {
    label: 'Skills',
    single: false,
    titleField: 'name',
    fields: [
      { key: 'skill_category_id', label: 'Category', type: 'select', optionsFrom: 'skill-categories', required: true },
      { key: 'name', label: 'Skill Name', type: 'text', required: true },
      { key: 'icon', label: 'Icon', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
      { key: 'visible', label: 'Visible', type: 'checkbox' },
    ],
  },
  'skill-categories': {
    label: 'Skill Categories',
    single: false,
    titleField: 'name',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'label', label: 'Display Label', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ],
  },
  experiences: {
    label: 'Experience',
    single: false,
    titleField: 'role',
    fields: [
      { key: 'role', label: 'Role', type: 'text', required: true },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'start_date', label: 'Start (e.g. 2021)', type: 'text' },
      { key: 'end_date', label: 'End (e.g. Present)', type: 'text' },
      { key: 'is_current', label: 'Current Role', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
      { key: 'visible', label: 'Visible', type: 'checkbox' },
    ],
  },
  services: {
    label: 'Services',
    single: false,
    titleField: 'title',
    fields: [
      { key: 'num', label: 'Number', type: 'text', required: true },
      { key: 'label', label: 'Label', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'icon', label: 'Icon', type: 'text' },
      { key: 'href', label: 'Link', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
      { key: 'visible', label: 'Visible', type: 'checkbox' },
    ],
  },
  testimonials: {
    label: 'Testimonials',
    single: false,
    titleField: 'author',
    fields: [
      { key: 'author', label: 'Author', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      { key: 'rating', label: 'Rating (1-5)', type: 'number' },
      { key: 'avatar', label: 'Avatar', type: 'image' },
      { key: 'approved', label: 'Approved', type: 'checkbox' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ],
  },
  blog: {
    label: 'Blog',
    single: false,
    titleField: 'title',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'cover_image', label: 'Cover Image', type: 'image' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] },
      { key: 'published_at', label: 'Published At', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'number' },
    ],
  },
};

export const CONTENT_ORDER = ['hero', 'about', 'skills', 'skill-categories', 'experiences', 'services', 'testimonials', 'blog'];

export function defaultsFor(type) {
  const config = CONTENT_TYPES[type];
  const value = {};
  config.fields.forEach((field) => {
    if (field.type === 'checkbox') value[field.key] = field.key === 'visible' || field.key === 'approved';
    else if (field.type === 'number') value[field.key] = field.key === 'rating' ? 5 : 0;
    else if (field.type === 'lines') value[field.key] = '';
    else value[field.key] = '';
  });
  return value;
}
