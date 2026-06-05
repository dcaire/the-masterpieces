# Static assets

Files in this folder are served from the site root (e.g. `public/ensemble.jpg` → `/ensemble.jpg`).

## Group photo

To show the group photo on the dashboard, add the ensemble photo here named **`ensemble.jpg`**:

```
public/ensemble.jpg
```

It will appear automatically in the dashboard "mission" hero. If the file is absent,
the app falls back to a text-only mission banner (no broken image).

### Photo in emails (optional)

Emails can't read local files, so to show the photo atop email templates you need a
**public https:// URL**. Once the site is deployed (Netlify), the photo will live at
`https://<your-site>/ensemble.jpg`. Paste that URL into `BAND_PHOTO_URL` near the top of
`src/email.js` and it will appear in every email header.
