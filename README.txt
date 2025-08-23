How to deploy (GitHub -> Netlify)
1) Put these at the repo root exactly as-is.
2) In Netlify, import from Git (or re-deploy). Netlify reads netlify.toml:
   [build]
     publish = "public"
     functions = "netlify/functions"
3) After publish, verify:
   - https://YOURDOMAIN/.netlify/functions/evv-firefighter-rss  (JSON)
   - https://YOURDOMAIN/.netlify/functions/evv-police-rss      (JSON)
   - https://YOURDOMAIN/about  and  /about.html
   - https://YOURDOMAIN/firefighter.html
   - https://YOURDOMAIN/police-officer.html
4) If functions 404, you're on a static-only deploy (drag-and-drop). Switch to Git deploy or Netlify CLI:
   netlify deploy --prod --dir=public --functions=netlify/functions
