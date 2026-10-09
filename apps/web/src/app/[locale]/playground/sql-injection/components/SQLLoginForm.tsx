import { User, Lock, Database, RotateCcw, Unlock } from 'lucide-react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SQLLoginFormProps {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export function SQLLoginForm({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onReset,
}: SQLLoginFormProps) {
  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-warning" />
          Secure login portal
        </span>
      }
      description="Enter your credentials to access the system"
      actions={
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw />
          Reset
        </Button>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Username
          </span>
          <Input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Enter username..."
            className="font-mono"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password
          </span>
          <Input
            type="text"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter password..."
            className="font-mono"
          />
        </label>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Unlock className="h-3 w-3" /> SQL query visible below
          </p>
          <Button type="submit" disabled={!username.trim()}>
            Login
          </Button>
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-2 rounded-md border border-border bg-background p-4">
        <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Database className="h-3 w-3" />
          SQL query preview
        </p>
        <code className="break-all font-mono text-sm text-success">
          SELECT * FROM users WHERE username={`'${username || '...'}'`} AND password={`'${password || '...'}'`}
        </code>
      </div>
    </Panel>
  );
}
