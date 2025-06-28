
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="glass border-b border-white/20 dark:border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ProStoxAI
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Stock Photo Metadata Generator
              </p>
            </div>
          </div>
          
          {/* Apple-style Theme Switcher */}
          <div className="liquid-theme-switcher">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
              aria-label="Toggle theme"
            >
              <div className="theme-toggle-track">
                <div className="theme-toggle-thumb">
                  <Sun className="theme-icon light-icon w-4 h-4" />
                  <Moon className="theme-icon dark-icon w-4 h-4" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
