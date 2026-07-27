# Tema Sistemi

## Tasarım anlayışı
Modern, minimalist, kurumsal. Referans alınan uygulamalar: Linear, GitHub, Notion, Material Design 3. Amaç: boş alanı doğru kullanan, karmaşık olmayan, premium hissi veren bir arayüz.

## Renk paleti

Ana renk: **`#1E3A8A`** (koyu lacivert, kurumsal görünüm) — hem light hem dark temada aynı primary kullanılır, değişen arka plan/yüzey tonlarıdır.

Tema dosyasında tutulması gereken token'lar:
- `primary`
- `background`
- `surface`
- `text`
- `border`
- `error`
- `success`
- `warning`

## Örnek `theme.ts` yapısı

```ts
// theme/colors.ts
export const palette = {
  primary: '#1E3A8A',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
} as const;

export const lightTheme = {
  ...palette,
  background: '#FFFFFF',
  surface: '#F5F6FA',
  text: '#0F172A',
  border: '#E2E8F0',
};

export const darkTheme = {
  ...palette,
  background: '#0B1120',
  surface: '#111827',
  text: '#F1F5F9',
  border: '#1F2937',
};

export type AppTheme = typeof lightTheme;
```

```ts
// theme/ThemeProvider.tsx
const ThemeContext = createContext<{ theme: AppTheme; toggleTheme: () => void }>(...);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const mode = useThemeStore((s) => s.mode); // 'light' | 'dark', Zustand'da tutulur
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => useThemeStore.getState().toggle() }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Kurallar
- Component içinde asla `'#1E3A8A'` gibi hardcoded hex kullanılmaz; her zaman `theme.primary` gibi token üzerinden erişilir.
- Yeni bir renk ihtiyacı doğarsa önce bu token listesine eklenir, sonra kullanılır — component-local renk tanımı yapılmaz.
- Tema seçimi (`mode: 'light' | 'dark'`) Zustand'da tutulur (bkz. `tech-stack.md` → Zustand bölümü), AsyncStorage ile kalıcı hale getirilmesi önerilir.
- Spacing/typography için de benzer bir merkezi yaklaşım önerilir (`theme/spacing.ts`, `theme/typography.ts`) — proje dokümanında netleşmemiş, gerekirse kullanıcıya önerilebilir.
