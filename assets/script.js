
// Simple theme toggler and mobile menu (if needed)
(function(){
  const btn = document.querySelector('[data-theme-toggle]');
  if(!btn) return;
  const get = () => localStorage.getItem('theme');
  const set = (v) => localStorage.setItem('theme', v);

  const apply = () => {
    const pref = get();
    if(pref === 'light') document.documentElement.setAttribute('data-theme','light')
    else if(pref === 'dark') document.documentElement.setAttribute('data-theme','dark')
    else document.documentElement.removeAttribute('data-theme')
  };
  apply();

  btn.addEventListener('click', () => {
    const cur = get();
    const next = cur === 'dark' ? 'light' : 'dark';
    set(next);
    apply();
  });
})();
