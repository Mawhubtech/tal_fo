# i18n Setup Documentation

## Overview
The application now supports internationalization (i18n) with English and Arabic languages, including RTL (Right-to-Left) support for Arabic.

## Features
✅ English and Arabic language support  
✅ RTL support for Arabic  
✅ Language switcher in admin panel  
✅ Persistent language selection (saved in localStorage)  
✅ Automatic direction switching (LTR/RTL)  

## Installation
```bash
npm install i18next react-i18next
```

## File Structure
```
src/
├── i18n/
│   ├── config.ts              # i18n configuration
│   └── locales/
│       ├── en.json            # English translations
│       └── ar.json            # Arabic translations
├── components/
│   ├── LanguageToggle.tsx     # Language switcher component
│   └── useTranslation.example.tsx  # Usage example
└── layouts/
    └── AdminLayout.tsx        # Admin layout (integrated)
```

## Usage

### Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('admin.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

### Available Translation Keys

#### Common Actions
- `common.save` - Save
- `common.cancel` - Cancel
- `common.delete` - Delete
- `common.edit` - Edit
- `common.create` - Create
- `common.search` - Search

#### Navigation
- `nav.dashboard` - Dashboard
- `nav.users` - Users
- `nav.jobs` - Jobs
- `nav.candidates` - Candidates

#### Admin Panel
- `admin.title` - Admin Panel
- `admin.overview` - Overview
- `admin.userManagement` - User Management

### Adding New Translations

1. **Add to English file** (`src/i18n/locales/en.json`):
```json
{
  "mySection": {
    "myKey": "English text"
  }
}
```

2. **Add to Arabic file** (`src/i18n/locales/ar.json`):
```json
{
  "mySection": {
    "myKey": "النص العربي"
  }
}
```

3. **Use in component**:
```tsx
{t('mySection.myKey')}
```

## Language Toggle
The language toggle is automatically included in the admin panel header. Users can switch between English and Arabic by clicking the toggle button.

## RTL Support

### Automatic RTL
When Arabic is selected:
- Document direction automatically changes to RTL
- Text alignment switches to right
- Layout adjusts accordingly

### RTL-Specific Classes (in `src/index.css`)
```css
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}
```

### Manual Direction Control
If needed, you can manually handle RTL in components:
```tsx
const { i18n } = useTranslation();
const isRTL = i18n.language === 'ar';

return (
  <div className={isRTL ? 'text-right' : 'text-left'}>
    {t('my.text')}
  </div>
);
```

## Configuration

### Initialization (`src/i18n/config.ts`)
```typescript
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    ar: { translation: arTranslations }
  },
  lng: savedLanguage,
  fallbackLng: 'en',
});
```

### Document Direction
```typescript
document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = language;
```

## Testing

1. Navigate to the admin panel
2. Click the language toggle in the header
3. Verify:
   - Text changes to Arabic
   - Layout switches to RTL
   - Interface remains functional
4. Refresh the page - language should persist

## Best Practices

1. **Always use translation keys** - Don't hardcode text
2. **Keep translations organized** - Group related translations
3. **Provide context** - Use descriptive key names
4. **Test RTL layout** - Ensure UI works in both directions
5. **Check text overflow** - Arabic text might need more space

## Troubleshooting

### Issue: Translations not showing
- Check if translation key exists in both `en.json` and `ar.json`
- Verify i18n is initialized in `main.tsx`

### Issue: RTL not working
- Check if `updateDocumentDirection` is called
- Verify `src/index.css` has RTL styles

### Issue: Layout breaks in RTL
- Review flexbox and grid layouts
- Check margin/padding adjustments
- Test spacing utilities in both directions

## Future Enhancements

- [ ] Add more languages (French, Spanish, etc.)
- [ ] Implement language detection from browser
- [ ] Add translation management UI
- [ ] Support for pluralization
- [ ] Date/number formatting per locale
