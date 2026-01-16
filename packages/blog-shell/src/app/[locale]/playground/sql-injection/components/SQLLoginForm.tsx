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
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Form Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Secure Login Portal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter your credentials to access the system</p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={onSubmit} className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
            <Unlock className="w-3 h-3" /> SQL Query visible below
          </p>
          <Button
            type="submit"
            disabled={!username.trim()}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400"
          >
            Login
          </Button>
        </div>
      </form>

      {/* Query Preview */}
      <div className="px-6 pb-6">
        <div className="p-4 rounded-lg bg-gray-900 dark:bg-black border border-gray-700">
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
            <Database className="w-3 h-3" />
            SQL Query Preview:
          </p>
          <code className="text-sm text-green-400 font-mono break-all">
            SELECT * FROM users WHERE username={`'${username || "..."}'`} AND password={`'${password || "..."}'`}
          </code>
        </div>
      </div>
    </div>
  );
}
