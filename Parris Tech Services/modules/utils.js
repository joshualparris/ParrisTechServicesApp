export function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2, 10);
}

export function formatCurrency(value) {
  const number = Number(value) || 0;
  return `$${number.toFixed(2)}`;
}

export function isToday(dateString) {
  const d = new Date(dateString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// Render a simple template string with {{vars}} replaced by values from `ctx`.
// Example: renderTemplate('Hello {{name}}', {name: 'Kate'}) => 'Hello Kate'
export function renderTemplate(template, ctx = {}){
  if (typeof template !== 'string') return '';
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (m, key)=>{
    // support nested keys like user.name
    const parts = key.split('.');
    let v = ctx;
    for (const p of parts){
      if (v == null) return '';
      v = v[p];
    }
    return (v === undefined || v === null) ? '' : String(v);
  });
}
