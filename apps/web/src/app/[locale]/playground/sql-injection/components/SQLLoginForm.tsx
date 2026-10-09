import { User, Lock, Database, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SQLLoginFormProps {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SQLLoginForm({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: SQLLoginFormProps) {
  return (
    <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
      {/* Form Header */}
      <div className="p-6 border-b border-border bg-muted">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Secure Login Portal</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access the system</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={onSubmit} className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="Enter username..."
              className="font-mono"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <Input
              type="text"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter password..."
              className="font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Unlock className="w-3 h-3" /> SQL Query visible below
          </p>
          <Button
            type="submit"
            disabled={!username.trim()}
            className="bg-warning hover:bg-warning/90 disabled:bg-muted disabled:text-muted-foreground"
          >
            Login
          </Button>
        </div>
      </form>

      {/* Query Preview */}
      <div className="px-6 pb-6">
        <div className="p-4 rounded-lg bg-background border border-input">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            <Database className="w-3 h-3" />
            SQL Query Preview:
          </p>
          <code className="text-sm text-success font-mono break-all">
            SELECT * FROM users WHERE username={`'${username || "..."}'`} AND password={`'${password || "..."}'`}
          </code>
        </div>
      </div>
    </div>
  );
}
